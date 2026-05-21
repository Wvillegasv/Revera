const express = require("express");

const uploadRadiografiaMarca = require("../middlewares/uploadRadiografiaMarca");

const {
  crearRadiografiaMarca,
} = require("../controllers/radiografiaMarcaController");

const router = express.Router();

router.post(
  "/radiografia-marca",
  uploadRadiografiaMarca.single("archivoLogo"),
  crearRadiografiaMarca
);

module.exports = router;