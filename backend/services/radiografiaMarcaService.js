const nodemailer = require("nodemailer");
const pool = require("../config/db");

const DB_USER = process.env.DB_USER || "WEBUSER";

/* =========================================================
   HELPERS GENERALES
========================================================= */

function normalizarTexto(valor) {
  return valor ? String(valor).trim() : "";
}

function escaparHtml(valor) {
  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generarTelefonoContacto(codigoPais, numero) {
  const codigo = normalizarTexto(codigoPais);
  const tel = normalizarTexto(numero);

  if (!codigo || !tel) {
    return "";
  }

  return `${codigo}${tel}`;
}

function normalizarPayload(data = {}) {
  const telefonoCodigoPais = normalizarTexto(
    data.telefonoCodigoPais || data.codigoPaisTelefono
  );

  const telefonoNumero = normalizarTexto(
    data.telefonoNumero || data.numeroTelefono
  );

  const telefonoContacto =
    generarTelefonoContacto(telefonoCodigoPais, telefonoNumero) ||
    normalizarTexto(data.telefonoContacto || data.telefono);

  return {
    nombreCompleto: normalizarTexto(
      data.nombreCompletoContacto || data.nombreCompleto || data.nombre
    ),

    correoContacto: normalizarTexto(data.correoContacto || data.email),

    telefonoCodigoPais,
    telefonoNumero,
    telefonoContacto,

    nombreMarca: normalizarTexto(data.nombreMarca),
    estadoUso: normalizarTexto(data.estadoUso),
    tipoProductoServicio: normalizarTexto(data.tipoProductoServicio),
    fraseSimple: normalizarTexto(data.fraseSimple),

    alcanceUso: normalizarTexto(data.alcanceUso),
    alcanceUsoOtro: normalizarTexto(data.alcanceUsoOtro),

    existenMarcasSimilares: normalizarTexto(
      data.existenMarcasSimilares || data.marcasSimilares
    ),

    marcasSimilaresDetalle: normalizarTexto(
      data.marcasSimilaresDetalle || data.cualesMarcasSimilares
    ),

    diferenciador: normalizarTexto(data.diferenciador),
    tipoMarcaVisual: normalizarTexto(data.tipoMarcaVisual),
    haVendido: normalizarTexto(data.haVendido),

    desdeCuandoUso: normalizarTexto(data.desdeCuandoUso || data.desdeCuando),

    preguntaClave: normalizarTexto(data.preguntaClave),

    resumen: data,
  };
}

function separarNombreCompleto(nombreCompleto = "") {
  const partes = normalizarTexto(nombreCompleto).split(/\s+/).filter(Boolean);

  return {
    nombre: partes[0] || "N/A",
    apellido1: partes[1] || "N/A",
    apellido2: partes.slice(2).join(" ") || "",
  };
}

function generarIdentificacionTecnica() {
  const ahora = new Date();

  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, "0");
  const dd = String(ahora.getDate()).padStart(2, "0");
  const hh = String(ahora.getHours()).padStart(2, "0");
  const mi = String(ahora.getMinutes()).padStart(2, "0");
  const ss = String(ahora.getSeconds()).padStart(2, "0");
  const random = Math.round(Math.random() * 9999);

  return `RM-${yyyy}${mm}${dd}${hh}${mi}${ss}${random}`;
}

function validarEmail(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

async function obtenerSiguienteId(connection, tableName, idColumn) {
  const sql = `
    SELECT IFNULL(MAX(${idColumn}), 0) + 1 AS siguiente_id
    FROM ${tableName}
  `;

  const [rows] = await connection.execute(sql);

  return rows[0].siguiente_id;
}

/* =========================================================
   TELÉFONO
========================================================= */

function obtenerTelefonoNormalizado(data) {
  const codigoPais = normalizarTexto(data.telefonoCodigoPais);
  const numero = normalizarTexto(data.telefonoNumero);
  const telefonoContacto = normalizarTexto(data.telefonoContacto);

  if (!codigoPais && !numero && !telefonoContacto) {
    return {
      codigoPais: null,
      numero: null,
      telefonoCompleto: null,
    };
  }

  if (codigoPais || numero) {
    if (!codigoPais || !numero) {
      throw new Error("Debe indicar código de país y número de teléfono.");
    }

    if (!/^\d+$/.test(codigoPais)) {
      throw new Error(
        "El código de país debe contener solo números. Ejemplo: 506"
      );
    }

    if (!/^\d+$/.test(numero)) {
      throw new Error(
        "El número de teléfono debe contener solo números. Ejemplo: 88887777"
      );
    }

    if (codigoPais === "506" && numero.length !== 8) {
      throw new Error(
        "Para Costa Rica, el número debe tener 8 dígitos. Ejemplo: 88887777"
      );
    }

    return {
      codigoPais,
      numero,
      telefonoCompleto: `${codigoPais}${numero}`,
    };
  }

  if (!/^\d+$/.test(telefonoContacto)) {
    throw new Error(
      "El teléfono debe contener solo números. Ejemplo: código país 506 y número 88887777"
    );
  }

  if (telefonoContacto.startsWith("506") && telefonoContacto.length === 11) {
    return {
      codigoPais: "506",
      numero: telefonoContacto.substring(3),
      telefonoCompleto: telefonoContacto,
    };
  }

  throw new Error(
    "El teléfono debe enviarse separado como código país y número. Ejemplo: código país 506 y número 88887777"
  );
}

function validarPayloadRadiografia(data) {
  const camposObligatorios = [
    ["nombreMarca", "Nombre de la marca"],
    ["estadoUso", "Estado de uso"],
    ["tipoProductoServicio", "Producto o servicio"],
    ["fraseSimple", "Frase simple"],
    ["alcanceUso", "Alcance de uso"],
    ["existenMarcasSimilares", "Marcas similares"],
    ["diferenciador", "Diferenciador"],
    ["tipoMarcaVisual", "Tipo de marca visual"],
    ["haVendido", "Uso comercial"],
    ["preguntaClave", "Pregunta clave"],
    ["nombreCompleto", "Nombre completo"],
    ["correoContacto", "Correo de contacto"],
  ];

  for (const [campo, etiqueta] of camposObligatorios) {
    if (!data[campo]) {
      throw new Error(`El campo ${etiqueta} es obligatorio.`);
    }
  }

  if (!validarEmail(data.correoContacto)) {
    throw new Error("El correo electrónico no tiene un formato válido.");
  }

  obtenerTelefonoNormalizado(data);
}

/* =========================================================
   PERSONA / CLIENTE
========================================================= */

async function obtenerPersonaPorCorreo(connection, correo) {
  const sql = `
    SELECT
      p.pe_persona_id,
      ce.co_correo_id
    FROM re_correo_electronico ce
    INNER JOIN re_persona p
      ON ce.co_persona_id = p.pe_persona_id
    WHERE LOWER(ce.co_correo) = LOWER(?)
      AND ce.co_estado = 'A'
      AND p.pe_estado = 'A'
    LIMIT 1
  `;

  const [rows] = await connection.execute(sql, [correo]);

  return rows[0] || null;
}

async function obtenerSiguientePersonaId(connection) {
  return obtenerSiguienteId(connection, "re_persona", "pe_persona_id");
}

async function insertarPersona(connection, data) {
  const personaId = await obtenerSiguientePersonaId(connection);

  const { nombre, apellido1, apellido2 } = separarNombreCompleto(
    data.nombreCompleto
  );

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
    generarIdentificacionTecnica(),
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

async function obtenerOCrearPersona(connection, data) {
  const personaExistente = await obtenerPersonaPorCorreo(
    connection,
    data.correoContacto
  );

  if (personaExistente) {
    return {
      personaId: personaExistente.pe_persona_id,
      correoId: personaExistente.co_correo_id,
    };
  }

  const personaId = await insertarPersona(connection, data);

  return {
    personaId,
    correoId: null,
  };
}

/* =========================================================
   CORREO
========================================================= */

async function obtenerCorreo(connection, personaId, correo) {
  const sql = `
    SELECT co_correo_id
    FROM re_correo_electronico
    WHERE co_persona_id = ?
      AND LOWER(co_correo) = LOWER(?)
      AND co_estado = 'A'
    LIMIT 1
  `;

  const [rows] = await connection.execute(sql, [personaId, correo]);

  return rows[0] || null;
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

async function obtenerOCrearCorreo(connection, personaId, correo) {
  const correoExistente = await obtenerCorreo(connection, personaId, correo);

  if (correoExistente) {
    return correoExistente.co_correo_id;
  }

  return insertarCorreo(connection, personaId, correo);
}

/* =========================================================
   TELÉFONO DB
========================================================= */

async function obtenerTelefono(connection, personaId, telefonoData) {
  if (!telefonoData.numero) {
    return null;
  }

  const sql = `
    SELECT te_telefono_id
    FROM re_telefono
    WHERE te_persona_id = ?
      AND te_codigo_pais = ?
      AND te_telefono = ?
      AND te_estado = 'A'
    LIMIT 1
  `;

  const [rows] = await connection.execute(sql, [
    personaId,
    telefonoData.codigoPais,
    telefonoData.numero,
  ]);

  return rows[0] || null;
}

async function obtenerSiguienteTelefonoId(connection) {
  return obtenerSiguienteId(connection, "re_telefono", "te_telefono_id");
}

async function insertarTelefono(connection, personaId, telefonoData) {
  if (!telefonoData.numero) {
    return null;
  }

  const telefonoId = await obtenerSiguienteTelefonoId(connection);

  const sql = `
    INSERT INTO re_telefono (
      te_telefono_id,
      te_persona_id,
      te_codigo_pais,
      te_telefono,
      te_tipo,
      te_principal,
      te_estado,
      te_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await connection.execute(sql, [
    telefonoId,
    personaId,
    telefonoData.codigoPais,
    telefonoData.numero,
    "M",
    "S",
    "A",
    DB_USER,
  ]);

  return telefonoId;
}

async function obtenerOCrearTelefono(connection, personaId, data) {
  const telefonoData = obtenerTelefonoNormalizado(data);

  if (!telefonoData.numero) {
    return null;
  }

  const telefonoExistente = await obtenerTelefono(
    connection,
    personaId,
    telefonoData
  );

  if (telefonoExistente) {
    return telefonoExistente.te_telefono_id;
  }

  return insertarTelefono(connection, personaId, telefonoData);
}

/* =========================================================
   RADIOGRAFÍA
========================================================= */

async function insertarRadiografiaMarca(connection, data) {
  const telefonoData = obtenerTelefonoNormalizado(data);

  const sql = `
    INSERT INTO re_radiografia_marca (
      rm_persona_id,
      rm_correo_id,
      rm_telefono_id,

      rm_nombre_completo,
      rm_correo_contacto,
      rm_telefono_contacto,

      rm_nombre_marca,
      rm_estado_uso,
      rm_tipo_producto_servicio,
      rm_frase_simple,

      rm_alcance_uso,
      rm_alcance_uso_otro,

      rm_existen_marcas_similares,
      rm_marcas_similares_detalle,
      rm_diferenciador,

      rm_tipo_marca_visual,
      rm_adjunta_logo,

      rm_ha_vendido,
      rm_desde_cuando_uso,

      rm_pregunta_clave,
      rm_resumen_json,

      rm_estado,
      rm_estado_solicitud,
      rm_usuario_crea
    )
    VALUES (
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?,
      'A', 'PENDIENTE', ?
    )
  `;

  const valores = [
    data.personaId,
    data.correoId,
    data.telefonoId,

    data.nombreCompleto,
    data.correoContacto,
    telefonoData.telefonoCompleto || null,

    data.nombreMarca,
    data.estadoUso,
    data.tipoProductoServicio,
    data.fraseSimple,

    data.alcanceUso,
    data.alcanceUsoOtro || null,

    data.existenMarcasSimilares,
    data.marcasSimilaresDetalle || null,
    data.diferenciador,

    data.tipoMarcaVisual,
    data.adjuntaLogo ? "S" : "N",

    data.haVendido,
    data.desdeCuandoUso || null,

    data.preguntaClave,
    JSON.stringify(data.resumen || {}),

    DB_USER,
  ];

  const [result] = await connection.execute(sql, valores);

  return result.insertId;
}

async function insertarAdjuntoRadiografia(connection, radiografiaId, file) {
  if (!file) {
    return null;
  }

  const rutaArchivo = `/uploads/radiografia-marca/${file.filename}`;

  const sql = `
    INSERT INTO re_radiografia_marca_adjunto (
      ra_radiografia_id,
      ra_nombre_original,
      ra_nombre_archivo,
      ra_ruta_archivo,
      ra_mime_type,
      ra_peso_bytes,
      ra_estado,
      ra_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, 'A', ?)
  `;

  const [result] = await connection.execute(sql, [
    radiografiaId,
    file.originalname,
    file.filename,
    rutaArchivo,
    file.mimetype,
    file.size,
    DB_USER,
  ]);

  return {
    adjuntoId: result.insertId,
    rutaArchivo,
  };
}

/* =========================================================
   CORREOS
========================================================= */

async function obtenerDestinatariosInternos(connection) {
  const sql = `
    SELECT DISTINCT ce.co_correo
    FROM re_usuario u
    INNER JOIN re_correo_electronico ce
      ON u.us_persona_id = ce.co_persona_id
    WHERE u.us_estado = 'A'
      AND u.us_atiende_clientes = 'S'
      AND ce.co_principal = 'S'
      AND ce.co_estado = 'A'
      AND ce.co_correo IS NOT NULL
      AND ce.co_correo <> ''
  `;

  const [rows] = await connection.execute(sql);

  const correos = rows.map((row) => row.co_correo);

  if (correos.length > 0) {
    return correos;
  }

  if (process.env.REVERA_ESTUDIO_DESTINATARIOS) {
    return process.env.REVERA_ESTUDIO_DESTINATARIOS
      .split(",")
      .map((correo) => correo.trim())
      .filter(Boolean);
  }

  if (process.env.SMTP_TO) {
    return [process.env.SMTP_TO];
  }

  return [];
}

function crearTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function construirResumenHtml(data) {
  const telefonoData = obtenerTelefonoNormalizado(data);

  return `
    <div style="font-family: Arial, sans-serif; color: #120742; line-height: 1.55;">
      <h2>Solicitud de Radiografía de Marca</h2>

      <h3>Datos de contacto</h3>
      <p><strong>Nombre completo:</strong> ${escaparHtml(data.nombreCompleto)}</p>
      <p><strong>Correo:</strong> ${escaparHtml(data.correoContacto)}</p>
      <p><strong>Teléfono:</strong> ${
        telefonoData.telefonoCompleto
          ? `+${escaparHtml(telefonoData.codigoPais)} ${escaparHtml(
              telefonoData.numero
            )}`
          : "No indicado"
      }</p>

      <h3>Datos de la marca</h3>
      <p><strong>Nombre de la marca:</strong> ${escaparHtml(data.nombreMarca)}</p>
      <p><strong>Estado de uso:</strong> ${escaparHtml(data.estadoUso)}</p>
      <p><strong>Producto o servicio:</strong> ${escaparHtml(
        data.tipoProductoServicio
      )}</p>
      <p><strong>Frase simple:</strong> ${escaparHtml(data.fraseSimple)}</p>

      <h3>Alcance</h3>
      <p><strong>Alcance de uso:</strong> ${escaparHtml(data.alcanceUso)}</p>
      ${
        data.alcanceUsoOtro
          ? `<p><strong>Detalle de alcance:</strong> ${escaparHtml(
              data.alcanceUsoOtro
            )}</p>`
          : ""
      }

      <h3>Marcas similares</h3>
      <p><strong>¿Existen marcas similares?:</strong> ${escaparHtml(
        data.existenMarcasSimilares
      )}</p>
      ${
        data.marcasSimilaresDetalle
          ? `<p><strong>Detalle marcas similares:</strong> ${escaparHtml(
              data.marcasSimilaresDetalle
            )}</p>`
          : ""
      }
      <p><strong>Diferenciador:</strong> ${escaparHtml(data.diferenciador)}</p>

      <h3>Logo / diseño</h3>
      <p><strong>Tipo de marca visual:</strong> ${escaparHtml(
        data.tipoMarcaVisual
      )}</p>
      <p><strong>Adjuntó logo/diseño:</strong> ${
        data.adjuntaLogo ? "Sí" : "No"
      }</p>

      <h3>Uso comercial</h3>
      <p><strong>¿Ha vendido?:</strong> ${escaparHtml(data.haVendido)}</p>
      ${
        data.desdeCuandoUso
          ? `<p><strong>Desde cuándo:</strong> ${escaparHtml(
              data.desdeCuandoUso
            )}</p>`
          : ""
      }

      <h3>Pregunta clave</h3>
      <p>${escaparHtml(data.preguntaClave)}</p>
    </div>
  `;
}

async function actualizarEstadoCorreo(
  connection,
  radiografiaId,
  enviado,
  error = null
) {
  const sql = `
    UPDATE re_radiografia_marca
    SET
      rm_correo_enviado = ?,
      rm_fecha_envio_correo = CASE WHEN ? = 'S' THEN NOW() ELSE rm_fecha_envio_correo END,
      rm_error_correo = ?,
      rm_usuario_modifica = ?,
      rm_fecha_modifica = NOW()
    WHERE rm_radiografia_id = ?
  `;

  await connection.execute(sql, [
    enviado,
    enviado,
    error,
    DB_USER,
    radiografiaId,
  ]);
}

async function enviarCorreosRadiografia(connection, radiografiaId, data, file) {
  const transporter = crearTransporter();

  const destinatariosInternos = await obtenerDestinatariosInternos(connection);

  const asuntoInterno = `Solicitud de Radiografía de Marca - ${data.nombreMarca}`;
  const asuntoCliente = "Recibimos tu solicitud de Radiografía de Marca";

  const htmlResumen = construirResumenHtml(data);

  const attachments = [];

  if (file) {
    attachments.push({
      filename: file.originalname,
      path: file.path,
    });
  }

  try {
    if (destinatariosInternos.length > 0) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: destinatariosInternos.join(","),
        subject: asuntoInterno,
        html: htmlResumen,
        attachments,
      });
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: data.correoContacto,
      subject: asuntoCliente,
      html: `
        <div style="font-family: Arial, sans-serif; color: #120742; line-height: 1.55;">
          <h2>Radiografía de Marca</h2>
          <p>Su solicitud de radiografía de marca ha sido enviada correctamente.</p>
          <p>Nos pondremos en contacto con usted.</p>
        </div>
      `,
    });

    await actualizarEstadoCorreo(connection, radiografiaId, "S", null);
  } catch (error) {
    await actualizarEstadoCorreo(connection, radiografiaId, "N", error.message);
    throw error;
  }
}

/* =========================================================
   FUNCIÓN PRINCIPAL
========================================================= */

async function registrarRadiografiaMarca(payload, file) {
  const data = normalizarPayload(payload);

  validarPayloadRadiografia(data);

  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    const personaInfo = await obtenerOCrearPersona(connection, data);

    const correoId = await obtenerOCrearCorreo(
      connection,
      personaInfo.personaId,
      data.correoContacto
    );

    const telefonoId = await obtenerOCrearTelefono(
      connection,
      personaInfo.personaId,
      data
    );

    const radiografiaId = await insertarRadiografiaMarca(connection, {
      ...data,
      personaId: personaInfo.personaId,
      correoId,
      telefonoId,
      adjuntaLogo: Boolean(file),
    });

    await insertarAdjuntoRadiografia(connection, radiografiaId, file);

    await enviarCorreosRadiografia(
      connection,
      radiografiaId,
      {
        ...data,
        adjuntaLogo: Boolean(file),
      },
      file
    );

    await connection.commit();

    return {
      radiografiaId,
      personaId: personaInfo.personaId,
      correoId,
      telefonoId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  registrarRadiografiaMarca,
};