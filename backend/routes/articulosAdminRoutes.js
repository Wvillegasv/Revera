const express = require("express");

const uploadGuia = require("../middlewares/uploadGuia");
const {
  verificarAutenticacion,
} = require("../middlewares/authMiddleware");
const { validarAdmin } = require("../middlewares/validarAdmin");

const {
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
} = require("../controllers/articulosAdminController");

const router = express.Router();

/* =========================================
   SEGURIDAD CMS
========================================= */

router.use(
  "/admin",
  verificarAutenticacion,
  validarAdmin
);

/* =========================================
   ARTÍCULOS
========================================= */

router.get("/admin/articulos", listarArticulosAdmin);
router.get("/admin/articulos/:id", obtenerArticuloAdminPorId);

router.post("/admin/articulos", crearArticuloAdmin);
router.put("/admin/articulos/:id", actualizarArticuloAdmin);
router.patch("/admin/articulos/:id/estado", cambiarEstadoArticuloAdmin);
router.delete("/admin/articulos/:id", eliminarArticuloAdmin);

/* =========================================
   BLOQUES
========================================= */

router.post("/admin/articulos/:articuloId/bloques", crearBloqueAdmin);
router.put("/admin/articulos/bloques/:bloqueId", actualizarBloqueAdmin);
router.delete("/admin/articulos/bloques/:bloqueId", eliminarBloqueAdmin);

/* =========================================
   RELACIONADOS
========================================= */

router.post("/admin/articulos/:articuloId/relacionados", crearRelacionadoAdmin);

/*
  Ruta recomendada:
  inactiva únicamente la relación entre el artículo actual y el relacionado.
*/
router.delete(
  "/admin/articulos/:articuloId/relacionados/:relacionadoId",
  eliminarRelacionadoAdmin
);

/*
  Ruta anterior conservada por compatibilidad.
*/
router.delete(
  "/admin/articulos/relacionados/:relacionId",
  eliminarRelacionadoAdmin
);

/* =========================================
   IMÁGENES
========================================= */

router.post(
  "/admin/articulos/:articuloId/imagenes",
  uploadGuia.single("imagen"),
  subirImagenArticuloAdmin
);

module.exports = router;