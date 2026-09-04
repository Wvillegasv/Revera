function validarAdmin(req, res, next) {
  const usuarioRol = String(req.auth?.rol || "")
    .trim()
    .toUpperCase();

  if (usuarioRol !== "ADMIN") {
    return res.status(403).json({
      ok: false,
      mensaje: "Acceso denegado. Se requiere rol ADMIN.",
    });
  }

  return next();
}

module.exports = {
  validarAdmin,
};
