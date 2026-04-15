const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { crearEstudioRegistrabilidad } = require("../controllers/estudioRegistrabilidadController");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "estudios");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 50 * 1024 * 1024; // 50 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path
      .basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .slice(0, 80);

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBaseName}${extension}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error("Formato de archivo no permitido. Solo se aceptan JPG, PNG o WebP.")
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 10,
  },
});

router.post(
  "/estudio-registrabilidad",
  upload.array("imagenes", 10),
  crearEstudioRegistrabilidad
);

module.exports = router;