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
      console.error("No se pudo eliminar archivo temporal:", file?.path, error.message);
    }
  }
}

async function crearSolicitudRegistroMarca(req, res) {
  try {
    const resultado = await registrarSolicitudRegistroMarca({
      body: req.body,
      files: req.files || [],
    });

    let correoEnviado = false;
    let detalleCorreo = null;

    try {
      const destinatarios = Array.isArray(resultado.destinatarios)
        ? resultado.destinatarios
        : [];

      if (destinatarios.length === 0) {
        throw new Error(
          "No se encontraron correos destinatarios activos para Registro de Marca."
        );
      }

      await enviarSolicitudRegistroMarca({
        destinatarios,
        payload: resultado.payload,
        files: resultado.files || [],
      });

      await enviarConfirmacionRegistroMarcaUsuario({
        correoUsuario: resultado.payload.correo,
        nombreCompleto: resultado.payload.nombreCompleto,
        nombreMarca: resultado.payload.nombreMarca,
      });

      correoEnviado = true;
    } catch (errorCorreo) {
      detalleCorreo = errorCorreo.message;
      console.error("Error enviando correo de registro de marca:", errorCorreo);
    }

    return res.status(201).json({
      ok: true,
      correoEnviado,
      message: correoEnviado
        ? "Su solicitud de registro de marca ha sido enviada correctamente. Nos pondremos en contacto con usted."
        : "La solicitud fue registrada correctamente, pero ocurrió un problema al enviar el correo.",
      data: {
        solicitudId: resultado.solicitudId,
        personaId: resultado.personaId,
        totalAdjuntos: resultado.totalAdjuntos,
        detalleCorreo,
      },
    });
  } catch (error) {
    limpiarArchivosSubidos(req.files || []);

    console.error("Error en crearSolicitudRegistroMarca:", {
      message: error.message,
      statusCode: error.statusCode || 500,
    });

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