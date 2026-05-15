const {
  obtenerArticulos,
  obtenerArticuloPorSlug,
} = require("../services/articulosService");

async function listarArticulos(req, res) {
  try {
    const articulos = await obtenerArticulos();

    return res.json({
      ok: true,
      data: articulos,
    });
  } catch (error) {
    console.error("Error listando artículos:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al listar artículos",
      error: error.message,
    });
  }
}

async function obtenerDetalleArticulo(req, res) {
  try {
    const { slug } = req.params;

    const articulo = await obtenerArticuloPorSlug(slug);

    if (!articulo) {
      return res.status(404).json({
        ok: false,
        mensaje: "Artículo no encontrado",
      });
    }

    return res.json({
      ok: true,
      data: articulo,
    });
  } catch (error) {
    console.error("Error obteniendo artículo:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener artículo",
      error: error.message,
    });
  }
}

module.exports = {
  listarArticulos,
  obtenerDetalleArticulo,
};