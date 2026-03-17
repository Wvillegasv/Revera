require("dotenv").config()

const pool = require("../config/db")

const {
  registrarCita,
  obtenerCorreosNotificacion,
  existeCitaActivaEnHorario,
  obtenerHorariosOcupadosPorFecha
} = require("../services/citasService")

const {
  enviarSolicitudRegistrabilidad
} = require("../services/mailService")

const { DB_USER } = process.env

const HORARIOS_PERMITIDOS = ["09:00", "10:00", "11:00", "14:00", "15:00"]

function obtenerFechaHoyLocal() {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, "0")
  const day = String(hoy.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function validarDatosCita(body) {
  const errores = []

  if (!body.ac_nombre || String(body.ac_nombre).trim().length < 10) {
    errores.push("El nombre completo es obligatorio y debe tener al menos 10 caracteres")
  }

  if (!body.ac_correo) {
    errores.push("El correo electrónico es obligatorio")
  }

  if (!body.ac_telefono) {
    errores.push("El teléfono es obligatorio")
  }

  if (!body.ac_motivo_cita || String(body.ac_motivo_cita).trim().length < 20) {
    errores.push("El motivo de la cita debe tener al menos 20 caracteres")
  }

  if (!body.ac_fecha_cita) {
    errores.push("La fecha de la cita es obligatoria")
  }

  if (!body.ac_hora_cita) {
    errores.push("La hora de la cita es obligatoria")
  }

  if (body.ac_hora_cita && !HORARIOS_PERMITIDOS.includes(body.ac_hora_cita)) {
    errores.push("La hora seleccionada no es válida")
  }

  return errores
}

async function crearCita(req, res) {
  try {
    console.log("Body recibido:", req.body)

    const errores = validarDatosCita(req.body)

    if (errores.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: "Datos incompletos o inválidos",
        errores
      })
    }

    const hoy = obtenerFechaHoyLocal()

    if (req.body.ac_fecha_cita < hoy) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se puede registrar una cita en una fecha pasada"
      })
    }

    const horarioOcupado = await existeCitaActivaEnHorario(
      pool,
      req.body.ac_fecha_cita,
      req.body.ac_hora_cita
    )

    if (horarioOcupado) {
      return res.status(409).json({
        ok: false,
        mensaje: "La fecha y hora seleccionadas ya no están disponibles"
      })
    }

    const result = await registrarCita(pool, DB_USER, req.body)

    console.log("Cita registrada ID:", result.insertId)

    let correoEnviado = false
    let mensajeCorreo = ""

    try {
      const correosInternos = await obtenerCorreosNotificacion(pool)

      const correosDestino = [
        req.body.ac_correo,
        ...correosInternos
      ].filter(Boolean)

      if (correosDestino.length > 0) {
        await enviarSolicitudRegistrabilidad({
          ...req.body,
          correosDestino
        })

        correoEnviado = true
        mensajeCorreo = "Correo enviado correctamente"
        console.log("Correo enviado correctamente")
      } else {
        mensajeCorreo = "No hay destinatarios configurados para enviar notificación"
        console.log("No hay destinatarios de correo")
      }
    } catch (errorCorreo) {
      console.log("Error enviando correo:", errorCorreo)
      correoEnviado = false
      mensajeCorreo = "La cita se registró pero ocurrió un error al enviar el correo"
    }

    return res.status(201).json({
      ok: true,
      mensaje: "Cita registrada correctamente",
      id: result.insertId,
      correoEnviado,
      mensajeCorreo
    })

  } catch (error) {
    console.log("Error MySQL:", error)

    return res.status(500).json({
      ok: false,
      mensaje: "Error al registrar la cita",
      error: error.message
    })
  }
}

async function consultarHorariosDisponibles(req, res) {
  try {
    const { fecha } = req.query

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debe indicar la fecha"
      })
    }

    const hoy = obtenerFechaHoyLocal()

    if (fecha < hoy) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se pueden consultar horarios para una fecha pasada"
      })
    }

    const horariosOcupados = await obtenerHorariosOcupadosPorFecha(pool, fecha)

    const horariosDisponibles = HORARIOS_PERMITIDOS.filter(
      (hora) => !horariosOcupados.includes(hora)
    )

    return res.json({
      ok: true,
      fecha,
      horariosPermitidos: HORARIOS_PERMITIDOS,
      horariosOcupados,
      horariosDisponibles
    })
  } catch (error) {
    console.log("Error consultando horarios:", error)

    return res.status(500).json({
      ok: false,
      mensaje: "Error al consultar horarios disponibles",
      error: error.message
    })
  }
}

function probarBackend(req, res) {
  return res.json({
    ok: true,
    mensaje: "Backend conectado"
  })
}

module.exports = {
  crearCita,
  consultarHorariosDisponibles,
  probarBackend
}
