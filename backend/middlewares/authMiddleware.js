const jwt = require("jsonwebtoken");

const COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME || "revera_admin_token";

const JWT_ISSUER = "revera-api";
const JWT_AUDIENCE = "revera-cms";

function verificarAutenticacion(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      ok: false,
      mensaje: "No autenticado",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET no está configurado.");

    return res.status(500).json({
      ok: false,
      mensaje: "La autenticación no está configurada correctamente",
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      },
    );

    req.auth = {
      usuarioId: payload.sub,
      rol: payload.rol,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: "Sesión inválida o vencida",
    });
  }
}

module.exports = {
  COOKIE_NAME,
  JWT_AUDIENCE,
  JWT_ISSUER,
  verificarAutenticacion,
};