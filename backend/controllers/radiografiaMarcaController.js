const {
  registrarRadiografiaMarca,
} = require("../services/radiografiaMarcaService");

/**
 * Convierte el body recibido.
 *
 * Cuando la solicitud usa multipart/form-data, el frontend envía
 * la información dentro del campo "data" como texto JSON.
 */
function parseBody(req) {
  if (!req.body) {
    return {};
  }

  if (req.body.data) {
    try {
      return JSON.parse(req.body.data);
    } catch (error) {
      const parseError = new Error(
        "El campo data no contiene un JSON válido."
      );

      parseError.statusCode = 400;
      throw parseError;
    }
  }

  return req.body;
}

/**
 * Valida los campos indispensables de la Radiografía de Marca.
 */
function validarPayload(data) {
  const camposObligatorios = [
    "nombreMarca",
    "estadoUso",
    "tipoProductoServicio",
    "fraseSimple",
    "alcanceUso",
    "existenMarcasSimilares",
    "diferenciador",
    "tipoMarcaVisual",
    "haVendido",
    "preguntaClave",
    "nombreCompletoContacto",
    "correoContacto",
  ];

  for (const campo of camposObligatorios) {
    const valor = data?.[campo];

    if (valor === undefined || valor === null || String(valor).trim() === "") {
      return `El campo ${campo} es obligatorio.`;
    }
  }

  const correo = String(data.correoContacto).trim();

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!correoValido.test(correo)) {
    return "El correo electrónico no tiene un formato válido.";
  }

  return null;
}

async function crearRadiografiaMarca(req, res) {
  try {
    console.log("Entró a crearRadiografiaMarca");
    console.log("Body recibido:", req.body);

    /*
      undefined es válido cuando el archivo o logotipo es opcional.
    */
    console.log(
      "Archivo recibido:",
      req.file
        ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
          }
        : "Sin archivo adjunto"
    );

    const data = parseBody(req);
    const errorValidacion = validarPayload(data);

    if (errorValidacion) {
      return res.status(400).json({
        ok: false,
        mensaje: errorValidacion,
      });
    }

    console.log("Iniciando registro de Radiografía de Marca:", {
      nombreMarca: data.nombreMarca,
      correoContacto: data.correoContacto,
      tieneArchivo: Boolean(req.file),
    });

    const result = await registrarRadiografiaMarca(
      data,
      req.file || null
    );

    console.log("Resultado de registrarRadiografiaMarca:", result);

    return res.status(201).json({
      ok: true,
      mensaje: "Radiografía de Marca registrada correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error registrando Radiografía de Marca:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      stack: error.stack,
    });

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      ok: false,
      mensaje:
        statusCode === 400
          ? error.message
          : "Error registrando Radiografía de Marca.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
}

module.exports = {
  crearRadiografiaMarca,
};