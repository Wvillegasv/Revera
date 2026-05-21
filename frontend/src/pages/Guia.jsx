import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import Navbar from "../components/Navbar";
import { obtenerArticulos } from "../services/articulosApi";
import "../styles/guia.css";

const ORDEN_GUIA = [
  "clasificacion-de-marcas",
  "inteligencia-artificial-servicio-cliente",
  "productividad-negocio",
  "automatizacion-2026",
  "tendencias-atencion-cliente",
  "sistema-gestion-empresa",
  "trabajo-remoto-colaboracion-digital",
];

function ordenarArticulosGuia(articulos) {
  return articulos
    .filter((articulo) => ORDEN_GUIA.includes(articulo.slug))
    .sort(
      (a, b) =>
        ORDEN_GUIA.indexOf(a.slug) - ORDEN_GUIA.indexOf(b.slug)
    );
}

function Guia() {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarArticulos() {
      try {
        const data = await obtenerArticulos();
        setArticulos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando artículos:", err);
        setError("No fue posible cargar la guía.");
      } finally {
        setCargando(false);
      }
    }

    cargarArticulos();
  }, []);

  const destacado = useMemo(
    () => articulos.find((articulo) => articulo.destacado === "S"),
    [articulos]
  );

  const listado = useMemo(
    () => ordenarArticulosGuia(
      articulos.filter((articulo) => articulo.destacado !== "S")
    ),
    [articulos]
  );

  return (
    <div className="guia-page">
      <Navbar />

      <main className="guia-main">
        <header className="guia-hero">
          <h1>Guía rápida para registrar tu marca</h1>
          <p>
            Información esencial sobre el registro de marcas y propiedad
            intelectual
          </p>
        </header>

        {cargando && <p className="guia-status">Cargando guía...</p>}

        {error && <p className="guia-status guia-status-error">{error}</p>}

        {!cargando && !error && destacado && (
          <section className="guia-feature-card">
            <div className="guia-feature-logo" aria-hidden="true">
              <svg
                viewBox="0 0 100 100"
                className="guia-feature-logo-svg"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="guia-feature-logo-ring"
                />

                <g transform="translate(-2, 3)">
                  <path
                    d="M40 25 H58 C80 25, 80 52, 58 52 H40"
                    className="guia-feature-logo-stroke"
                  />

                  <circle
                    cx="40"
                    cy="52"
                    r="3.5"
                    className="guia-feature-logo-fill"
                  />

                  <path
                    d="M32 65 H39 L43.5 52 H36.5 L32 65 Z"
                    className="guia-feature-logo-fill"
                  />

                  <path
                    d="M58 52 C65 52, 72 58, 72 65"
                    className="guia-feature-logo-stroke"
                  />
                </g>
              </svg>
            </div>

            <div className="guia-feature-content">
              <span className="guia-badge">
                {destacado.categoria || "Información de la marca"}
              </span>

              <h2>{destacado.titulo}</h2>

              <p>{destacado.subtitulo || destacado.extracto}</p>

              <Link
                to={`/guia/${destacado.slug}`}
                className="guia-feature-link"
              >
                Conocer más sobre REVERA
                <ArrowRight size={18} strokeWidth={2.2} />
              </Link>
            </div>
          </section>
        )}

        {!cargando && !error && (
          <section className="guia-grid">
            {listado.map((articulo) => (
              <Link
                to={`/guia/${articulo.slug}`}
                className="guia-article-card"
                key={articulo.id}
              >
                <div className="guia-article-image" />

                <div className="guia-article-content">
                  <span className="guia-article-badge">
                    {articulo.categoria}
                  </span>

                  <h3>{articulo.titulo}</h3>

                  <p>{articulo.extracto}</p>

                  <div className="guia-article-meta">
                    <span>
                      <CalendarDays size={15} strokeWidth={2} />
                      {articulo.fechaPublicacion}
                    </span>

                    <span>
                      <Clock size={15} strokeWidth={2} />
                      {articulo.tiempoLectura}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default Guia;