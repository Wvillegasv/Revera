USE revera_staging;

/* =========================================================
   LIMPIAR RELACIONES
========================================================= */

DELETE FROM re_articulo_relacionado;
DELETE FROM re_articulo_bloque;
DELETE FROM re_articulo_imagen;
DELETE FROM re_articulo;

/* =========================================================
   RESETEAR AUTO_INCREMENT
========================================================= */

ALTER TABLE re_articulo AUTO_INCREMENT = 1;
ALTER TABLE re_articulo_bloque AUTO_INCREMENT = 1;
ALTER TABLE re_articulo_imagen AUTO_INCREMENT = 1;
ALTER TABLE re_articulo_relacionado AUTO_INCREMENT = 1;

/* =========================================================
   ARTICULOS
========================================================= */

INSERT INTO re_articulo
(
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
VALUES
(
  'que-es-revera',
  '¿Qué es REVERA y cómo te ayudamos?',
  'Conoce nuestra empresa de servicios de registro de marcas y el proceso completo para proteger tu marca de manera profesional y eficiente.',
  'Acerca de REVERA',
  'Conoce nuestra empresa de servicios de registro de marcas y el proceso completo para proteger tu marca.',
  NULL,
  '8 min',
  '2026-05-01',
  'A',
  'S',
  1,
  'WEBUSER'
),

(
  'inteligencia-artificial-servicio-cliente',
  'Cómo la Inteligencia Artificial está transformando el servicio al cliente',
  NULL,
  'Tecnología',
  'Descubre cómo los chatbots y asistentes virtuales están revolucionando la forma en que las empresas interactúan con sus clientes.',
  NULL,
  '5 min',
  '2026-02-05',
  'A',
  'N',
  2,
  'WEBUSER'
),

(
  'productividad-negocio',
  '10 Consejos para mejorar la productividad en tu negocio',
  NULL,
  'Productividad',
  'Aprende estrategias efectivas para optimizar tus procesos y aumentar la eficiencia de tu equipo de trabajo.',
  NULL,
  '7 min',
  '2026-02-02',
  'A',
  'N',
  3,
  'WEBUSER'
),

(
  'automatizacion-2026',
  'La importancia de la automatización en 2026',
  NULL,
  'Automatización',
  'Explora por qué la automatización es crucial para mantenerse competitivo en el mercado actual y cómo implementarla.',
  NULL,
  '6 min',
  '2026-01-28',
  'A',
  'N',
  4,
  'WEBUSER'
),

(
  'tendencias-atencion-cliente',
  'Tendencias en atención al cliente para este año',
  NULL,
  'Tendencias',
  'Las últimas tendencias que están definiendo el futuro de la atención al cliente y cómo adaptarse a ellas.',
  NULL,
  '4 min',
  '2026-01-25',
  'A',
  'N',
  5,
  'WEBUSER'
),

(
  'sistema-gestion-empresa',
  'Cómo elegir el mejor sistema de gestión para tu empresa',
  NULL,
  'Gestión',
  'Guía completa para seleccionar la herramienta de gestión que mejor se adapte a las necesidades de tu negocio.',
  NULL,
  '8 min',
  '2026-01-20',
  'A',
  'N',
  6,
  'WEBUSER'
),

(
  'trabajo-remoto-colaboracion-digital',
  'El futuro del trabajo remoto y la colaboración digital',
  NULL,
  'Trabajo Remoto',
  'Analiza cómo el trabajo remoto está evolucionando y qué herramientas son esenciales para equipos distribuidos.',
  NULL,
  '6 min',
  '2026-01-15',
  'A',
  'N',
  7,
  'WEBUSER'
);

/* =========================================================
   BLOQUES DEL ARTICULO REVERA
========================================================= */

INSERT INTO re_articulo_bloque
(
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
SELECT
  ar_articulo_id,
  1,
  'parrafo',
  'REVERA es una empresa especializada en servicios de registro de marcas y propiedad intelectual. Nuestra misión es proteger la identidad de tu negocio de manera profesional, eficiente y accesible.',
  NULL,
  NULL,
  NULL,
  'A',
  'WEBUSER'
FROM re_articulo
WHERE ar_slug = 'que-es-revera';

INSERT INTO re_articulo_bloque
(
  ab_articulo_id,
  ab_orden,
  ab_tipo,
  ab_contenido,
  ab_estado,
  ab_usuario_crea
)
SELECT
  ar_articulo_id,
  2,
  'parrafo',
  'Entendemos que tu marca es más que un simple logo o nombre comercial. Es la representación de años de esfuerzo, dedicación y la esencia de tu negocio.',
  'A',
  'WEBUSER'
FROM re_articulo
WHERE ar_slug = 'que-es-revera';

INSERT INTO re_articulo_bloque
(
  ab_articulo_id,
  ab_orden,
  ab_tipo,
  ab_contenido,
  ab_estado,
  ab_usuario_crea
)
SELECT
  ar_articulo_id,
  3,
  'subtitulo',
  'Nuestros servicios',
  'A',
  'WEBUSER'
FROM re_articulo
WHERE ar_slug = 'que-es-revera';

INSERT INTO re_articulo_bloque
(
  ab_articulo_id,
  ab_orden,
  ab_tipo,
  ab_contenido,
  ab_estado,
  ab_usuario_crea
)
SELECT
  ar_articulo_id,
  4,
  'parrafo',
  'Ofrecemos tres opciones principales: Radiografía de Marca, Registro Estratégico de Marca y Asesoría Personalizada.',
  'A',
  'WEBUSER'
FROM re_articulo
WHERE ar_slug = 'que-es-revera';

INSERT INTO re_articulo_bloque
(
  ab_articulo_id,
  ab_orden,
  ab_tipo,
  ab_contenido,
  ab_caption,
  ab_estado,
  ab_usuario_crea
)
SELECT
  ar_articulo_id,
  5,
  'imagen',
  'Proceso de registro de marca REVERA',
  'Diagrama del proceso completo de registro de marca',
  'A',
  'WEBUSER'
FROM re_articulo
WHERE ar_slug = 'que-es-revera';

INSERT INTO re_articulo_bloque
(
  ab_articulo_id,
  ab_orden,
  ab_tipo,
  ab_contenido,
  ab_estado,
  ab_usuario_crea
)
SELECT
  ar_articulo_id,
  6,
  'parrafo',
  'En REVERA utilizamos tecnología moderna para hacer el proceso más eficiente. Nuestro sistema permite dar seguimiento en tiempo real.',
  'A',
  'WEBUSER'
FROM re_articulo
WHERE ar_slug = 'que-es-revera';

INSERT INTO re_articulo_bloque
(
  ab_articulo_id,
  ab_orden,
  ab_tipo,
  ab_contenido,
  ab_estado,
  ab_usuario_crea
)
SELECT
  ar_articulo_id,
  7,
  'parrafo',
  'Proteger tu marca es una inversión en el futuro de tu negocio. Con REVERA, tienes un aliado confiable para garantizar su protección legal.',
  'A',
  'WEBUSER'
FROM re_articulo
WHERE ar_slug = 'que-es-revera';

/* =========================================================
   RELACIONADOS
========================================================= */

INSERT INTO re_articulo_relacionado
(
  rr_articulo_id,
  rr_articulo_relacionado_id,
  rr_orden,
  rr_estado
)
SELECT
  a.ar_articulo_id,
  r.ar_articulo_id,
  1,
  'A'
FROM re_articulo a
INNER JOIN re_articulo r
  ON r.ar_slug = 'inteligencia-artificial-servicio-cliente'
WHERE a.ar_slug = 'que-es-revera';

INSERT INTO re_articulo_relacionado
(
  rr_articulo_id,
  rr_articulo_relacionado_id,
  rr_orden,
  rr_estado
)
SELECT
  a.ar_articulo_id,
  r.ar_articulo_id,
  2,
  'A'
FROM re_articulo a
INNER JOIN re_articulo r
  ON r.ar_slug = 'productividad-negocio'
WHERE a.ar_slug = 'que-es-revera';

/* =========================================================
   VALIDACION
========================================================= */

SELECT
  ar_articulo_id,
  ar_slug,
  ar_titulo,
  ar_estado,
  ar_destacado
FROM re_articulo
ORDER BY ar_orden;
