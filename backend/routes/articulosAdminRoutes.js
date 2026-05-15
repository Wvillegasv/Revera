const express = require("express");

const uploadGuia = require("../middlewares/uploadGuia");

const {
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

router.post("/admin/articulos", crearArticuloAdmin);
router.put("/admin/articulos/:id", actualizarArticuloAdmin);
router.patch("/admin/articulos/:id/estado", cambiarEstadoArticuloAdmin);
router.delete("/admin/articulos/:id", eliminarArticuloAdmin);

router.post("/admin/articulos/:articuloId/bloques", crearBloqueAdmin);
router.put("/admin/articulos/bloques/:bloqueId", actualizarBloqueAdmin);
router.delete("/admin/articulos/bloques/:bloqueId", eliminarBloqueAdmin);

router.post("/admin/articulos/:articuloId/relacionados", crearRelacionadoAdmin);
router.delete("/admin/articulos/relacionados/:relacionId", eliminarRelacionadoAdmin);

router.post(
  "/admin/articulos/:articuloId/imagenes",
  uploadGuia.single("imagen"),
  subirImagenArticuloAdmin
);

module.exports = router;