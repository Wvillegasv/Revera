const express = require("express");

const {
  listarArticulos,
  obtenerDetalleArticulo,
} = require("../controllers/articulosController");

const router = express.Router();

router.get("/articulos", listarArticulos);
router.get("/articulos/:slug", obtenerDetalleArticulo);

module.exports = router;
