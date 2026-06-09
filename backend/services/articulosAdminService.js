const pool = require("../config/db");

const TIPOS_BLOQUE_PERMITIDOS = [
  "parrafo",
  "titulo",
  "subtitulo",
  "lista",
  "cta",
  "imagen",
];

function crearErrorValidacion(mensaje, statusCode = 400) {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
}

function normalizarEstado(valor, defaultValue = "A") {
  if (!valor) return defaultValue;

  const estado = String(valor).trim().toUpperCase();

  return estado === "I" ? "I" : "A";
}

function normalizarDestacado(valor) {
  if (!valor) return "N";

  const destacado = String(valor).trim().toUpperCase();

  return destacado === "S" ? "S" : "N";
}

function generarSlug(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validarIdNumerico(valor, nombreCampo) {
  const numero = Number(valor);

  if (!Number.isInteger(numero) || numero <= 0) {
    throw crearErrorValidacion(`${nombreCampo} no es válido.`);
  }

  return numero;
}

function validarOrden(valor, nombreCampo = "El orden") {
  const numero = Number(valor ?? 0);

  if (!Number.isFinite(numero) || numero < 0) {
    throw crearErrorValidacion(`${nombreCampo} debe ser un número válido.`);
  }

  return numero;
}

function validarFechaYYYYMMDD(fecha) {
  if (!fecha) {
    throw crearErrorValidacion("La fecha de publicación es obligatoria.");
  }

  const valor = String(fecha).trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw crearErrorValidacion(
      "La fecha de publicación debe tener formato yyyy-mm-dd."
    );
  }

  const fechaObj = new Date(`${valor}T00:00:00`);

  if (Number.isNaN(fechaObj.getTime())) {
    throw crearErrorValidacion("La fecha de publicación no es válida.");
  }

  return valor;
}

async function existeArticulo(id) {
  const promisePool = pool.promise();

  const [rows] = await promisePool.query(
    `
      SELECT ar_articulo_id
      FROM re_articulo
      WHERE ar_articulo_id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows.length > 0;
}

async function validarArticuloExiste(id) {
  const articuloId = validarIdNumerico(id, "El artículo");

  const existe = await existeArticulo(articuloId);

  if (!existe) {
    throw crearErrorValidacion("El artículo indicado no existe.", 404);
  }

  return articuloId;
}

async function validarSlugUnico(slug, articuloIdExcluir = null) {
  const promisePool = pool.promise();

  const valores = [slug];
  let filtro = "";

  if (articuloIdExcluir) {
    filtro = "AND ar_articulo_id <> ?";
    valores.push(articuloIdExcluir);
  }

  const [rows] = await promisePool.query(
    `
      SELECT ar_articulo_id
      FROM re_articulo
      WHERE ar_slug = ?
        ${filtro}
      LIMIT 1
    `,
    valores
  );

  if (rows.length > 0) {
    throw crearErrorValidacion(
      "Ya existe un artículo con ese slug. Use un slug diferente."
    );
  }
}

function validarPayloadArticulo(data = {}) {
  const titulo = String(data.titulo || "").trim();

  if (!titulo) {
    throw crearErrorValidacion("El título del artículo es obligatorio.");
  }

  const slug = String(data.slug || generarSlug(titulo)).trim();

  if (!slug) {
    throw crearErrorValidacion("El slug del artículo es obligatorio.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw crearErrorValidacion(
      "El slug solo puede contener letras minúsculas, números y guiones."
    );
  }

  const categoria = String(data.categoria || "").trim();

  if (!categoria) {
    throw crearErrorValidacion("La categoría del artículo es obligatoria.");
  }

  const fechaPublicacion = validarFechaYYYYMMDD(
    data.fechaPublicacion || new Date().toISOString().slice(0, 10)
  );

  const orden = validarOrden(data.orden, "El orden del artículo");

  return {
    slug,
    titulo,
    subtitulo: data.subtitulo || null,
    categoria,
    extracto: data.extracto || "",
    imagenPortada: data.imagenPortada || null,
    tiempoLectura: data.tiempoLectura || "5 min",
    fechaPublicacion,
    destacado: normalizarDestacado(data.destacado),
    estado: normalizarEstado(data.estado),
    orden,
  };
}

function validarPayloadBloque(data = {}) {
  const tipo = String(data.tipo || "parrafo").trim().toLowerCase();

  if (!TIPOS_BLOQUE_PERMITIDOS.includes(tipo)) {
    throw crearErrorValidacion("El tipo de bloque no es válido.");
  }

  const orden = validarOrden(data.orden, "El orden del bloque");
  const contenido = String(data.contenido || "").trim();
  const imagenUrl = data.imagenUrl ? String(data.imagenUrl).trim() : null;

  if (tipo !== "imagen" && !contenido) {
    throw crearErrorValidacion("El contenido del bloque es obligatorio.");
  }

  if (tipo === "imagen" && !imagenUrl) {
    throw crearErrorValidacion(
      "Para bloques de imagen debe indicar la URL de la imagen."
    );
  }

  return {
    orden,
    tipo,
    contenido,
    imagenUrl,
    altText: data.altText || null,
    caption: data.caption || null,
    estado: normalizarEstado(data.estado),
  };
}

async function listarArticulos() {
  const promisePool = pool.promise();

  const sql = `
    SELECT
      ar_articulo_id AS id,
      ar_slug AS slug,
      ar_titulo AS titulo,
      ar_subtitulo AS subtitulo,
      ar_categoria AS categoria,
      ar_extracto AS extracto,
      ar_imagen_portada AS imagenPortada,
      ar_tiempo_lectura AS tiempoLectura,
      DATE_FORMAT(ar_fecha_publicacion, '%Y-%m-%d') AS fechaPublicacion,
      ar_destacado AS destacado,
      ar_estado AS estado,
      ar_orden AS orden
    FROM re_articulo
    ORDER BY ar_orden ASC, ar_fecha_publicacion DESC, ar_articulo_id DESC
  `;

  const [rows] = await promisePool.query(sql);
  return rows;
}

async function obtenerArticuloPorId(id) {
  const promisePool = pool.promise();

  const articuloId = validarIdNumerico(id, "El artículo");

  const sqlArticulo = `
    SELECT
      ar_articulo_id AS id,
      ar_slug AS slug,
      ar_titulo AS titulo,
      ar_subtitulo AS subtitulo,
      ar_categoria AS categoria,
      ar_extracto AS extracto,
      ar_imagen_portada AS imagenPortada,
      ar_tiempo_lectura AS tiempoLectura,
      DATE_FORMAT(ar_fecha_publicacion, '%Y-%m-%d') AS fechaPublicacion,
      ar_destacado AS destacado,
      ar_estado AS estado,
      ar_orden AS orden
    FROM re_articulo
    WHERE ar_articulo_id = ?
    LIMIT 1
  `;

  const [articulos] = await promisePool.query(sqlArticulo, [articuloId]);

  if (articulos.length === 0) {
    return null;
  }

  const articulo = articulos[0];

  const sqlBloques = `
    SELECT
      ab_bloque_id AS id,
      ab_orden AS orden,
      ab_tipo AS tipo,
      ab_contenido AS contenido,
      ab_imagen_url AS imagenUrl,
      ab_alt_text AS altText,
      ab_caption AS caption,
      ab_estado AS estado
    FROM re_articulo_bloque
    WHERE ab_articulo_id = ?
    ORDER BY ab_orden ASC, ab_bloque_id ASC
  `;

  const [bloques] = await promisePool.query(sqlBloques, [articuloId]);

  const sqlRelacionados = `
    SELECT
      rr.rr_articulo_id AS articuloId,
      rr.rr_articulo_relacionado_id AS relacionadoId,
      rr.rr_orden AS orden,
      rr.rr_estado AS estado,
      r.ar_titulo AS titulo,
      r.ar_slug AS slug,
      r.ar_categoria AS categoria
    FROM re_articulo_relacionado rr
    INNER JOIN re_articulo r
      ON rr.rr_articulo_relacionado_id = r.ar_articulo_id
    WHERE rr.rr_articulo_id = ?
    ORDER BY rr.rr_orden ASC
  `;

  const [relacionados] = await promisePool.query(sqlRelacionados, [articuloId]);

  return {
    ...articulo,
    bloques,
    relacionados,
  };
}

async function crearArticulo(data) {
  const promisePool = pool.promise();

  const articulo = validarPayloadArticulo(data);

  await validarSlugUnico(articulo.slug);

  const sql = `
    INSERT INTO re_articulo (
      ar_slug,
      ar_titulo,
      ar_subtitulo,
      ar_categoria,
      ar_extracto,
      ar_imagen_portada,
      ar_tiempo_lectura,
      ar_fecha_publicacion,
      ar_destacado,
      ar_estado,
      ar_orden
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    articulo.slug,
    articulo.titulo,
    articulo.subtitulo,
    articulo.categoria,
    articulo.extracto,
    articulo.imagenPortada,
    articulo.tiempoLectura,
    articulo.fechaPublicacion,
    articulo.destacado,
    articulo.estado,
    articulo.orden,
  ];

  const [result] = await promisePool.query(sql, valores);

  return {
    id: result.insertId,
    slug: articulo.slug,
    titulo: articulo.titulo,
  };
}

async function actualizarArticulo(id, data) {
  const promisePool = pool.promise();

  const articuloId = await validarArticuloExiste(id);
  const articulo = validarPayloadArticulo(data);

  await validarSlugUnico(articulo.slug, articuloId);

  const sql = `
    UPDATE re_articulo
    SET
      ar_slug = ?,
      ar_titulo = ?,
      ar_subtitulo = ?,
      ar_categoria = ?,
      ar_extracto = ?,
      ar_imagen_portada = ?,
      ar_tiempo_lectura = ?,
      ar_fecha_publicacion = ?,
      ar_destacado = ?,
      ar_estado = ?,
      ar_orden = ?
    WHERE ar_articulo_id = ?
  `;

  const valores = [
    articulo.slug,
    articulo.titulo,
    articulo.subtitulo,
    articulo.categoria,
    articulo.extracto,
    articulo.imagenPortada,
    articulo.tiempoLectura,
    articulo.fechaPublicacion,
    articulo.destacado,
    articulo.estado,
    articulo.orden,
    articuloId,
  ];

  await promisePool.query(sql, valores);

  return {
    id: articuloId,
    slug: articulo.slug,
    titulo: articulo.titulo,
  };
}

async function cambiarEstadoArticulo(id, estado) {
  const promisePool = pool.promise();

  const articuloId = await validarArticuloExiste(id);

  const sql = `
    UPDATE re_articulo
    SET ar_estado = ?
    WHERE ar_articulo_id = ?
  `;

  await promisePool.query(sql, [normalizarEstado(estado), articuloId]);
}

async function eliminarArticuloLogico(id) {
  return cambiarEstadoArticulo(id, "I");
}

async function obtenerSiguienteOrdenBloque(articuloId) {
  const promisePool = pool.promise();

  const sql = `
    SELECT COALESCE(MAX(ab_orden), 0) + 1 AS siguienteOrden
    FROM re_articulo_bloque
    WHERE ab_articulo_id = ?
  `;

  const [rows] = await promisePool.query(sql, [articuloId]);

  return rows[0]?.siguienteOrden || 1;
}

async function crearBloque(articuloId, data) {
  const promisePool = pool.promise();

  const idArticulo = await validarArticuloExiste(articuloId);

  const dataBloque = {
    ...data,
    orden: data.orden || (await obtenerSiguienteOrdenBloque(idArticulo)),
  };

  const bloque = validarPayloadBloque(dataBloque);

  const sql = `
    INSERT INTO re_articulo_bloque (
      ab_articulo_id,
      ab_orden,
      ab_tipo,
      ab_contenido,
      ab_imagen_url,
      ab_alt_text,
      ab_caption,
      ab_estado
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    idArticulo,
    bloque.orden,
    bloque.tipo,
    bloque.contenido,
    bloque.imagenUrl,
    bloque.altText,
    bloque.caption,
    bloque.estado,
  ];

  const [result] = await promisePool.query(sql, valores);

  return {
    id: result.insertId,
    articuloId: idArticulo,
    orden: bloque.orden,
    tipo: bloque.tipo,
  };
}

async function actualizarBloque(bloqueId, data) {
  const promisePool = pool.promise();

  const idBloque = validarIdNumerico(bloqueId, "El bloque");
  const bloque = validarPayloadBloque(data);

  const sql = `
    UPDATE re_articulo_bloque
    SET
      ab_orden = ?,
      ab_tipo = ?,
      ab_contenido = ?,
      ab_imagen_url = ?,
      ab_alt_text = ?,
      ab_caption = ?,
      ab_estado = ?
    WHERE ab_bloque_id = ?
  `;

  const valores = [
    bloque.orden,
    bloque.tipo,
    bloque.contenido,
    bloque.imagenUrl,
    bloque.altText,
    bloque.caption,
    bloque.estado,
    idBloque,
  ];

  await promisePool.query(sql, valores);
}

async function eliminarBloqueLogico(bloqueId) {
  const promisePool = pool.promise();

  const idBloque = validarIdNumerico(bloqueId, "El bloque");

  const sql = `
    UPDATE re_articulo_bloque
    SET ab_estado = 'I'
    WHERE ab_bloque_id = ?
  `;

  await promisePool.query(sql, [idBloque]);
}

async function crearRelacionado(articuloId, data) {
  const promisePool = pool.promise();

  const idArticulo = await validarArticuloExiste(articuloId);
  const relacionadoId = validarIdNumerico(
    data.relacionadoId || data.articuloRelacionadoId,
    "El artículo relacionado"
  );

  if (idArticulo === relacionadoId) {
    throw crearErrorValidacion(
      "Un artículo no puede relacionarse consigo mismo."
    );
  }

  await validarArticuloExiste(relacionadoId);

  const orden = validarOrden(data.orden || 1, "El orden del relacionado");

  const [relacionActiva] = await promisePool.query(
    `
      SELECT rr_articulo_id
      FROM re_articulo_relacionado
      WHERE rr_articulo_id = ?
        AND rr_articulo_relacionado_id = ?
        AND rr_estado = 'A'
      LIMIT 1
    `,
    [idArticulo, relacionadoId]
  );

  if (relacionActiva.length > 0) {
    throw crearErrorValidacion(
      "Este artículo relacionado ya está agregado como activo."
    );
  }

  const sqlInsert = `
    INSERT INTO re_articulo_relacionado (
      rr_articulo_id,
      rr_articulo_relacionado_id,
      rr_orden,
      rr_estado
    )
    SELECT ?, ?, ?, 'A'
    WHERE NOT EXISTS (
      SELECT 1
      FROM re_articulo_relacionado rr
      WHERE rr.rr_articulo_id = ?
        AND rr.rr_articulo_relacionado_id = ?
    )
  `;

  await promisePool.query(sqlInsert, [
    idArticulo,
    relacionadoId,
    orden,
    idArticulo,
    relacionadoId,
  ]);

  const sqlUpdate = `
    UPDATE re_articulo_relacionado
    SET
      rr_orden = ?,
      rr_estado = 'A'
    WHERE rr_articulo_id = ?
      AND rr_articulo_relacionado_id = ?
  `;

  await promisePool.query(sqlUpdate, [orden, idArticulo, relacionadoId]);

  return {
    articuloId: idArticulo,
    relacionadoId,
    orden,
  };
}

async function eliminarRelacionado(relacionadoId, articuloId = null) {
  const promisePool = pool.promise();

  const idRelacionado = validarIdNumerico(
    relacionadoId,
    "El artículo relacionado"
  );

  if (articuloId) {
    const idArticulo = validarIdNumerico(articuloId, "El artículo");

    const sql = `
      UPDATE re_articulo_relacionado
      SET rr_estado = 'I'
      WHERE rr_articulo_id = ?
        AND rr_articulo_relacionado_id = ?
    `;

    await promisePool.query(sql, [idArticulo, idRelacionado]);
    return;
  }

  const sql = `
    UPDATE re_articulo_relacionado
    SET rr_estado = 'I'
    WHERE rr_articulo_relacionado_id = ?
  `;

  await promisePool.query(sql, [idRelacionado]);
}

async function registrarImagenArticulo(articuloId, file, data = {}) {
  if (!file) {
    throw crearErrorValidacion("Debe adjuntar una imagen.");
  }

  const rutaPublica = `/uploads/guia/${file.filename}`;

  const bloque = await crearBloque(articuloId, {
    tipo: "imagen",
    contenido: data.contenido || data.altText || file.originalname,
    imagenUrl: rutaPublica,
    altText: data.altText || file.originalname,
    caption: data.caption || "",
    estado: "A",
  });

  return {
    ...bloque,
    imagenUrl: rutaPublica,
    filename: file.filename,
    originalname: file.originalname,
  };
}

module.exports = {
  listarArticulos,
  obtenerArticuloPorId,
  crearArticulo,
  actualizarArticulo,
  cambiarEstadoArticulo,
  eliminarArticuloLogico,
  crearBloque,
  actualizarBloque,
  eliminarBloqueLogico,
  crearRelacionado,
  eliminarRelacionado,
  registrarImagenArticulo,
};