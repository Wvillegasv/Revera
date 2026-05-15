const pool = require("../config/db");

const DB_USER = process.env.DB_USER || "WEBUSER";

async function crearArticulo(data) {
  const promisePool = pool.promise();

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
      ar_estado,
      ar_destacado,
      ar_orden,
      ar_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    data.slug,
    data.titulo,
    data.subtitulo || null,
    data.categoria || null,
    data.extracto || null,
    data.imagenPortada || null,
    data.tiempoLectura || null,
    data.fechaPublicacion || null,
    data.estado || "B",
    data.destacado || "N",
    data.orden || 0,
    DB_USER,
  ];

  const [result] = await promisePool.query(sql, valores);

  return result.insertId;
}

async function actualizarArticulo(id, data) {
  const promisePool = pool.promise();

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
      ar_estado = ?,
      ar_destacado = ?,
      ar_orden = ?,
      ar_usuario_modifica = ?,
      ar_fecha_modifica = NOW()
    WHERE ar_articulo_id = ?
  `;

  const valores = [
    data.slug,
    data.titulo,
    data.subtitulo || null,
    data.categoria || null,
    data.extracto || null,
    data.imagenPortada || null,
    data.tiempoLectura || null,
    data.fechaPublicacion || null,
    data.estado || "B",
    data.destacado || "N",
    data.orden || 0,
    DB_USER,
    id,
  ];

  const [result] = await promisePool.query(sql, valores);

  return result.affectedRows;
}

async function cambiarEstadoArticulo(id, estado) {
  const promisePool = pool.promise();

  const sql = `
    UPDATE re_articulo
    SET
      ar_estado = ?,
      ar_usuario_modifica = ?,
      ar_fecha_modifica = NOW()
    WHERE ar_articulo_id = ?
  `;

  const [result] = await promisePool.query(sql, [estado, DB_USER, id]);

  return result.affectedRows;
}

async function eliminarArticuloLogico(id) {
  return cambiarEstadoArticulo(id, "I");
}

async function crearBloque(articuloId, data) {
  const promisePool = pool.promise();

  const sql = `
    INSERT INTO re_articulo_bloque (
      ab_articulo_id,
      ab_orden,
      ab_tipo,
      ab_contenido,
      ab_imagen_url,
      ab_alt_text,
      ab_caption,
      ab_estado,
      ab_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const valores = [
    articuloId,
    data.orden || 0,
    data.tipo,
    data.contenido || null,
    data.imagenUrl || null,
    data.altText || null,
    data.caption || null,
    data.estado || "A",
    DB_USER,
  ];

  const [result] = await promisePool.query(sql, valores);

  return result.insertId;
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
    data.orden || 0,
    data.tipo,
    data.contenido || null,
    data.imagenUrl || null,
    data.altText || null,
    data.caption || null,
    data.estado || "A",
    bloqueId,
  ];

  const [result] = await promisePool.query(sql, valores);

  return result.affectedRows;
}

async function eliminarBloqueLogico(bloqueId) {
  const promisePool = pool.promise();

  const sql = `
    UPDATE re_articulo_bloque
    SET ab_estado = 'I'
    WHERE ab_bloque_id = ?
  `;

  const [result] = await promisePool.query(sql, [bloqueId]);

  return result.affectedRows;
}

async function crearRelacionado(articuloId, relacionadoId, orden = 0) {
  const promisePool = pool.promise();

  const sql = `
    INSERT INTO re_articulo_relacionado (
      rr_articulo_id,
      rr_articulo_relacionado_id,
      rr_orden,
      rr_estado
    )
    VALUES (?, ?, ?, 'A')
  `;

  const [result] = await promisePool.query(sql, [
    articuloId,
    relacionadoId,
    orden,
  ]);

  return result.insertId;
}

async function eliminarRelacionado(relacionId) {
  const promisePool = pool.promise();

  const sql = `
    UPDATE re_articulo_relacionado
    SET rr_estado = 'I'
    WHERE rr_relacion_id = ?
  `;

  const [result] = await promisePool.query(sql, [relacionId]);

  return result.affectedRows;
}

async function registrarImagenArticulo(articuloId, file, data = {}) {
  const promisePool = pool.promise();

  const rutaArchivo = `/uploads/guia/${file.filename}`;

  const sql = `
    INSERT INTO re_articulo_imagen (
      ai_articulo_id,
      ai_nombre_original,
      ai_nombre_archivo,
      ai_ruta_archivo,
      ai_mime_type,
      ai_peso_bytes,
      ai_alt_text,
      ai_caption,
      ai_estado,
      ai_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'A', ?)
  `;

  const valores = [
    articuloId,
    file.originalname,
    file.filename,
    rutaArchivo,
    file.mimetype,
    file.size,
    data.altText || null,
    data.caption || null,
    DB_USER,
  ];

  const [result] = await promisePool.query(sql, valores);

  return {
    id: result.insertId,
    url: rutaArchivo,
  };
}

module.exports = {
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
