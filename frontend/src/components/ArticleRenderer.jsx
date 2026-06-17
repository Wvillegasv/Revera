import "../styles/guiarevera.css";

function obtenerUrlImagen(imagenUrl) {
  if (!imagenUrl) return "";

  if (imagenUrl.startsWith("http")) {
    return imagenUrl;
  }

  /*
    Si la imagen viene como /uploads/archivo.png,
    la dejamos como ruta relativa al mismo host.

    Con ngrok + Vite proxy, esto permite que:
    https://decency-womb-pulsate.ngrok-free.dev/uploads/...
    sea redirigido internamente al backend localhost:3000/uploads/...
  */
  if (imagenUrl.startsWith("/")) {
    return imagenUrl;
  }

  return `/${imagenUrl}`;
}

function parsearContenidoConLinks(texto = "") {
  const partes = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;

  let ultimoIndice = 0;
  let match;

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > ultimoIndice) {
      partes.push(texto.slice(ultimoIndice, match.index));
    }

    partes.push({
      tipo: "link",
      texto: match[1],
      url: match[2],
    });

    ultimoIndice = regex.lastIndex;
  }

  if (ultimoIndice < texto.length) {
    partes.push(texto.slice(ultimoIndice));
  }

  return partes;
}

function ContenidoConLinks({ texto }) {
  const partes = parsearContenidoConLinks(texto);

  return (
    <>
      {partes.map((parte, index) => {
        if (typeof parte === "string") {
          return <span key={`text-${index}`}>{parte}</span>;
        }

        const esExterno = parte.url.startsWith("http");

        return (
          <a
            key={`link-${index}`}
            href={parte.url}
            className="guia-revera-inline-link"
            target={esExterno ? "_blank" : undefined}
            rel={esExterno ? "noreferrer" : undefined}
          >
            {parte.texto}
          </a>
        );
      })}
    </>
  );
}

function ListaBloque({ contenido }) {
  const items = String(contenido || "")
    .split("\n")
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="guia-revera-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <ContenidoConLinks texto={item} />
        </li>
      ))}
    </ul>
  );
}

function CtaBloque({ contenido }) {
  return (
    <div className="guia-revera-cta">
      <ContenidoConLinks texto={contenido} />
    </div>
  );
}

function ArticleRenderer({ bloques = [] }) {
  return (
    <>
      {bloques.map((bloque) => {
        if (bloque.tipo === "titulo") {
          return (
            <h2 className="guia-revera-block-title" key={bloque.id}>
              <ContenidoConLinks texto={bloque.contenido} />
            </h2>
          );
        }

        if (bloque.tipo === "subtitulo") {
          return (
            <h3 className="guia-revera-block-subtitle" key={bloque.id}>
              <ContenidoConLinks texto={bloque.contenido} />
            </h3>
          );
        }

        if (bloque.tipo === "parrafo") {
          return (
            <p className="guia-revera-block-paragraph" key={bloque.id}>
              <ContenidoConLinks texto={bloque.contenido} />
            </p>
          );
        }

        if (bloque.tipo === "lista") {
          return <ListaBloque key={bloque.id} contenido={bloque.contenido} />;
        }

        if (bloque.tipo === "cta") {
          return <CtaBloque key={bloque.id} contenido={bloque.contenido} />;
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
                    loading="lazy"
                  />
                ) : (
                  bloque.contenido
                )}
              </div>

              {bloque.caption && (
                <figcaption className="guia-revera-figure-caption">
                  {bloque.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        return null;
      })}
    </>
  );
}

export default ArticleRenderer;