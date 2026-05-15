const pool = require("../config/db");

async function obtenerArticulos() {
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
      DATE_FORMAT(ar_fecha_publicacion, '%d de %M, %Y') AS fechaPublicacion,
      ar_destacado AS destacado,
      ar_orden AS orden
    FROM re_articulo
    WHERE ar_estado = 'A'
    ORDER BY ar_destacado DESC, ar_orden ASC, ar_fecha_publicacion DESC
  `;

  const [rows] = await promisePool.query(sql);
  return rows;
}

async function obtenerArticuloPorSlug(slug) {
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
      DATE_FORMAT(ar_fecha_publicacion, '%M, %Y') AS fechaPublicacion,
      ar_destacado AS destacado
    FROM re_articulo
    WHERE ar_slug = ?
      AND ar_estado = 'A'
    LIMIT 1
  `;

  const [articulos] = await promisePool.query(sqlArticulo, [slug]);

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
      ab_caption AS caption
    FROM re_articulo_bloque
    WHERE ab_articulo_id = ?
      AND ab_estado = 'A'
    ORDER BY ab_orden ASC
  `;

  const [bloques] = await promisePool.query(sqlBloques, [articulo.id]);

  const sqlRelacionados = `
    SELECT
      r.ar_articulo_id AS id,
      r.ar_slug AS slug,
      r.ar_titulo AS titulo,
      r.ar_categoria AS categoria,
      r.ar_extracto AS extracto,
      DATE_FORMAT(r.ar_fecha_publicacion, '%d de %M, %Y') AS fechaPublicacion,
      r.ar_tiempo_lectura AS tiempoLectura,
      rr.rr_orden AS orden
    FROM re_articulo_relacionado rr
    INNER JOIN re_articulo r
      ON rr.rr_articulo_relacionado_id = r.ar_articulo_id
    WHERE rr.rr_articulo_id = ?
      AND rr.rr_estado = 'A'
      AND r.ar_estado = 'A'
    ORDER BY rr.rr_orden ASC
  `;

  const [relacionados] = await promisePool.query(sqlRelacionados, [articulo.id]);

  return {
    ...articulo,
    bloques,
    relacionados,
  };
}

module.exports = {
  obtenerArticulos,
  obtenerArticuloPorSlug,
};