2. Estándar de tipos de bloque

Para que todos los artículos mantengan el diseño actual, usemos siempre estos tipos:

parrafo    -> texto normal
titulo     -> título morado principal dentro del artículo
subtitulo  -> subtítulo más pequeño en #2f2f46
lista      -> lista con viñetas
cta        -> cuadro destacado
imagen     -> imagen o diagrama

Ejemplo correcto para una lista:

(
  @articulo_id,
  6,
  'lista',
  'Primer punto;
Segundo punto;
Tercer punto.'
)

El frontend separa cada línea/punto según saltos de línea, pero si usamos punto y coma, visualmente puede quedar como texto corrido si no hay salto real. Para listas largas, mejor usar saltos de línea reales:

(
  @articulo_id,
  6,
  'lista',
  'Primer punto
Segundo punto
Tercer punto'
)