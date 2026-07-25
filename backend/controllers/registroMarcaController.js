const fs = require("fs");
const {
  registrarSolicitudRegistroMarca,
} = require("../services/registroMarcaService");
const {
  enviarSolicitudRegistroMarca,
  enviarConfirmacionRegistroMarcaUsuario,
} = require("../services/emailService");

function limpiarArchivosSubidos(files = []) {
  for (const file of files) {
    try {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error(
        "No se pudo eliminar archivo temporal:",
        file?.path,
        error.message
      );
    }
  }
}

function construirResultadoNotificacion(resultado) {
  if (resultado.status === "fulfilled") {
    return {
      enviada: true,
      accepted: resultado.value?.accepted || [],
      rejected: resultado.value?.rejected || [],
      response: resultado.value?.response || null,
      messageId: resultado.value?.messageId || null,
      error: null,
    };
  }

  return {
    enviada: false,
    accepted: [],
    rejected: [],
    response: null,
    messageId: null,
    error:
      resultado.reason?.message ||
      "Error desconocido enviando correo.",
  };
}

function normalizarListaCorreos(valor) {
  if (!valor) {
    return [];
  }

  const lista = Array.isArray(valor)
    ? valor
    : String(valor).split(",");

  return lista
    .map((correo) => String(correo).trim().toLowerCase())
    .filter(Boolean);
}

async function crearSolicitudRegistroMarca(req, res) {
  try {
    const resultado = await registrarSolicitudRegistroMarca({
      body: req.body,
      files: req.files || [],
    });

    const correoCliente = String(
      resultado.payload?.correo || ""
    )
      .trim()
      .toLowerCase();

    const destinatariosBaseDatos = normalizarListaCorreos(
      resultado.destinatarios
    );

    const destinatariosConfigurados = normalizarListaCorreos(
      process.env.SMTP_NOTIFICATION_TO ||
        process.env.SMTP_USER ||
        ""
    );

    const destinatariosInternos = [
      ...new Set([
        ...destinatariosBaseDatos,
        ...destinatariosConfigurados,
      ]),
    ].filter((correo) => correo !== correoCliente);

    console.log(
      "Iniciando correos de Registro Estratégico de Marca:",
      {
        solicitudId: resultado.solicitudId,
        destinatariosInternos,
        correoCliente,
        totalArchivos: resultado.files?.length || 0,
      }
    );

    const promesaCorreoInterno =
      destinatariosInternos.length > 0
        ? enviarSolicitudRegistroMarca({
            destinatarios: destinatariosInternos,
            payload: resultado.payload,
            files: resultado.files || [],
          })
        : Promise.reject(
            new Error(
              "No se encontraron correos destinatarios activos para Registro de Marca."
            )
          );

    const promesaCorreoCliente = correoCliente
      ? enviarConfirmacionRegistroMarcaUsuario({
          correoUsuario: correoCliente,
          nombreCompleto:
            resultado.payload?.nombreCompleto,
          nombreMarca: resultado.payload?.nombreMarca,
        })
      : Promise.reject(
          new Error(
            "No se recibió el correo del cliente para enviar la confirmación."
          )
        );

    const [resultadoInterno, resultadoCliente] =
      await Promise.allSettled([
        promesaCorreoInterno,
        promesaCorreoCliente,
      ]);

    const notificaciones = {
      interna:
        construirResultadoNotificacion(resultadoInterno),
      cliente:
        construirResultadoNotificacion(resultadoCliente),
    };

    if (!notificaciones.interna.enviada) {
      console.error(
        "Error enviando notificación interna de Registro de Marca:",
        resultadoInterno.reason
      );
    }

    if (!notificaciones.cliente.enviada) {
      console.error(
        "Error enviando confirmación al cliente de Registro de Marca:",
        resultadoCliente.reason
      );
    }

    console.log(
      "Resultado final de correos de Registro Estratégico de Marca:",
      notificaciones
    );

    const correoEnviado =
      notificaciones.interna.enviada &&
      notificaciones.cliente.enviada;

    return res.status(201).json({
      ok: true,
      correoEnviado,
      message: correoEnviado
        ? "Su solicitud de registro de marca ha sido enviada correctamente. Nos pondremos en contacto con usted."
        : "La solicitud fue registrada correctamente, pero uno o más correos no pudieron enviarse.",
      data: {
        solicitudId: resultado.solicitudId,
        personaId: resultado.personaId,
        totalAdjuntos: resultado.totalAdjuntos,
        notificaciones,
      },
    });
  } catch (error) {
    limpiarArchivosSubidos(req.files || []);

    console.error(
      "Error en crearSolicitudRegistroMarca:",
      {
        message: error.message,
        statusCode: error.statusCode || 500,
        code: error.code,
        command: error.command,
        response: error.response,
      }
    );

    return res.status(error.statusCode || 500).json({
      ok: false,
      message:
        error.message ||
        "Ocurrió un error al registrar la solicitud de registro de marca.",
    });
  }
}

module.exports = {
  crearSolicitudRegistroMarca,
};
