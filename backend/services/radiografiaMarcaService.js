const path = require("path");
const pool = require("../config/db").promise();

const DB_USER = process.env.DB_USER || "WEBUSER";

function crearError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sanitizarTexto(valor) {
  if (valor === undefined || valor === null) {
    return "";
  }

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

function normalizarArchivo(file) {
  if (!file) {
    return null;
  }

  return Array.isArray(file) ? file[0] || null : file;
}

function construirDescripcionRadiografia(data) {
  const lineas = [
    ["Producto o servicio", data.tipoProductoServicio],
    ["Descripción simple", data.fraseSimple],
    ["Alcance de uso", data.alcanceUso],
    ["Otro alcance", data.alcanceUsoOtro],
    ["Marcas similares", data.existenMarcasSimilares],
    ["Detalle de marcas similares", data.marcasSimilaresDetalle],
    ["Diferenciador", data.diferenciador],
    ["Tipo de marca visual", data.tipoMarcaVisual],
    ["Uso o ventas previas", data.haVendido],
    ["Desde cuándo la usa", data.desdeCuandoUso],
    ["Consulta específica", data.preguntaClave],
  ]
    .map(([etiqueta, valor]) => {
      const valorLimpio = sanitizarTexto(valor);
      return valorLimpio ? `${etiqueta}: ${valorLimpio}` : "";
    })
    .filter(Boolean);

  return lineas.join("\n");
}

async function buscarPersonaPorCorreo(connection, correo) {
  const [rows] = await connection.execute(
    `
      SELECT p.pe_persona_id
      FROM re_persona p
      INNER JOIN re_correo_electronico c
        ON p.pe_persona_id = c.co_persona_id
      WHERE c.co_correo = ?
        AND c.co_estado = 'A'
      LIMIT 1
    `,
    [correo]
  );

  return rows.length ? rows[0].pe_persona_id : null;
}

async function obtenerSiguienteId(connection, tabla, campo) {
  const [rows] = await connection.query(
    `SELECT IFNULL(MAX(\`${campo}\`), 0) + 1 AS siguiente_id FROM \`${tabla}\``
  );

  return rows[0].siguiente_id;
}

async function insertarPersona(connection, { nombre, apellido1, apellido2 }) {
  const personaId = await obtenerSiguienteId(
    connection,
    "re_persona",
    "pe_persona_id"
  );

  await connection.execute(
    `
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
    `,
    [
      personaId,
      "N/A",
      "F",
      nombre,
      apellido1,
      apellido2,
      "C",
      "A",
      DB_USER,
    ]
  );

  return personaId;
}

async function existeCorreoActivo(connection, personaId, correo) {
  const [rows] = await connection.execute(
    `
      SELECT co_correo_id
      FROM re_correo_electronico
      WHERE co_persona_id = ?
        AND co_correo = ?
        AND co_estado = 'A'
      LIMIT 1
    `,
    [personaId, correo]
  );

  return rows.length > 0;
}

async function insertarCorreo(connection, { personaId, correo }) {
  const correoId = await obtenerSiguienteId(
    connection,
    "re_correo_electronico",
    "co_correo_id"
  );

  await connection.execute(
    `
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
    `,
    [correoId, personaId, correo, "S", "P", "A", DB_USER]
  );
}

async function existeTelefonoActivo(connection, personaId, telefono) {
  const [rows] = await connection.execute(
    `
      SELECT te_telefono_id
      FROM re_telefono
      WHERE te_persona_id = ?
        AND te_telefono = ?
        AND te_estado = 'A'
      LIMIT 1
    `,
    [personaId, telefono]
  );

  return rows.length > 0;
}

async function insertarTelefono(connection, { personaId, codigoPais, telefono }) {
  const telefonoId = await obtenerSiguienteId(
    connection,
    "re_telefono",
    "te_telefono_id"
  );

  await connection.execute(
    `
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
    `,
    [telefonoId, personaId, codigoPais, telefono, "S", "M", "A", DB_USER]
  );
}

async function insertarRadiografia(connection, data) {
  const [result] = await connection.execute(
    `
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
    `,
    [
      data.personaId,
      data.nombreMarca,
      data.descripcionProductoServicio,
      data.sectorClase || null,
      data.tieneImagenes,
      "P",
      DB_USER,
    ]
  );

  return result.insertId;
}

async function insertarImagen(connection, { estudioId, file }) {
  const rutaRelativa = path
    .join("uploads", "estudios", file.filename)
    .replace(/\\/g, "/");

  await connection.execute(
    `
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
    `,
    [
      estudioId,
      file.originalname,
      file.filename,
      rutaRelativa,
      file.mimetype,
      file.size,
      "A",
      DB_USER,
    ]
  );
}

function validarPayload(data) {
  const nombreCompleto = sanitizarTexto(data.nombreCompletoContacto);
  const correo = sanitizarTexto(data.correoContacto).toLowerCase();
  const nombreMarca = sanitizarTexto(data.nombreMarca);
  const tipoProductoServicio = sanitizarTexto(data.tipoProductoServicio);

  if (nombreCompleto.length < 3) {
    throw crearError("El nombre completo es obligatorio.");
  }

  if (!validarCorreo(correo)) {
    throw crearError("El correo electrónico no es válido.");
  }

  if (nombreMarca.length < 2) {
    throw crearError("El nombre de la marca es obligatorio.");
  }

  if (tipoProductoServicio.length < 10) {
    throw crearError(
      "La descripción del producto o servicio debe tener al menos 10 caracteres."
    );
  }
}

async function registrarRadiografiaMarca(data = {}, file = null) {
  validarPayload(data);

  const nombreCompleto = sanitizarTexto(data.nombreCompletoContacto);
  const correo = sanitizarTexto(data.correoContacto).toLowerCase();
  const codigoPais = sanitizarTexto(
    data.telefonoCodigoPais || data.codigoPais || "506"
  );
  const telefono = sanitizarTexto(
    data.telefonoNumero || data.telefonoContacto || data.telefono
  );
  const nombreMarca = sanitizarTexto(data.nombreMarca);
  const descripcionProductoServicio = construirDescripcionRadiografia(data);
  const sectorClase = sanitizarTexto(data.sectorClase);
  const archivo = normalizarArchivo(file);
  const tieneImagenes = archivo ? "S" : "N";

  if (telefono && !validarTelefono(telefono)) {
    throw crearError("El número de teléfono no es válido.");
  }

  const { nombre, apellido1, apellido2 } = dividirNombreCompleto(nombreCompleto);
  let connection;

  try {
    connection = await pool.getConnection();
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
      await insertarCorreo(connection, { personaId, correo });
    }

    if (telefono) {
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
    }

    const estudioId = await insertarRadiografia(connection, {
      personaId,
      nombreMarca,
      descripcionProductoServicio,
      sectorClase,
      tieneImagenes,
    });

    if (archivo) {
      await insertarImagen(connection, {
        estudioId,
        file: archivo,
      });
    }

    await connection.commit();

    return {
      estudioId,
      personaId,
      nombreCompleto,
      correo,
      telefono,
      codigoPais,
      nombreMarca,
      descripcionProductoServicio,
      sectorClase,
      tieneImagenes,
      totalImagenes: archivo ? 1 : 0,
      files: archivo ? [archivo] : [],
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
  registrarRadiografiaMarca,
};
