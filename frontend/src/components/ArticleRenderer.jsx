import "../styles/guiarevera.css";

function obtenerUrlImagen(imagenUrl) {
  if (!imagenUrl) return "";

  if (imagenUrl.startsWith("http")) {
    return imagenUrl;
  }

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  return `${apiBaseUrl}${imagenUrl}`;
}

function ArticleRenderer({ bloques = [] }) {
  return (
    <>
      {bloques.map((bloque) => {
        if (bloque.tipo === "parrafo") {
          return <p key={bloque.id}>{bloque.contenido}</p>;
        }

        if (bloque.tipo === "imagen") {
          const imagenFinalUrl = obtenerUrlImagen(bloque.imagenUrl);

          return (
            <figure className="guia-revera-figure" key={bloque.id}>
              <div className="guia-revera-figure-image">
                {imagenFinalUrl ? (
                  <img
                    src={imagenFinalUrl}
                    alt={bloque.altText || bloque.contenido || ""}
                  />
                ) : (
                  bloque.contenido
                )}
              </div>

              {bloque.caption && <figcaption>{bloque.caption}</figcaption>}
            </figure>
          );
        }

        if (bloque.tipo === "subtitulo") {
          return <h2 key={bloque.id}>{bloque.contenido}</h2>;
        }

        return null;
      })}
    </>
  );
}

export default ArticleRenderer;