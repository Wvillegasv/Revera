const {
  registrarRadiografiaMarca,
} = require("../services/radiografiaMarcaService");

function parseBody(req) {
  if (req.body.data) {
    return JSON.parse(req.body.data);
  }

  return req.body;
}

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
    if (!data[campo] || String(data[campo]).trim() === "") {
      return `El campo ${campo} es obligatorio.`;
    }
  }

  return null;
}

async function crearRadiografiaMarca(req, res) {
  try {
    console.log("Entró a crearRadiografiaMarca");
    console.log("Body recibido:", req.body);
    console.log("Archivo recibido:", req.file);

    const data = parseBody(req);
    const error = validarPayload(data);

    if (error) {
      return res.status(400).json({
        ok: false,
        mensaje: error,
      });
    }

    const result = await registrarRadiografiaMarca(data, req.file || null);

    return res.status(201).json({
      ok: true,
      mensaje: "Radiografía de Marca registrada correctamente.",
      data: result,
    });
  } catch (error) {
    console.error("Error registrando Radiografía de Marca:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error registrando Radiografía de Marca.",
      error: error.message,
    });
  }
}

module.exports = {
  crearRadiografiaMarca,
};