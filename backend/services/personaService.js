const DB_USER = process.env.DB_USER || "WEBUSER";

function sanitizarTexto(valor) {
  if (valor === undefined || valor === null) return "";
  return String(valor).trim().replace(/\s+/g, " ");
}

function dividirNombreCompleto(nombreCompleto) {
  const limpio = sanitizarTexto(nombreCompleto);
  const partes = limpio.split(" ").filter(Boolean);

  if (partes.length === 0) {
    return { nombre: "", apellido1: "", apellido2: "" };
  }

  if (partes.length === 1) {
    return { nombre: partes[0], apellido1: "N/A", apellido2: "" };
  }

  if (partes.length === 2) {
    return { nombre: partes[0], apellido1: partes[1], apellido2: "" };
  }

  return {
    nombre: partes.slice(0, -2).join(" "),
    apellido1: partes[partes.length - 2],
    apellido2: partes[partes.length - 1],
  };
}

async function obtenerSiguienteId(connection, tableName, idColumn) {
  const sql = `
    SELECT IFNULL(MAX(${idColumn}), 0) + 1 AS siguiente_id
    FROM ${tableName}
  `;

  const [rows] = await connection.execute(sql);
  return rows[0].siguiente_id;
}

async function buscarPersonaPorCorreo(connection, correo) {
  const sql = `
    SELECT p.pe_persona_id
    FROM re_persona p
    INNER JOIN re_correo_electronico c
      ON p.pe_persona_id = c.co_persona_id
    WHERE c.co_correo = ?
      AND c.co_estado = 'A'
    LIMIT 1
  `;

  const [rows] = await connection.execute(sql, [correo]);
  return rows.length ? rows[0].pe_persona_id : null;
}

async function insertarPersona(connection, nombreCompleto) {
  const personaId = await obtenerSiguienteId(
    connection,
    "re_persona",
    "pe_persona_id"
  );

  const { nombre, apellido1, apellido2 } = dividirNombreCompleto(nombreCompleto);

  const sql = `
    INSERT INTO re_persona (
      pe_persona_id,
      pe_identificacion,
      pe_tipo_persona,
      pe_nombre,
      pe_apellido1,
      pe_apellido2,
      pe_clasificacion_persona,
      pe_estado,
      pe_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    personaId,
    "N/A",
    "F",
    nombre,
    apellido1,
    apellido2,
    "C",
    "A",
    DB_USER,
  ];

  await connection.execute(sql, valores);
  return personaId;
}

async function existeCorreoActivo(connection, personaId, correo) {
  const sql = `
    SELECT co_correo_id
    FROM re_correo_electronico
    WHERE co_persona_id = ?
      AND co_correo = ?
      AND co_estado = 'A'
    LIMIT 1
  `;

  const [rows] = await connection.execute(sql, [personaId, correo]);
  return rows.length > 0;
}

async function insertarCorreo(connection, personaId, correo) {
  const correoId = await obtenerSiguienteId(
    connection,
    "re_correo_electronico",
    "co_correo_id"
  );

  const sql = `
    INSERT INTO re_correo_electronico (
      co_correo_id,
      co_persona_id,
      co_correo,
      co_principal,
      co_tipo_correo,
      co_estado,
      co_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  await connection.execute(sql, [
    correoId,
    personaId,
    correo,
    "S",
    "P",
    "A",
    DB_USER,
  ]);

  return correoId;
}

async function existeTelefonoActivo(connection, personaId, telefono) {
  const sql = `
    SELECT te_telefono_id
    FROM re_telefono
    WHERE te_persona_id = ?
      AND te_telefono = ?
      AND te_estado = 'A'
    LIMIT 1
  `;

  const [rows] = await connection.execute(sql, [personaId, telefono]);
  return rows.length > 0;
}

async function insertarTelefono(connection, personaId, telefono) {
  const telefonoId = await obtenerSiguienteId(
    connection,
    "re_telefono",
    "te_telefono_id"
  );

  const sql = `
    INSERT INTO re_telefono (
      te_telefono_id,
      te_persona_id,
      te_codigo_pais,
      te_telefono,
      te_principal,
      te_tipo,
      te_estado,
      te_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await connection.execute(sql, [
    telefonoId,
    personaId,
    506,
    telefono,
    "S",
    "M",
    "A",
    DB_USER,
  ]);

  return telefonoId;
}

async function obtenerOCrearPersonaContacto(connection, data) {
  const nombreCompleto = sanitizarTexto(data.nombreCompleto);
  const correo = sanitizarTexto(data.correo).toLowerCase();
  const telefono = sanitizarTexto(data.telefono);

  let personaId = await buscarPersonaPorCorreo(connection, correo);

  if (!personaId) {
    personaId = await insertarPersona(connection, nombreCompleto);
  }

  const correoExiste = await existeCorreoActivo(connection, personaId, correo);
  if (!correoExiste) {
    await insertarCorreo(connection, personaId, correo);
  }

  const telefonoExiste = await existeTelefonoActivo(
    connection,
    personaId,
    telefono
  );

  if (!telefonoExiste) {
    await insertarTelefono(connection, personaId, telefono);
  }

  return personaId;
}

module.exports = {
  sanitizarTexto,
  dividirNombreCompleto,
  obtenerSiguienteId,
  buscarPersonaPorCorreo,
  insertarPersona,
  existeCorreoActivo,
  insertarCorreo,
  existeTelefonoActivo,
  insertarTelefono,
  obtenerOCrearPersonaContacto,
};