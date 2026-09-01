import { Fragment } from "react";
import { Link } from "react-router-dom";
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

/*
  Admite los dos formatos de enlaces:

  1. Markdown:
     [nombre](/guia/como-elegir-nombre-marca-fuerte)

  2. HTML guardado en la base de datos:
     <a class="guia-revera-inline-link"
        href="/guia/como-elegir-nombre-marca-fuerte">nombre</a>

  No utiliza dangerouslySetInnerHTML.
*/
const REGEX_ENLACES =
  /<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>|\[([^\]]+)\]\(([^)]+)\)/gi;

function limpiarTextoEnlace(texto = "") {
  return String(texto)
    .replace(/<[^>]+>/g, "")
    .trim();
}

function normalizarUrlEnlace(url = "") {
  const valor = String(url).trim();

  if (
    valor.startsWith("/") ||
    valor.startsWith("http://") ||
    valor.startsWith("https://") ||
    valor.startsWith("mailto:") ||
    valor.startsWith("tel:")
  ) {
    return valor;
  }

  return "";
}

function parsearContenidoConLinks(texto = "") {
  const contenido = String(texto ?? "");
  const partes = [];

  let ultimoIndice = 0;
  let match;

  REGEX_ENLACES.lastIndex = 0;

  while ((match = REGEX_ENLACES.exec(contenido)) !== null) {
    if (match.index > ultimoIndice) {
      partes.push({
        tipo: "texto",
        contenido: contenido.slice(ultimoIndice, match.index),
      });
    }

    /*
      Formato HTML:
        match[2] = URL
        match[3] = texto visible

      Formato Markdown:
        match[4] = texto visible
        match[5] = URL
    */
    const url = normalizarUrlEnlace(match[2] || match[5] || "");
    const textoVisible = limpiarTextoEnlace(match[3] || match[4] || "");

    if (url && textoVisible) {
      partes.push({
        tipo: "link",
        texto: textoVisible,
        url,
      });
    } else {
      /*
        Si el enlace no es válido, se conserva el texto visible
        sin crear una etiqueta navegable.
      */
      partes.push({
        tipo: "texto",
        contenido: textoVisible || match[0],
      });
    }

    ultimoIndice = REGEX_ENLACES.lastIndex;
  }

  if (ultimoIndice < contenido.length) {
    partes.push({
      tipo: "texto",
      contenido: contenido.slice(ultimoIndice),
    });
  }

  return partes;
}

function ContenidoConLinks({ texto = "" }) {
  const partes = parsearContenidoConLinks(texto);

  return (
    <>
      {partes.map((parte, index) => {
        if (parte.tipo === "texto") {
          return (
            <Fragment key={`texto-${index}`}>
              {parte.contenido}
            </Fragment>
          );
        }

        const esExterno =
          parte.url.startsWith("http://") ||
          parte.url.startsWith("https://");

        const esRutaInterna = parte.url.startsWith("/");

        if (esRutaInterna) {
          return (
            <Link
              key={`link-interno-${index}`}
              to={parte.url}
              className="guia-revera-inline-link"
            >
              {parte.texto}
            </Link>
          );
        }

        return (
          <a
            key={`link-externo-${index}`}
            href={parte.url}
            className="guia-revera-inline-link"
            target={esExterno ? "_blank" : undefined}
            rel={esExterno ? "noreferrer noopener" : undefined}
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
          return (
            <ListaBloque
              key={bloque.id}
              contenido={bloque.contenido}
            />
          );
        }

        if (bloque.tipo === "cta") {
          return (
            <CtaBloque
              key={bloque.id}
              contenido={bloque.contenido}
            />
          );
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
