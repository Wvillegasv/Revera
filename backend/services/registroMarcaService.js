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

function generarTelefonoCompleto(codigoPais, numero) {
  const codigo = sanitizarTexto(codigoPais);
  const telefono = sanitizarTexto(numero);

  if (!codigo || !telefono) return "";

  return `${codigo}${telefono}`;
}

function obtenerTelefonoNormalizado(data) {
  const codigoPais = sanitizarTexto(data.telefonoCodigoPais);
  const numero = sanitizarTexto(data.telefonoNumero);
  const telefono = sanitizarTexto(data.telefono);

  if (codigoPais || numero) {
    if (!codigoPais || !numero) {
      throw crearError("Debe indicar código de país y número de teléfono.");
    }

    if (!/^\d+$/.test(codigoPais)) {
      throw crearError("El código de país debe contener solo números.");
    }

    if (!/^\d+$/.test(numero)) {
      throw crearError("El número de teléfono debe contener solo números.");
    }

    if (codigoPais === "506" && numero.length !== 8) {
      throw crearError("Para Costa Rica, el número debe tener 8 dígitos.");
    }

    return {
      codigoPais,
      numero,
      completo: `${codigoPais}${numero}`,
    };
  }

  if (!telefono) {
    return {
      codigoPais: "",
      numero: "",
      completo: "",
    };
  }

  const limpio = telefono.replace(/\D/g, "");

  if (limpio.startsWith("506") && limpio.length === 11) {
    return {
      codigoPais: "506",
      numero: limpio.substring(3),
      completo: limpio,
    };
  }

  throw crearError(
    "El teléfono debe enviarse como código país y número. Ejemplo: 506 y 88887777."
  );
}

function validarTelefonoSeparado(data) {
  const telefonoData = obtenerTelefonoNormalizado(data);

  return Boolean(telefonoData.codigoPais && telefonoData.numero);
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

function normalizarPayload(body) {
  return {
    correo: sanitizarTexto(body.correo).toLowerCase(),
    nombreCompleto: sanitizarTexto(body.nombreCompleto),

    direccionContacto: sanitizarTexto(
       body.direccionContacto ||
       body.personaDireccion ||
       body.empresaDomicilioSocial ||
       body.direccionEstablecimiento
    ),

    telefonoCodigoPais: sanitizarTexto(body.telefonoCodigoPais),
    telefonoNumero: sanitizarTexto(body.telefonoNumero),
    telefono:
      generarTelefonoCompleto(body.telefonoCodigoPais, body.telefonoNumero) ||
      sanitizarTexto(body.telefono),

    tipoTramite: sanitizarTexto(body.tipoTramite),
    nombreMarca: sanitizarTexto(body.nombreMarca),
    tipoMarca: sanitizarTexto(body.tipoMarca),
    queDeseaRegistrar: sanitizarTexto(body.queDeseaRegistrar),
    productosServiciosTipo: sanitizarTexto(body.productosServiciosTipo),
    detalleProductosServicios: sanitizarTexto(body.detalleProductosServicios),
    claseNiza: sanitizarTexto(body.claseNiza),
    paisOrigen: sanitizarTexto(body.paisOrigen),
    paisOrigenOtro: sanitizarTexto(body.paisOrigenOtro),
    direccionEstablecimiento: sanitizarTexto(body.direccionEstablecimiento),
    informacionAdicional: sanitizarTexto(body.informacionAdicional),
    registroPrevioOtroPais: sanitizarTexto(body.registroPrevioOtroPais),
    giroActividad: sanitizarTexto(body.giroActividad),

    tipoTitular: sanitizarTexto(body.tipoTitular),

    personaNombre: sanitizarTexto(body.personaNombre),
    personaEstadoCivil: sanitizarTexto(body.personaEstadoCivil),
    personaProfesion: sanitizarTexto(body.personaProfesion),
    personaTipoIdentificacion: sanitizarTexto(body.personaTipoIdentificacion),
    personaNumeroIdentificacion: sanitizarTexto(
      body.personaNumeroIdentificacion
    ),
    personaDireccion: sanitizarTexto(body.personaDireccion),
    personaPaisNacionalidad: sanitizarTexto(body.personaPaisNacionalidad),
    personaPaisNacionalidadOtro: sanitizarTexto(
      body.personaPaisNacionalidadOtro
    ),
    personaPaisResidencia: sanitizarTexto(body.personaPaisResidencia),
    personaPaisResidenciaOtro: sanitizarTexto(body.personaPaisResidenciaOtro),

    personaTelefonoCodigoPais: sanitizarTexto(body.personaTelefonoCodigoPais),
    personaTelefonoNumero: sanitizarTexto(body.personaTelefonoNumero),
    personaTelefono:
      generarTelefonoCompleto(
        body.personaTelefonoCodigoPais,
        body.personaTelefonoNumero
      ) || sanitizarTexto(body.personaTelefono),

    personaInformacionAdicional: sanitizarTexto(
      body.personaInformacionAdicional
    ),

    empresaNombre: sanitizarTexto(body.empresaNombre),
    empresaIdentificacion: sanitizarTexto(body.empresaIdentificacion),
    empresaPaisConstitucion: sanitizarTexto(body.empresaPaisConstitucion),
    empresaPaisConstitucionOtro: sanitizarTexto(
      body.empresaPaisConstitucionOtro
    ),
    empresaDomicilioSocial: sanitizarTexto(body.empresaDomicilioSocial),

    representanteNombre: sanitizarTexto(body.representanteNombre),
    representanteEstadoCivil: sanitizarTexto(body.representanteEstadoCivil),
    representanteProfesion: sanitizarTexto(body.representanteProfesion),
    representanteTipoIdentificacion: sanitizarTexto(
      body.representanteTipoIdentificacion
    ),
    representanteNumeroIdentificacion: sanitizarTexto(
      body.representanteNumeroIdentificacion
    ),
    representantePaisNacionalidad: sanitizarTexto(
      body.representantePaisNacionalidad
    ),
    representantePaisNacionalidadOtro: sanitizarTexto(
      body.representantePaisNacionalidadOtro
    ),
    representantePaisResidencia: sanitizarTexto(
      body.representantePaisResidencia
    ),
    representantePaisResidenciaOtro: sanitizarTexto(
      body.representantePaisResidenciaOtro
    ),
    representanteDireccion: sanitizarTexto(body.representanteDireccion),

    representanteTelefonoCodigoPais: sanitizarTexto(
      body.representanteTelefonoCodigoPais
    ),
    representanteTelefonoNumero: sanitizarTexto(
      body.representanteTelefonoNumero
    ),
    representanteTelefono:
      generarTelefonoCompleto(
        body.representanteTelefonoCodigoPais,
        body.representanteTelefonoNumero
      ) || sanitizarTexto(body.representanteTelefono),

    empresaInformacionAdicional: sanitizarTexto(
      body.empresaInformacionAdicional
    ),
  };
}

function validarPayload(data) {
  if (!data.correo || !validarCorreo(data.correo)) {
    throw crearError("El correo electrónico no es válido.");
  }

  if (!data.nombreCompleto || data.nombreCompleto.length < 8) {
    throw crearError("El nombre completo es obligatorio.");
  }

  if (!validarTelefonoSeparado(data)) {
    throw crearError("El número de teléfono no es válido.");
  }

  if (!data.tipoTramite) {
    throw crearError("El tipo de trámite es obligatorio.");
  }

  if (!data.nombreMarca || data.nombreMarca.length < 2) {
    throw crearError(
      "El nombre de la marca o nombre comercial es obligatorio."
    );
  }

  if (!data.tipoTitular) {
    throw crearError("Debe indicar si el titular es Persona o Empresa.");
  }

  if (data.tipoTramite === "Marca") {
    if (!data.tipoMarca) {
      throw crearError("El tipo de marca es obligatorio.");
    }

    if (!data.queDeseaRegistrar) {
      throw crearError("Debe indicar qué desea registrar.");
    }

    if (!data.productosServiciosTipo) {
      throw crearError(
        "Debe indicar si corresponde a productos, servicios o ambos."
      );
    }

    if (
      !data.detalleProductosServicios ||
      data.detalleProductosServicios.length < 10
    ) {
      throw crearError("Debe detallar los productos o servicios.");
    }

    if (!data.claseNiza) {
      throw crearError("La clase Niza es obligatoria.");
    }

    if (!data.paisOrigen) {
      throw crearError("El país de origen es obligatorio.");
    }

    if (data.paisOrigen === "Otro" && !data.paisOrigenOtro) {
      throw crearError("Debe indicar el otro país de origen.");
    }

    if (
      !data.direccionEstablecimiento ||
      data.direccionEstablecimiento.length < 10
    ) {
      throw crearError("La dirección del establecimiento es obligatoria.");
    }
  }

  if (data.tipoTramite === "Nombre Comercial") {
    if (!data.giroActividad) {
      throw crearError("El giro o actividad es obligatorio.");
    }

    if (!data.queDeseaRegistrar) {
      throw crearError("Debe indicar qué desea registrar.");
    }

    if (!data.productosServiciosTipo) {
      throw crearError(
        "Debe indicar si corresponde a productos, servicios o ambos."
      );
    }

    if (
      !data.detalleProductosServicios ||
      data.detalleProductosServicios.length < 10
    ) {
      throw crearError("Debe detallar los productos o servicios.");
    }

    if (!data.paisOrigen) {
      throw crearError("El país de origen es obligatorio.");
    }

    if (data.paisOrigen === "Otro" && !data.paisOrigenOtro) {
      throw crearError("Debe indicar el otro país de origen.");
    }

    if (
      !data.direccionEstablecimiento ||
      data.direccionEstablecimiento.length < 10
    ) {
      throw crearError("La dirección del establecimiento es obligatoria.");
    }
  }

  if (data.tipoTitular === "Persona") {
    if (!data.personaNombre || data.personaNombre.length < 8) {
      throw crearError("El nombre del titular persona es obligatorio.");
    }

    if (!data.personaTipoIdentificacion) {
      throw crearError("El tipo de identificación del titular es obligatorio.");
    }

    if (!data.personaNumeroIdentificacion) {
      throw crearError(
        "El número de identificación del titular es obligatorio."
      );
    }

    if (!data.personaDireccion || data.personaDireccion.length < 10) {
      throw crearError("La dirección del titular es obligatoria.");
    }

    if (
      !validarTelefonoSeparado({
        telefonoCodigoPais: data.personaTelefonoCodigoPais,
        telefonoNumero: data.personaTelefonoNumero,
        telefono: data.personaTelefono,
      })
    ) {
      throw crearError("El teléfono del titular no es válido.");
    }

    if (
      data.personaPaisNacionalidad === "Otro" &&
      !data.personaPaisNacionalidadOtro
    ) {
      throw crearError(
        "Debe indicar el otro país de nacionalidad del titular."
      );
    }

    if (
      data.personaPaisResidencia === "Otro" &&
      !data.personaPaisResidenciaOtro
    ) {
      throw crearError(
        "Debe indicar el otro país de residencia del titular."
      );
    }
  }

  if (data.tipoTitular === "Empresa") {
    if (!data.empresaNombre) {
      throw crearError("El nombre de la empresa es obligatorio.");
    }

    if (!data.empresaIdentificacion) {
      throw crearError("La identificación de la empresa es obligatoria.");
    }

    if (!data.empresaPaisConstitucion) {
      throw crearError("El país de constitución es obligatorio.");
    }

    if (
      data.empresaPaisConstitucion === "Otro" &&
      !data.empresaPaisConstitucionOtro
    ) {
      throw crearError(
        "Debe indicar el otro país de constitución de la empresa."
      );
    }

    if (
      !data.empresaDomicilioSocial ||
      data.empresaDomicilioSocial.length < 10
    ) {
      throw crearError("El domicilio social es obligatorio.");
    }

    if (!data.representanteNombre || data.representanteNombre.length < 8) {
      throw crearError("El nombre del representante legal es obligatorio.");
    }

    if (!data.representanteTipoIdentificacion) {
      throw crearError(
        "El tipo de identificación del representante es obligatorio."
      );
    }

    if (!data.representanteNumeroIdentificacion) {
      throw crearError(
        "El número de identificación del representante es obligatorio."
      );
    }

    if (
      !data.representanteDireccion ||
      data.representanteDireccion.length < 10
    ) {
      throw crearError("La dirección del representante es obligatoria.");
    }

    if (
      !validarTelefonoSeparado({
        telefonoCodigoPais: data.representanteTelefonoCodigoPais,
        telefonoNumero: data.representanteTelefonoNumero,
        telefono: data.representanteTelefono,
      })
    ) {
      throw crearError("El teléfono del representante no es válido.");
    }

    if (
      data.representantePaisNacionalidad === "Otro" &&
      !data.representantePaisNacionalidadOtro
    ) {
      throw crearError(
        "Debe indicar el otro país de nacionalidad del representante."
      );
    }

    if (
      data.representantePaisResidencia === "Otro" &&
      !data.representantePaisResidenciaOtro
    ) {
      throw crearError(
        "Debe indicar el otro país de residencia del representante."
      );
    }
  }
}

function resolverValorPais(valor, valorOtro) {
  if (valor === "Otro") {
    return valorOtro || "Otro";
  }

  return valor || "";
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
    WHERE LOWER(c.co_correo) = LOWER(?)
      AND c.co_estado = 'A'
      AND p.pe_estado = 'A'
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

  const { nombre, apellido1, apellido2 } =
    dividirNombreCompleto(nombreCompleto);

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
      AND LOWER(co_correo) = LOWER(?)
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

async function existeTelefonoActivo(connection, personaId, payload) {
  const telefonoData = obtenerTelefonoNormalizado(payload);

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

  return rows.length > 0;
}

async function insertarTelefono(connection, personaId, payload) {
  const telefonoData = obtenerTelefonoNormalizado(payload);

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
    telefonoData.codigoPais,
    telefonoData.numero,
    "S",
    "M",
    "A",
    DB_USER,
  ]);

  return telefonoId;
}


function obtenerDireccionCliente(payload) {
  return sanitizarTexto(
    payload.direccionContacto ||
      payload.personaDireccion ||
      payload.empresaDomicilioSocial ||
      payload.direccionEstablecimiento
  );
}

async function obtenerDireccion(connection, personaId, direccion) {
  const sql = `
    SELECT di_direccion_id
    FROM re_direccion
    WHERE di_persona_id = ?
      AND TRIM(LOWER(di_detalle)) = TRIM(LOWER(?))
      AND di_estado = 'A'
    LIMIT 1
  `;

  const [rows] = await connection.execute(sql, [personaId, direccion]);

  return rows[0] || null;
}

async function insertarDireccion(connection, personaId, direccion) {
  const direccionId = await obtenerSiguienteId(
    connection,
    "re_direccion",
    "di_direccion_id"
  );

  const sql = `
    INSERT INTO re_direccion (
      di_direccion_id,
      di_persona_id,
      di_detalle,
      di_principal,
      di_tipo_direccion,
      di_estado,
      di_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  await connection.execute(sql, [
    direccionId,
    personaId,
    direccion,
    "S",
    "O",
    "A",
    DB_USER,
  ]);

  return direccionId;
}

async function obtenerOCrearDireccion(connection, personaId, payload) {
  const direccion = obtenerDireccionCliente(payload);

  if (!direccion) {
    return null;
  }

  const direccionExistente = await obtenerDireccion(
    connection,
    personaId,
    direccion
  );

  if (direccionExistente) {
    return direccionExistente.di_direccion_id;
  }

  return insertarDireccion(connection, personaId, direccion);
}


async function insertarSolicitud(connection, personaId, payload, files) {
  const sql = `
    INSERT INTO re_solicitud_registro_marca (
      srm_persona_id,
      srm_correo_contacto,
      srm_telefono_contacto,
      srm_tipo_tramite,
      srm_nombre_signo,
      srm_tipo_titular,
      srm_tiene_logo,
      srm_estado,
      srm_payload_json,
      srm_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const payloadGuardar = {
    ...payload,
    paisOrigen: resolverValorPais(payload.paisOrigen, payload.paisOrigenOtro),
    personaPaisNacionalidad: resolverValorPais(
      payload.personaPaisNacionalidad,
      payload.personaPaisNacionalidadOtro
    ),
    personaPaisResidencia: resolverValorPais(
      payload.personaPaisResidencia,
      payload.personaPaisResidenciaOtro
    ),
    empresaPaisConstitucion: resolverValorPais(
      payload.empresaPaisConstitucion,
      payload.empresaPaisConstitucionOtro
    ),
    representantePaisNacionalidad: resolverValorPais(
      payload.representantePaisNacionalidad,
      payload.representantePaisNacionalidadOtro
    ),
    representantePaisResidencia: resolverValorPais(
      payload.representantePaisResidencia,
      payload.representantePaisResidenciaOtro
    ),
  };

  const [result] = await connection.execute(sql, [
    personaId,
    payload.correo,
    payload.telefono,
    payload.tipoTramite,
    payload.nombreMarca,
    payload.tipoTitular,
    files.length > 0 ? "S" : "N",
    "P",
    JSON.stringify(payloadGuardar),
    DB_USER,
  ]);

  return result.insertId;
}

async function insertarAdjunto(connection, solicitudId, file) {
  const sql = `
    INSERT INTO re_solicitud_registro_marca_adjunto (
      srma_solicitud_id,
      srma_nombre_original,
      srma_nombre_archivo,
      srma_ruta_archivo,
      srma_mime_type,
      srma_peso_bytes,
      srma_estado,
      srma_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const rutaRelativa = path
    .join("uploads", "registro-marca", file.filename)
    .replace(/\\/g, "/");

  await connection.execute(sql, [
    solicitudId,
    file.originalname,
    file.filename,
    rutaRelativa,
    file.mimetype,
    file.size,
    "A",
    DB_USER,
  ]);
}

async function obtenerCorreosDestinatariosRegistroMarca(connection) {
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

  return rows.map((row) => row.co_correo);
}

async function registrarSolicitudRegistroMarca({ body, files = [] }) {
  const payload = normalizarPayload(body);

  validarPayload(payload);

  const promisePool = pool.promise();

  let connection;

  try {
    connection = await promisePool.getConnection();

    if (!connection) {
      throw crearError("No se pudo obtener conexión a la base de datos.", 500);
    }

    await connection.beginTransaction();

    let personaId = await buscarPersonaPorCorreo(connection, payload.correo);

    if (!personaId) {
      personaId = await insertarPersona(connection, payload.nombreCompleto);
    }

    const correoExiste = await existeCorreoActivo(
      connection,
      personaId,
      payload.correo
    );

    if (!correoExiste) {
      await insertarCorreo(connection, personaId, payload.correo);
    }

    const telefonoExiste = await existeTelefonoActivo(
      connection,
      personaId,
      payload
    );

    if (!telefonoExiste) {
      await insertarTelefono(connection, personaId, payload);
    }

    await obtenerOCrearDireccion(connection, personaId, payload);

    const solicitudId = await insertarSolicitud(
      connection,
      personaId,
      payload,
      files
    ); 

    for (const file of files) {
      await insertarAdjunto(connection, solicitudId, file);
    }

    const destinatarios = await obtenerCorreosDestinatariosRegistroMarca(
      connection
    );

    await connection.commit();

    return {
      solicitudId,
      personaId,
      totalAdjuntos: files.length,
      payload,
      files,
      destinatarios,
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
  registrarSolicitudRegistroMarca,
};
