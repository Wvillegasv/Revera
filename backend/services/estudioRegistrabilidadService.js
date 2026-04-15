const path = require("path");
const pool = require("../config/db");

const DB_USER = process.env.DB_USER || "WEBUSER";

function crearError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sanitizarTexto(valor) {
  if (valor === undefined || valor === null) return "";
  return String(valor).trim().replace(/\s+/g, " ");
}

function validarCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function validarTelefono(telefono) {
  return /^[0-9+\-\s()]{8,20}$/.test(telefono);
}

function dividirNombreCompleto(nombreCompleto) {
  const limpio = sanitizarTexto(nombreCompleto);
  const partes = limpio.split(" ").filter(Boolean);

  if (partes.length === 0) {
    return {
      nombre: "",
      apellido1: "",
      apellido2: "",
    };
  }

  if (partes.length === 1) {
    return {
      nombre: partes[0],
      apellido1: "N/A",
      apellido2: "",
    };
  }

  if (partes.length === 2) {
    return {
      nombre: partes[0],
      apellido1: partes[1],
      apellido2: "",
    };
  }

  return {
    nombre: partes.slice(0, -2).join(" "),
    apellido1: partes[partes.length - 2],
    apellido2: partes[partes.length - 1],
  };
}

function obtenerTieneImagenes(files = []) {
  return files.length > 0 ? "S" : "N";
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

async function obtenerSiguientePersonaId(connection) {
  const sql = `
    SELECT IFNULL(MAX(pe_persona_id), 0) + 1 AS siguiente_id
    FROM re_persona
  `;

  const [rows] = await connection.execute(sql);
  return rows[0].siguiente_id;
}

async function obtenerSiguienteCorreoId(connection) {
  const sql = `
    SELECT IFNULL(MAX(co_correo_id), 0) + 1 AS siguiente_id
    FROM re_correo_electronico
  `;

  const [rows] = await connection.execute(sql);
  return rows[0].siguiente_id;
}

async function obtenerSiguienteTelefonoId(connection) {
  const sql = `
    SELECT IFNULL(MAX(te_telefono_id), 0) + 1 AS siguiente_id
    FROM re_telefono
  `;

  const [rows] = await connection.execute(sql);
  return rows[0].siguiente_id;
}

async function insertarPersona(connection, { nombre, apellido1, apellido2 }) {
  const personaId = await obtenerSiguientePersonaId(connection);

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

async function insertarCorreo(connection, { personaId, correo }) {
  const correoId = await obtenerSiguienteCorreoId(connection);

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

  const valores = [correoId, personaId, correo, "S", "P", "A", DB_USER];
  await connection.execute(sql, valores);

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

async function insertarTelefono(connection, { personaId, codigoPais, telefono }) {
  const telefonoId = await obtenerSiguienteTelefonoId(connection);

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

  const valores = [telefonoId, personaId, codigoPais, telefono, "S", "M", "A", DB_USER];
  await connection.execute(sql, valores);

  return telefonoId;
}

async function insertarEstudio(
  connection,
  {
    personaId,
    nombreMarca,
    descripcionProductoServicio,
    sectorClase,
    tieneImagenes,
  }
) {
  const sql = `
    INSERT INTO re_estudio_registrabilidad (
      er_persona_id,
      er_nombre_marca,
      er_descripcion_producto_servicio,
      er_sector_clase,
      er_tiene_imagenes,
      er_estado,
      er_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    personaId,
    nombreMarca,
    descripcionProductoServicio,
    sectorClase || null,
    tieneImagenes,
    "P",
    DB_USER,
  ];

  const [result] = await connection.execute(sql, valores);
  return result.insertId;
}

async function insertarImagen(connection, { estudioId, file }) {
  const sql = `
    INSERT INTO re_estudio_registrabilidad_imagen (
      ei_estudio_id,
      ei_nombre_original,
      ei_nombre_archivo,
      ei_ruta_archivo,
      ei_mime_type,
      ei_peso_bytes,
      ei_estado,
      ei_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const rutaRelativa = path
    .join("uploads", "estudios", file.filename)
    .replace(/\\/g, "/");

  const valores = [
    estudioId,
    file.originalname,
    file.filename,
    rutaRelativa,
    file.mimetype,
    file.size,
    "A",
    DB_USER,
  ];

  await connection.execute(sql, valores);
}

function validarCamposEntrada({
  nombreCompleto,
  correo,
  telefono,
  codigoPais,
  nombreMarca,
  descripcionProductoServicio,
}) {
  if (!nombreCompleto || nombreCompleto.length < 10) {
    throw crearError(
      "El nombre completo es obligatorio y debe tener al menos 10 caracteres."
    );
  }

  if (!correo || !validarCorreo(correo)) {
    throw crearError("El correo electrónico no es válido.");
  }

  if (!telefono || !validarTelefono(telefono)) {
    throw crearError("El número de teléfono no es válido.");
  }

  if (!codigoPais || !String(codigoPais).trim()) {
    throw crearError("El código de país es obligatorio.");
  }

  if (!nombreMarca || nombreMarca.length < 2) {
    throw crearError("El nombre de la marca es obligatorio.");
  }

  if (!descripcionProductoServicio || descripcionProductoServicio.length < 10) {
    throw crearError(
      "La descripción del producto o servicio es obligatoria y debe tener al menos 10 caracteres."
    );
  }
}

async function registrarEstudioRegistrabilidad({ body, files }) {
  const nombreCompleto = sanitizarTexto(body.nombreCompleto);
  const correo = sanitizarTexto(body.correo).toLowerCase();
  const telefono = sanitizarTexto(body.telefono);
  const codigoPais = sanitizarTexto(body.codigoPais || "506");
  const nombreMarca = sanitizarTexto(body.nombreMarca);
  const descripcionProductoServicio = sanitizarTexto(
    body.descripcionProductoServicio
  );
  const sectorClase = sanitizarTexto(body.sectorClase);

  validarCamposEntrada({
    nombreCompleto,
    correo,
    telefono,
    codigoPais,
    nombreMarca,
    descripcionProductoServicio,
  });

  const { nombre, apellido1, apellido2 } = dividirNombreCompleto(nombreCompleto);
  const tieneImagenes = obtenerTieneImagenes(files);

  let connection;

  try {
    connection = await pool.getConnection();

    if (!connection) {
      throw crearError("No se pudo obtener conexión a la base de datos.", 500);
    }

    await connection.beginTransaction();

    let personaId = await buscarPersonaPorCorreo(connection, correo);

    if (!personaId) {
      personaId = await insertarPersona(connection, {
        nombre,
        apellido1,
        apellido2,
      });
    }

    const correoExiste = await existeCorreoActivo(connection, personaId, correo);
    if (!correoExiste) {
      await insertarCorreo(connection, {
        personaId,
        correo,
      });
    }

    const telefonoExiste = await existeTelefonoActivo(
      connection,
      personaId,
      telefono
    );
    if (!telefonoExiste) {
      await insertarTelefono(connection, {
        personaId,
        codigoPais,
        telefono,
      });
    }

    const estudioId = await insertarEstudio(connection, {
      personaId,
      nombreMarca,
      descripcionProductoServicio,
      sectorClase,
      tieneImagenes,
    });

    for (const file of files) {
      await insertarImagen(connection, {
        estudioId,
        file,
      });
    }

    await connection.commit();

    return {
      estudioId,
      personaId,
      tieneImagenes,
      totalImagenes: files.length,
      nombreCompleto,
      correo,
      telefono,
      codigoPais,
      nombreMarca,
      descripcionProductoServicio,
      sectorClase,
      files,
    };
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

module.exports = {
  registrarEstudioRegistrabilidad,
};
