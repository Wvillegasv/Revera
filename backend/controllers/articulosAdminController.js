const {
  listarArticulos,
  obtenerArticuloPorId,
  crearArticulo,
  actualizarArticulo,
  cambiarEstadoArticulo,
  eliminarArticuloLogico,
  crearBloque,
  actualizarBloque,
  eliminarBloqueLogico,
  crearRelacionado,
  eliminarRelacionado,
  registrarImagenArticulo,
} = require("../services/articulosAdminService");

async function listarArticulosAdmin(req, res) {
  try {
    const articulos = await listarArticulos();

    return res.json({
      ok: true,
      data: articulos,
    });
  } catch (error) {
    console.error("Error listando artículos admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al listar artículos admin",
      error: error.message,
    });
  }
}

async function obtenerArticuloAdminPorId(req, res) {
  try {
    const { id } = req.params;

    const articulo = await obtenerArticuloPorId(id);

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
    console.error("Error obteniendo artículo admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al obtener artículo admin",
      error: error.message,
    });
  }
}

async function crearArticuloAdmin(req, res) {
  try {
    const articulo = await crearArticulo(req.body);

    return res.status(201).json({
      ok: true,
      mensaje: "Artículo creado correctamente",
      data: articulo,
    });
  } catch (error) {
    console.error("Error creando artículo admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al crear artículo",
      error: error.message,
    });
  }
}

async function actualizarArticuloAdmin(req, res) {
  try {
    const { id } = req.params;

    await actualizarArticulo(id, req.body);

    return res.json({
      ok: true,
      mensaje: "Artículo actualizado correctamente",
    });
  } catch (error) {
    console.error("Error actualizando artículo admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar artículo",
      error: error.message,
    });
  }
}

async function cambiarEstadoArticuloAdmin(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    await cambiarEstadoArticulo(id, estado);

    return res.json({
      ok: true,
      mensaje: "Estado del artículo actualizado correctamente",
    });
  } catch (error) {
    console.error("Error cambiando estado artículo admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al cambiar estado del artículo",
      error: error.message,
    });
  }
}

async function eliminarArticuloAdmin(req, res) {
  try {
    const { id } = req.params;

    await eliminarArticuloLogico(id);

    return res.json({
      ok: true,
      mensaje: "Artículo eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando artículo admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar artículo",
      error: error.message,
    });
  }
}

async function crearBloqueAdmin(req, res) {
  try {
    const { articuloId } = req.params;

    const bloque = await crearBloque(articuloId, req.body);

    return res.status(201).json({
      ok: true,
      mensaje: "Bloque creado correctamente",
      data: bloque,
    });
  } catch (error) {
    console.error("Error creando bloque admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al crear bloque",
      error: error.message,
    });
  }
}

async function actualizarBloqueAdmin(req, res) {
  try {
    const { bloqueId } = req.params;

    await actualizarBloque(bloqueId, req.body);

    return res.json({
      ok: true,
      mensaje: "Bloque actualizado correctamente",
    });
  } catch (error) {
    console.error("Error actualizando bloque admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar bloque",
      error: error.message,
    });
  }
}

async function eliminarBloqueAdmin(req, res) {
  try {
    const { bloqueId } = req.params;

    await eliminarBloqueLogico(bloqueId);

    return res.json({
      ok: true,
      mensaje: "Bloque eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando bloque admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar bloque",
      error: error.message,
    });
  }
}

async function crearRelacionadoAdmin(req, res) {
  try {
    const { articuloId } = req.params;

    const relacionado = await crearRelacionado(articuloId, req.body);

    return res.status(201).json({
      ok: true,
      mensaje: "Artículo relacionado creado correctamente",
      data: relacionado,
    });
  } catch (error) {
    console.error("Error creando relacionado admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al crear artículo relacionado",
      error: error.message,
    });
  }
}

async function eliminarRelacionadoAdmin(req, res) {
  try {
    const { articuloId, relacionadoId, relacionId } = req.params;

    const idRelacionado = relacionadoId || relacionId;

    await eliminarRelacionado(idRelacionado, articuloId);

    return res.json({
      ok: true,
      mensaje: "Artículo relacionado eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando relacionado admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar artículo relacionado",
      error: error.message,
    });
  }
}

async function subirImagenArticuloAdmin(req, res) {
  try {
    const { articuloId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debe adjuntar una imagen.",
      });
    }

    const imagen = await registrarImagenArticulo(articuloId, req.file, req.body);

    return res.status(201).json({
      ok: true,
      mensaje: "Imagen registrada correctamente",
      data: imagen,
    });
  } catch (error) {
    console.error("Error subiendo imagen admin:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error al subir imagen del artículo",
      error: error.message,
    });
  }
}

module.exports = {
  listarArticulosAdmin,
  obtenerArticuloAdminPorId,
  crearArticuloAdmin,
  actualizarArticuloAdmin,
  cambiarEstadoArticuloAdmin,
  eliminarArticuloAdmin,
  crearBloqueAdmin,
  actualizarBloqueAdmin,
  eliminarBloqueAdmin,
  crearRelacionadoAdmin,
  eliminarRelacionadoAdmin,
  subirImagenArticuloAdmin,
};