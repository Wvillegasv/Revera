const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const {
  COOKIE_NAME,
  JWT_AUDIENCE,
  JWT_ISSUER,
} = require("../middleware/authMiddleware");
const {
  actualizarUltimoAcceso,
  buscarUsuarioActivoPorCorreo,
  buscarUsuarioActivoPorId,
  serializarUsuario,
} = require("../services/authService");

function obtenerRolesPermitidos() {
  return (process.env.ADMIN_ROLES || "ADMIN,ADMINISTRADOR")
    .split(",")
    .map((rol) => rol.trim().toUpperCase())
    .filter(Boolean);
}

function usuarioPuedeIngresar(usuario) {
  if (!usuario) return false;

  const rol = String(usuario.us_rol || "").trim().toUpperCase();
  const estadoUsuario = String(usuario.us_estado || "").trim().toUpperCase();
  const estadoPersona = String(usuario.pe_estado || "").trim().toUpperCase();

  return (
    estadoUsuario === "A" &&
    estadoPersona === "A" &&
    obtenerRolesPermitidos().includes(rol)
  );
}

function esEntornoSeguro() {
  const appEnv = String(process.env.APP_ENV || "").toLowerCase();
  const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();

  return (
    nodeEnv === "production" ||
    appEnv === "production" ||
    appEnv === "staging"
  );
}

function obtenerOpcionesCookie() {
  const secure = esEntornoSeguro();

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000,
    path: "/",
  };
}

function obtenerOpcionesLimpiarCookie() {
  const { maxAge, ...opciones } = obtenerOpcionesCookie();
  return opciones;
}

function crearToken(usuario) {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET no está configurado");
    error.status = 500;
    throw error;
  }

  return jwt.sign(
    {
      rol: usuario.us_rol,
    },
    process.env.JWT_SECRET,
    {
      subject: String(usuario.us_usuario_id),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    }
  );
}

async function login(req, res, next) {
  try {
    const correo = String(req.body?.correo || "").trim().toLowerCase();
    const clave = String(req.body?.clave || "");

    if (!correo || !clave) {
      return res.status(400).json({
        ok: false,
        mensaje: "Ingrese el correo y la contraseña",
      });
    }

    const usuario = await buscarUsuarioActivoPorCorreo(correo);

    if (!usuarioPuedeIngresar(usuario) || !usuario.us_clave_hash) {
      return res.status(401).json({
        ok: false,
        mensaje: "Correo o contraseña incorrectos",
      });
    }

    let claveValida = false;

    try {
      claveValida = await argon2.verify(usuario.us_clave_hash, clave);
    } catch (errorHash) {
      console.error("El hash Argon2id almacenado no es válido:", errorHash.message);
      claveValida = false;
    }

    if (!claveValida) {
      return res.status(401).json({
        ok: false,
        mensaje: "Correo o contraseña incorrectos",
      });
    }

    usuario.us_ultimo_acceso = await actualizarUltimoAcceso(
      usuario.us_usuario_id
    );

    const token = crearToken(usuario);

    res.cookie(COOKIE_NAME, token, obtenerOpcionesCookie());

    return res.status(200).json({
      ok: true,
      mensaje: "Inicio de sesión correcto",
      usuario: serializarUsuario(usuario),
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const usuario = await buscarUsuarioActivoPorId(req.auth.usuarioId);

    if (!usuarioPuedeIngresar(usuario)) {
      res.clearCookie(COOKIE_NAME, obtenerOpcionesLimpiarCookie());

      return res.status(401).json({
        ok: false,
        mensaje: "La sesión ya no tiene autorización",
      });
    }

    return res.status(200).json({
      ok: true,
      usuario: serializarUsuario(usuario),
    });
  } catch (error) {
    return next(error);
  }
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, obtenerOpcionesLimpiarCookie());

  return res.status(200).json({
    ok: true,
    mensaje: "Sesión cerrada correctamente",
  });
}

module.exports = {
  login,
  logout,
  me,
};
