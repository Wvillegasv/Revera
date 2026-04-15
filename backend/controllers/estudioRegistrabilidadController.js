const fs = require("fs");
const {
  registrarEstudioRegistrabilidad,
} = require("../services/estudioRegistrabilidadService");
const {
  enviarEstudioRegistrabilidad,
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

async function crearEstudioRegistrabilidad(req, res) {
  try {
    const resultado = await registrarEstudioRegistrabilidad({
      body: req.body,
      files: req.files || [],
    });

    let correoEnviado = false;
    let detalleCorreo = null;

    try {
      const destinatarios = process.env.REVERA_ESTUDIO_DESTINATARIOS
        ? process.env.REVERA_ESTUDIO_DESTINATARIOS.split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : process.env.SMTP_TO
        ? process.env.SMTP_TO.split(",")
            .map((x) => x.trim())
            .filter(Boolean)
        : [];

      if (destinatarios.length === 0) {
        throw new Error(
          "No hay destinatarios configurados. Define REVERA_ESTUDIO_DESTINATARIOS o SMTP_TO en .env"
        );
      }

      await enviarEstudioRegistrabilidad({
        destinatarios,
        nombreCompleto: resultado.nombreCompleto,
        correo: resultado.correo,
        telefono: `${resultado.codigoPais} ${resultado.telefono}`,
        nombreMarca: resultado.nombreMarca,
        descripcionProductoServicio: resultado.descripcionProductoServicio,
        sectorClase: resultado.sectorClase,
        files: resultado.files || [],
      });

      correoEnviado = true;
    } catch (errorCorreo) {
      detalleCorreo = errorCorreo.message;
      console.error("Error enviando correo de estudio de registrabilidad:", errorCorreo);
    }

    return res.status(201).json({
      ok: true,
      correoEnviado,
      message: correoEnviado
        ? "Gracias por solicitar el estudio de registrabilidad. Revisaremos la información y nos comunicaremos contigo pronto."
        : "La solicitud fue registrada correctamente, pero ocurrió un problema al enviar el correo al abogado.",
      data: {
        estudioId: resultado.estudioId,
        personaId: resultado.personaId,
        tieneImagenes: resultado.tieneImagenes,
        totalImagenes: resultado.totalImagenes,
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
        "Ocurrió un error al registrar la solicitud de estudio de registrabilidad.",
    });
  }
}

module.exports = {
  crearEstudioRegistrabilidad,
};