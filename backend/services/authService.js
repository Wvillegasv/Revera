const pool = require("../config/db");

const db = pool.promise();

async function buscarUsuarioActivoPorCorreo(correo) {
  const [rows] = await db.execute(
    `
      SELECT
        u.us_usuario_id,
        u.us_persona_id,
        u.us_rol,
        u.us_estado,
        u.us_clave_hash,
        u.us_ultimo_acceso,
        p.pe_nombre,
        p.pe_apellido1,
        p.pe_apellido2,
        p.pe_razon_social,
        p.pe_estado AS pe_estado,
        c.co_correo
      FROM re_usuario u
      INNER JOIN re_persona p
        ON p.pe_persona_id = u.us_persona_id
      INNER JOIN re_correo_electronico c
        ON c.co_persona_id = u.us_persona_id
      WHERE LOWER(TRIM(c.co_correo)) = LOWER(TRIM(?))
        AND c.co_estado = 'A'
      ORDER BY
        CASE WHEN c.co_principal = 'S' THEN 0 ELSE 1 END,
        c.co_correo_id ASC
      LIMIT 1
    `,
    [correo]
  );

  return rows[0] || null;
}

async function buscarUsuarioActivoPorId(usuarioId) {
  const [rows] = await db.execute(
    `
      SELECT
        u.us_usuario_id,
        u.us_persona_id,
        u.us_rol,
        u.us_estado,
        u.us_ultimo_acceso,
        p.pe_nombre,
        p.pe_apellido1,
        p.pe_apellido2,
        p.pe_razon_social,
        p.pe_estado AS pe_estado,
        c.co_correo
      FROM re_usuario u
      INNER JOIN re_persona p
        ON p.pe_persona_id = u.us_persona_id
      LEFT JOIN re_correo_electronico c
        ON c.co_persona_id = u.us_persona_id
       AND c.co_estado = 'A'
      WHERE u.us_usuario_id = ?
      ORDER BY
        CASE WHEN c.co_principal = 'S' THEN 0 ELSE 1 END,
        c.co_correo_id ASC
      LIMIT 1
    `,
    [usuarioId]
  );

  return rows[0] || null;
}

async function actualizarUltimoAcceso(usuarioId) {
  await db.execute(
    `
      UPDATE re_usuario
      SET us_ultimo_acceso = CURRENT_TIMESTAMP
      WHERE us_usuario_id = ?
    `,
    [usuarioId]
  );

  const [rows] = await db.execute(
    `
      SELECT us_ultimo_acceso
      FROM re_usuario
      WHERE us_usuario_id = ?
      LIMIT 1
    `,
    [usuarioId]
  );

  return rows[0]?.us_ultimo_acceso || null;
}

function construirNombreCompleto(usuario) {
  const nombreFisico = [
    usuario?.pe_nombre,
    usuario?.pe_apellido1,
    usuario?.pe_apellido2,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return nombreFisico || usuario?.pe_razon_social || usuario?.co_correo || "Administrador";
}

function serializarUsuario(usuario) {
  return {
    id: usuario.us_usuario_id,
    personaId: usuario.us_persona_id,
    nombre: construirNombreCompleto(usuario),
    correo: usuario.co_correo,
    rol: usuario.us_rol,
    ultimoAcceso: usuario.us_ultimo_acceso || null,
  };
}

module.exports = {
  actualizarUltimoAcceso,
  buscarUsuarioActivoPorCorreo,
  buscarUsuarioActivoPorId,
  serializarUsuario,
};
