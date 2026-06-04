const pool = require("../config/db");

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

  const [articulos] = await promisePool.query(sqlArticulo, [id]);

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

  const [bloques] = await promisePool.query(sqlBloques, [id]);

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

  const [relacionados] = await promisePool.query(sqlRelacionados, [id]);

  return {
    ...articulo,
    bloques,
    relacionados,
  };
}

async function crearArticulo(data) {
  const promisePool = pool.promise();

  const titulo = String(data.titulo || "").trim();

  if (!titulo) {
    const error = new Error("El título del artículo es obligatorio.");
    error.statusCode = 400;
    throw error;
  }

  const slug = data.slug?.trim() || generarSlug(titulo);

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
    slug,
    titulo,
    data.subtitulo || null,
    data.categoria || "General",
    data.extracto || "",
    data.imagenPortada || null,
    data.tiempoLectura || "5 min",
    data.fechaPublicacion || new Date(),
    normalizarDestacado(data.destacado),
    normalizarEstado(data.estado),
    Number(data.orden || 0),
  ];

  const [result] = await promisePool.query(sql, valores);

  return {
    id: result.insertId,
    slug,
    titulo,
  };
}

async function actualizarArticulo(id, data) {
  const promisePool = pool.promise();

  const titulo = String(data.titulo || "").trim();

  if (!titulo) {
    const error = new Error("El título del artículo es obligatorio.");
    error.statusCode = 400;
    throw error;
  }

  const slug = data.slug?.trim() || generarSlug(titulo);

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
    slug,
    titulo,
    data.subtitulo || null,
    data.categoria || "General",
    data.extracto || "",
    data.imagenPortada || null,
    data.tiempoLectura || "5 min",
    data.fechaPublicacion || new Date(),
    normalizarDestacado(data.destacado),
    normalizarEstado(data.estado),
    Number(data.orden || 0),
    id,
  ];

  await promisePool.query(sql, valores);

  return {
    id,
    slug,
    titulo,
  };
}

async function cambiarEstadoArticulo(id, estado) {
  const promisePool = pool.promise();

  const sql = `
    UPDATE re_articulo
    SET ar_estado = ?
    WHERE ar_articulo_id = ?
  `;

  await promisePool.query(sql, [normalizarEstado(estado), id]);
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

  const orden = data.orden || (await obtenerSiguienteOrdenBloque(articuloId));

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
    articuloId,
    Number(orden),
    data.tipo || "parrafo",
    data.contenido || "",
    data.imagenUrl || null,
    data.altText || null,
    data.caption || null,
    normalizarEstado(data.estado),
  ];

  const [result] = await promisePool.query(sql, valores);

  return {
    id: result.insertId,
    articuloId,
    orden,
    tipo: data.tipo || "parrafo",
  };
}

async function actualizarBloque(bloqueId, data) {
  const promisePool = pool.promise();

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
    Number(data.orden || 0),
    data.tipo || "parrafo",
    data.contenido || "",
    data.imagenUrl || null,
    data.altText || null,
    data.caption || null,
    normalizarEstado(data.estado),
    bloqueId,
  ];

  await promisePool.query(sql, valores);
}

async function eliminarBloqueLogico(bloqueId) {
  const promisePool = pool.promise();

  const sql = `
    UPDATE re_articulo_bloque
    SET ab_estado = 'I'
    WHERE ab_bloque_id = ?
  `;

  await promisePool.query(sql, [bloqueId]);
}

async function crearRelacionado(articuloId, data) {
  const promisePool = pool.promise();

  const relacionadoId = data.relacionadoId || data.articuloRelacionadoId;

  if (!relacionadoId) {
    const error = new Error("Debe indicar el artículo relacionado.");
    error.statusCode = 400;
    throw error;
  }

  const orden = Number(data.orden || 1);

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
    articuloId,
    relacionadoId,
    orden,
    articuloId,
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

  await promisePool.query(sqlUpdate, [orden, articuloId, relacionadoId]);

  return {
    articuloId,
    relacionadoId,
    orden,
  };
}

async function eliminarRelacionado(relacionadoId, articuloId = null) {
  const promisePool = pool.promise();

  if (!relacionadoId) {
    const error = new Error("Debe indicar el artículo relacionado.");
    error.statusCode = 400;
    throw error;
  }

  /*
    Forma recomendada:
    inactiva solo la relación exacta:
    artículo principal + artículo relacionado.
  */
  if (articuloId) {
    const sql = `
      UPDATE re_articulo_relacionado
      SET rr_estado = 'I'
      WHERE rr_articulo_id = ?
        AND rr_articulo_relacionado_id = ?
    `;

    await promisePool.query(sql, [articuloId, relacionadoId]);
    return;
  }

  /*
    Compatibilidad con ruta anterior.
    Usar solo si no viene articuloId.
  */
  const sql = `
    UPDATE re_articulo_relacionado
    SET rr_estado = 'I'
    WHERE rr_articulo_relacionado_id = ?
  `;

  await promisePool.query(sql, [relacionadoId]);
}


async function registrarImagenArticulo(articuloId, file, data = {}) {
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