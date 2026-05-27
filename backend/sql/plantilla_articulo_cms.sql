USE revera_staging;

START TRANSACTION;

/* =========================================================
   PLANTILLA CMS ARTÍCULO REVERA
   Cambiar únicamente los valores marcados.
========================================================= */

SET @slug_articulo = 'slug-del-articulo';

SET @articulo_id = (
  SELECT ar_articulo_id
  FROM re_articulo
  WHERE ar_slug = @slug_articulo
  LIMIT 1
);

/* Validación visual */
SELECT 
  @articulo_id AS articulo_id,
  @slug_articulo AS slug_articulo;

/* =========================================================
   1. Actualizar datos principales del artículo
========================================================= */

UPDATE re_articulo
SET
  ar_titulo = 'Título del artículo',
  ar_categoria = 'Categoría',
  ar_extracto = 'Extracto corto que aparece en la tarjeta principal.',
  ar_tiempo_lectura = '5 min',
  ar_fecha_publicacion = '2026-01-01',
  ar_estado = 'A',
  ar_destacado = 'N',
  ar_orden = 1
WHERE ar_articulo_id = @articulo_id;

/* =========================================================
   2. Inactivar bloques anteriores
========================================================= */

UPDATE re_articulo_bloque
SET ab_estado = 'I'
WHERE ab_articulo_id = @articulo_id;

/* =========================================================
   3. Insertar nuevos bloques
   Tipos permitidos actuales:
   - parrafo
   - titulo
   - subtitulo
   - lista
   - cta
   - imagen
========================================================= */

INSERT INTO re_articulo_bloque (
  ab_articulo_id,
  ab_orden,
  ab_tipo,
  ab_contenido
)
VALUES
(
  @articulo_id,
  1,
  'parrafo',
  'Primer párrafo del artículo.'
),
(
  @articulo_id,
  2,
  'titulo',
  'Título interno del contenido'
),
(
  @articulo_id,
  3,
  'parrafo',
  'Segundo párrafo del artículo.'
),
(
  @articulo_id,
  4,
  'subtitulo',
  'Subtítulo interno'
),
(
  @articulo_id,
  5,
  'parrafo',
  'Texto relacionado con el subtítulo.'
),
(
  @articulo_id,
  6,
  'lista',
  'Primer punto de la lista;
Segundo punto de la lista;
Tercer punto de la lista.'
),
(
  @articulo_id,
  7,
  'cta',
  'Texto destacado o llamada a la acción.'
);

/* =========================================================
   4. Inactivar relaciones anteriores
========================================================= */

UPDATE re_articulo_relacionado
SET rr_estado = 'I'
WHERE rr_articulo_id = @articulo_id;

/* =========================================================
   5. Configurar artículos relacionados
   Cambiar los slugs relacionados según corresponda.
========================================================= */

SET @relacionado_1 = (
  SELECT ar_articulo_id
  FROM re_articulo
  WHERE ar_slug = 'slug-relacionado-1'
  LIMIT 1
);

SET @relacionado_2 = (
  SELECT ar_articulo_id
  FROM re_articulo
  WHERE ar_slug = 'slug-relacionado-2'
  LIMIT 1
);

/* Relacionado 1 */
INSERT INTO re_articulo_relacionado (
  rr_articulo_id,
  rr_articulo_relacionado_id,
  rr_orden,
  rr_estado
)
SELECT
  @articulo_id,
  @relacionado_1,
  1,
  'A'
WHERE @articulo_id IS NOT NULL
  AND @relacionado_1 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM re_articulo_relacionado rr
    WHERE rr.rr_articulo_id = @articulo_id
      AND rr.rr_articulo_relacionado_id = @relacionado_1
  );

UPDATE re_articulo_relacionado
SET
  rr_orden = 1,
  rr_estado = 'A'
WHERE rr_articulo_id = @articulo_id
  AND rr_articulo_relacionado_id = @relacionado_1;

/* Relacionado 2 */
INSERT INTO re_articulo_relacionado (
  rr_articulo_id,
  rr_articulo_relacionado_id,
  rr_orden,
  rr_estado
)
SELECT
  @articulo_id,
  @relacionado_2,
  2,
  'A'
WHERE @articulo_id IS NOT NULL
  AND @relacionado_2 IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM re_articulo_relacionado rr
    WHERE rr.rr_articulo_id = @articulo_id
      AND rr.rr_articulo_relacionado_id = @relacionado_2
  );

UPDATE re_articulo_relacionado
SET
  rr_orden = 2,
  rr_estado = 'A'
WHERE rr_articulo_id = @articulo_id
  AND rr_articulo_relacionado_id = @relacionado_2;

COMMIT;

/* =========================================================
   6. Validaciones
========================================================= */

SELECT
  ar_articulo_id,
  ar_slug,
  ar_titulo,
  ar_categoria,
  ar_estado,
  ar_destacado,
  ar_orden
FROM re_articulo
WHERE ar_slug = @slug_articulo;

SELECT 
  ab_orden,
  ab_tipo,
  LEFT(ab_contenido, 150) AS contenido,
  ab_estado
FROM re_articulo_bloque
WHERE ab_articulo_id = @articulo_id
  AND ab_estado = 'A'
ORDER BY ab_orden;

SELECT
  a.ar_titulo AS articulo_principal,
  r.ar_titulo AS articulo_relacionado,
  rr.rr_orden,
  rr.rr_estado
FROM re_articulo_relacionado rr
INNER JOIN re_articulo a
  ON rr.rr_articulo_id = a.ar_articulo_id
INNER JOIN re_articulo r
  ON rr.rr_articulo_relacionado_id = r.ar_articulo_id
WHERE rr.rr_articulo_id = @articulo_id
  AND rr.rr_estado = 'A'
ORDER BY rr.rr_orden ASC;
