const {
  crearArticulo,
  actualizarArticulo,
  cambiarEstadoArticulo,
  eliminarArticuloLogico,
  crearBloque,
  actualizarBloque,
  eliminarBloqueLogico,
  crearRelacionado,
  eliminarRelacionado,
} = require("../services/articulosAdminService");

function validarArticulo(body) {
  if (!body.slug || !body.titulo) {
    return "El slug y el título son obligatorios.";
  }

  return null;
}

async function crearArticuloAdmin(req, res) {
  try {
    const error = validarArticulo(req.body);

    if (error) {
      return res.status(400).json({
        ok: false,
        mensaje: error,
      });
    }

    const id = await crearArticulo(req.body);

    return res.status(201).json({
      ok: true,
      mensaje: "Artículo creado correctamente.",
      data: { id },
    });
  } catch (error) {
    console.error("Error creando artículo:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error creando artículo.",
      error: error.message,
    });
  }
}

async function actualizarArticuloAdmin(req, res) {
  try {
    const { id } = req.params;
    const error = validarArticulo(req.body);

    if (error) {
      return res.status(400).json({
        ok: false,
        mensaje: error,
      });
    }

    const affectedRows = await actualizarArticulo(id, req.body);

    if (affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Artículo no encontrado.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Artículo actualizado correctamente.",
    });
  } catch (error) {
    console.error("Error actualizando artículo:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error actualizando artículo.",
      error: error.message,
    });
  }
}

async function cambiarEstadoArticuloAdmin(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["A", "B", "I"].includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Estado inválido. Use A, B o I.",
      });
    }

    const affectedRows = await cambiarEstadoArticulo(id, estado);

    if (affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Artículo no encontrado.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Estado actualizado correctamente.",
    });
  } catch (error) {
    console.error("Error cambiando estado:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error cambiando estado.",
      error: error.message,
    });
  }
}

async function eliminarArticuloAdmin(req, res) {
  try {
    const { id } = req.params;

    const affectedRows = await eliminarArticuloLogico(id);

    if (affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Artículo no encontrado.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Artículo eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando artículo:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error eliminando artículo.",
      error: error.message,
    });
  }
}

async function crearBloqueAdmin(req, res) {
  try {
    const { articuloId } = req.params;

    if (!req.body.tipo) {
      return res.status(400).json({
        ok: false,
        mensaje: "El tipo de bloque es obligatorio.",
      });
    }

    const id = await crearBloque(articuloId, req.body);

    return res.status(201).json({
      ok: true,
      mensaje: "Bloque creado correctamente.",
      data: { id },
    });
  } catch (error) {
    console.error("Error creando bloque:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error creando bloque.",
      error: error.message,
    });
  }
}

async function actualizarBloqueAdmin(req, res) {
  try {
    const { bloqueId } = req.params;

    if (!req.body.tipo) {
      return res.status(400).json({
        ok: false,
        mensaje: "El tipo de bloque es obligatorio.",
      });
    }

    const affectedRows = await actualizarBloque(bloqueId, req.body);

    if (affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Bloque no encontrado.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Bloque actualizado correctamente.",
    });
  } catch (error) {
    console.error("Error actualizando bloque:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error actualizando bloque.",
      error: error.message,
    });
  }
}

async function eliminarBloqueAdmin(req, res) {
  try {
    const { bloqueId } = req.params;

    const affectedRows = await eliminarBloqueLogico(bloqueId);

    if (affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Bloque no encontrado.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Bloque eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando bloque:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error eliminando bloque.",
      error: error.message,
    });
  }
}

async function crearRelacionadoAdmin(req, res) {
  try {
    const { articuloId } = req.params;
    const { relacionadoId, orden } = req.body;

    if (!relacionadoId) {
      return res.status(400).json({
        ok: false,
        mensaje: "Debe indicar el artículo relacionado.",
      });
    }

    const id = await crearRelacionado(articuloId, relacionadoId, orden || 0);

    return res.status(201).json({
      ok: true,
      mensaje: "Relacionado creado correctamente.",
      data: { id },
    });
  } catch (error) {
    console.error("Error creando relacionado:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error creando relacionado.",
      error: error.message,
    });
  }
}

async function eliminarRelacionadoAdmin(req, res) {
  try {
    const { relacionId } = req.params;

    const affectedRows = await eliminarRelacionado(relacionId);

    if (affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        mensaje: "Relacionado no encontrado.",
      });
    }

    return res.json({
      ok: true,
      mensaje: "Relacionado eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando relacionado:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error eliminando relacionado.",
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

    const imagen = await registrarImagenArticulo(
      articuloId,
      req.file,
      req.body
    );

    return res.status(201).json({
      ok: true,
      mensaje: "Imagen subida correctamente.",
      data: imagen,
    });
  } catch (error) {
    console.error("Error subiendo imagen:", error);

    return res.status(500).json({
      ok: false,
      mensaje: "Error subiendo imagen.",
      error: error.message,
    });
  }
}


module.exports = {
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