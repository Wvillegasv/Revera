require("dotenv").config();

const pool = require("../config/db");

const {
  registrarCita,
  obtenerCorreosNotificacion,
  existeCitaActivaEnHorario,
  obtenerHorariosOcupadosPorFecha,
} = require("../services/citasService");

const {
  enviarAgendaCitaInterna,
  enviarConfirmacionAgendaUsuario,
} = require("../services/emailService");

const { DB_USER } = process.env;

const HORARIOS_PERMITIDOS = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const OPCIONES_CONSULTA = [
  "Registro de marca",
  "Estudio de registrabilidad",
  "Uso indebido de marca",
  "Renovación de marca",
  "Otra consulta",
];

function obtenerFechaHoyLocal() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function construirMotivoCita(body) {
  const partes = [];

  if (body.ac_asunto_consulta) {
    partes.push(`Asunto: ${String(body.ac_asunto_consulta).trim()}`);
  }

  if (body.ac_descripcion_consulta && String(body.ac_descripcion_consulta).trim()) {
    partes.push(`Descripción: ${String(body.ac_descripcion_consulta).trim()}`);
  }

  return partes.join(" | ");
}

function validarDatosCita(body) {
  const errores = [];

  if (!body.ac_nombre || String(body.ac_nombre).trim().length < 10) {
    errores.push("El nombre completo es obligatorio y debe tener al menos 10 caracteres");
  }

  if (!body.ac_correo) {
    errores.push("El correo electrónico es obligatorio");
  }

  if (!body.ac_telefono) {
    errores.push("El teléfono es obligatorio");
  }

  if (!body.ac_asunto_consulta) {
    errores.push("Debe seleccionar el motivo principal de la consulta");
  }

  if (
    body.ac_asunto_consulta &&
    !OPCIONES_CONSULTA.includes(String(body.ac_asunto_consulta).trim())
  ) {
    errores.push("La opción seleccionada para el motivo principal no es válida");
  }

  if (
    !body.ac_descripcion_consulta ||
    String(body.ac_descripcion_consulta).trim().length < 20
  ) {
    errores.push("La descripción de la consulta debe tener al menos 20 caracteres");
  }

  if (!body.ac_fecha_cita) {
    errores.push("La fecha de la cita es obligatoria");
  }

  if (!body.ac_hora_cita) {
    errores.push("La hora de la cita es obligatoria");
  }

  if (body.ac_hora_cita && !HORARIOS_PERMITIDOS.includes(body.ac_hora_cita)) {
    errores.push("La hora seleccionada no es válida");
  }

  return errores;
}

async function crearCita(req, res) {
  try {
    const errores = validarDatosCita(req.body);

    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "Datos incompletos o inválidos",
        errores,
      });
    }

    const hoy = obtenerFechaHoyLocal();

    if (req.body.ac_fecha_cita < hoy) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se puede registrar una cita en una fecha pasada",
      });
    }

    const horarioOcupado = await existeCitaActivaEnHorario(
      pool,
      req.body.ac_fecha_cita,
      req.body.ac_hora_cita
    );

    if (horarioOcupado) {
      return res.status(409).json({
        ok: false,
        mensaje: "La fecha y hora seleccionadas ya no están disponibles",
      });
    }

    const ac_motivo_cita = construirMotivoCita(req.body);

    const bodyParaGuardar = {
      ...req.body,
      ac_identificacion: req.body.ac_identificacion || "N/A",
      ac_otro_motivo: "",
      ac_motivo_cita,
    };

    const result = await registrarCita(pool, DB_USER, bodyParaGuardar);

    let correoInternoEnviado = false;
    let correoUsuarioEnviado = false;
    let mensajeCorreo = "";

    try {
      const correosInternos = await obtenerCorreosNotificacion(pool);

      if (correosInternos.length > 0) {
        await enviarAgendaCitaInterna({
          destinatarios: correosInternos,
          data: bodyParaGuardar,
        });

        correoInternoEnviado = true;
      }

      if (req.body.ac_correo) {
        await enviarConfirmacionAgendaUsuario({
          correoUsuario: req.body.ac_correo,
          nombreCompleto: req.body.ac_nombre,
          fechaCita: req.body.ac_fecha_cita,
          horaCita: req.body.ac_hora_cita,
          asuntoConsulta: req.body.ac_asunto_consulta,
        });

        correoUsuarioEnviado = true;
      }

      if (correoInternoEnviado && correoUsuarioEnviado) {
        mensajeCorreo = "Correos enviados correctamente";
      } else if (correoInternoEnviado) {
        mensajeCorreo = "Se envió el correo interno, pero no la confirmación al usuario";
      } else if (correoUsuarioEnviado) {
        mensajeCorreo = "Se envió confirmación al usuario, pero no el correo interno";
      } else {
        mensajeCorreo = "No se enviaron correos";
      }
    } catch (errorCorreo) {
      console.log("Error enviando correos de cita:", errorCorreo);
      mensajeCorreo = "La cita se registró pero ocurrió un error al enviar los correos";
    }

    return res.status(201).json({
      ok: true,
      mensaje: "Cita registrada correctamente",
      id: result.insertId,
      correoInternoEnviado,
      correoUsuarioEnviado,
      mensajeCorreo,
    });
  } catch (error) {
    console.log("Error MySQL:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al registrar la cita",
      error: error.message,
    });
  }
}

async function consultarHorariosDisponibles(req, res) {
  try {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debe indicar la fecha",
      });
    }

    const hoy = obtenerFechaHoyLocal();

    if (fecha < hoy) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se pueden consultar horarios para una fecha pasada",
      });
    }

    const horariosOcupados = await obtenerHorariosOcupadosPorFecha(pool, fecha);

    const horariosDisponibles = HORARIOS_PERMITIDOS.filter(
      (hora) => !horariosOcupados.includes(hora)
    );

    return res.json({
      ok: true,
      fecha,
      horariosPermitidos: HORARIOS_PERMITIDOS,
      horariosOcupados,
      horariosDisponibles,
    });
  } catch (error) {
    console.log("Error consultando horarios:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al consultar horarios disponibles",
      error: error.message,
    });
  }
}

function probarBackend(req, res) {
  return res.json({
    ok: true,
    mensaje: "Backend conectado",
  });
}

module.exports = {
  crearCita,
  consultarHorariosDisponibles,
  probarBackend,
};