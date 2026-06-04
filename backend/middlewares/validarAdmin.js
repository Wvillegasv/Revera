function validarAdmin(req, res, next) {
  /*
    Seguridad temporal para Etapa A del CMS.

    Se valida el rol ADMIN mediante header:
    x-user-rol: ADMIN

    En Etapa B esto será reemplazado por:
    - login admin
    - validación contra re_usuario
    - us_rol = 'ADMIN'
    - JWT
  */

  const usuarioRol = String(req.headers["x-user-rol"] || "")
    .trim()
    .toUpperCase();

  if (usuarioRol !== "ADMIN") {
    return res.status(403).json({
      ok: false,
      mensaje: "Acceso denegado. Se requiere rol ADMIN.",
    });
  }

  next();
}

module.exports = {
  validarAdmin,
};