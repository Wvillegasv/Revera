const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { login, logout, me } = require("../controllers/authController");
const { verificarAutenticacion } = require("../middleware/authMiddleware");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    ok: false,
    mensaje: "Demasiados intentos de acceso. Intente nuevamente en 15 minutos.",
  },
});

router.post("/login", loginLimiter, login);
router.get("/me", verificarAutenticacion, me);
router.post("/logout", logout);

module.exports = router;
