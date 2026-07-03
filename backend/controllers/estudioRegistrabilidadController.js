const fs = require("fs");

const {
  registrarEstudioRegistrabilidad,
} = require("../services/estudioRegistrabilidadService");

const {
  enviarEstudioRegistrabilidad,
  enviarConfirmacionRadiografiaMarcaUsuario,
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

function obtenerDestinatariosRadiografia() {
  const valorConfigurado =
    process.env.REVERA_ESTUDIO_DESTINATARIOS || process.env.SMTP_TO || "";

  return valorConfigurado
    .split(",")
    .map((correo) => correo.trim())
    .filter(Boolean);
}

async function crearEstudioRegistrabilidad(req, res) {
  try {
    const resultado = await registrarEstudioRegistrabilidad({
      body: req.body,
      files: req.files || [],
    });

    let correoInternoEnviado = false;
    let correoClienteEnviado = false;
    let detalleCorreo = null;

    try {
      const destinatarios = obtenerDestinatariosRadiografia();

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
        descripcionProductoServicio:
          resultado.descripcionProductoServicio,
        sectorClase: resultado.sectorClase,
        files: resultado.files || [],
      });

      correoInternoEnviado = true;

      await enviarConfirmacionRadiografiaMarcaUsuario({
        correoUsuario: resultado.correo,
      });

      correoClienteEnviado = true;
    } catch (errorCorreo) {
      detalleCorreo = errorCorreo.message;

      console.error(
        "Error enviando correos de Radiografía de Marca:",
        errorCorreo
      );
    }

    const correosEnviadosCorrectamente =
      correoInternoEnviado && correoClienteEnviado;

    return res.status(201).json({
      ok: true,
      correoEnviado: correosEnviadosCorrectamente,
      correoInternoEnviado,
      correoClienteEnviado,
      message: correosEnviadosCorrectamente
        ? "Gracias por solicitar la Radiografía de Marca. Revisaremos la información y nos comunicaremos contigo pronto."
        : "La solicitud fue registrada correctamente, pero ocurrió un problema al enviar uno o ambos correos.",
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

    console.error("Error en crearEstudioRegistrabilidad:", {
      message: error.message,
      statusCode: error.statusCode || 500,
    });

    return res.status(error.statusCode || 500).json({
      ok: false,
      message:
        error.message ||
        "Ocurrió un error al registrar la solicitud de Radiografía de Marca.",
    });
  }
}

module.exports = {
  crearEstudioRegistrabilidad,
};