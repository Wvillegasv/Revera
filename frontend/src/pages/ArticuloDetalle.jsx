import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, Share2 } from "lucide-react";
import Navbar from "../components/Navbar";
import ArticleRenderer from "../components/ArticleRenderer";
import { obtenerArticuloPorSlug } from "../services/articulosApi";
import reveraLogo from "../assets/revera-logo.png";
import "../styles/guiarevera.css";

function ArticuloDetalle() {
  const { slug } = useParams();

  const [articulo, setArticulo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarArticulo() {
      try {
        const data = await obtenerArticuloPorSlug(slug);
        setArticulo(data);
      } catch (err) {
        console.error("Error cargando artículo:", err);
        setError("No fue posible cargar el artículo.");
      } finally {
        setCargando(false);
      }
    }

    cargarArticulo();
  }, [slug]);

  return (
    <div className="guia-revera-page">
      <Navbar />

      <main className="guia-revera-main">
        <Link to="/guia" className="guia-revera-back">
          <ArrowLeft size={17} strokeWidth={2} />
          Volver a la guía
        </Link>

        {cargando && (
          <section className="guia-placeholder-card">
            <p>Cargando artículo...</p>
          </section>
        )}

        {error && (
          <section className="guia-placeholder-card">
            <h1>Artículo no disponible</h1>
            <p>{error}</p>
          </section>
        )}

        {!cargando && !error && articulo && (
          <>
            <article className="guia-revera-article">
              <section className="guia-revera-cover">


                <div className="guia-revera-logo-text" aria-hidden="true">
                <img src={reveraLogo} alt="" />
                </div>


              </section>

              <section className="guia-revera-header">
                <span className="guia-revera-badge">
                  {articulo.categoria}
                </span>

                <h1>{articulo.titulo}</h1>

                <div className="guia-revera-meta">
                  <span>
                    <CalendarDays size={17} strokeWidth={2} />
                    {articulo.fechaPublicacion}
                  </span>

                  <span>
                    <Clock size={17} strokeWidth={2} />
                    {articulo.tiempoLectura}
                  </span>
                </div>

                <button type="button" className="guia-revera-share">
                  <Share2 size={18} strokeWidth={2.2} />
                  Compartir artículo
                </button>
              </section>
            </article>

            <section className="guia-revera-body">
              <ArticleRenderer bloques={articulo.bloques} />
            </section>

            {articulo.relacionados?.length > 0 && (
              <section className="guia-revera-related">
                <h2>Artículos Relacionados</h2>

                <div className="guia-revera-related-grid">
                  {articulo.relacionados.map((relacionado) => (
                    <Link
                      to={`/guia/${relacionado.slug}`}
                      className="guia-revera-related-item"
                      key={relacionado.id}
                    >
                      <div className="guia-revera-related-image" />

                      <div>
                        <h3>{relacionado.titulo}</h3>
                        <p>{relacionado.fechaPublicacion}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ArticuloDetalle;
