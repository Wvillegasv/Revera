const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { crearSolicitudRegistroMarca } = require("../controllers/registroMarcaController");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "registro-marca");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "application/pdf",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 80);

    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error("Formato de archivo no permitido. Solo se aceptan JPG, PNG, WEBP, BMP o PDF.")
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 5,
  },
});

router.post("/registro-marca", upload.array("logoArchivo", 5), crearSolicitudRegistroMarca);

module.exports = router;