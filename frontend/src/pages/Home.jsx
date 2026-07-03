import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, FileText, CalendarDays, X } from "lucide-react";

import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";
import AgendaForm from "../components/AgendaForm";
import Footer from "../components/Footer";
import FloatingHelpButton from "../components/FloatingHelpButton";

import ChatbotRegistroMarca from "../components/chatbot-registro-marca/ChatbotRegistroMarca";
import ChatbotRadiografiaMarca from "../components/chatbot-radiografia-marca/ChatbotRadiografiaMarca";

import homeMainBg from "../assets/home-main-bg.png";

import "../styles/revera.css";
import "../styles/hero.css";
import "../styles/agenda.css";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mostrarContacto, setMostrarContacto] = useState(false);
  const [mostrarRegistroMarca, setMostrarRegistroMarca] = useState(false);
  const [mostrarRadiografiaMarca, setMostrarRadiografiaMarca] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const abrirAgenda = params.get("abrirAgenda");
    const abrirRadiografia = params.get("abrirRadiografia");
    const abrirRegistroMarca = params.get("abrirRegistroMarca");

    if (abrirAgenda === "true") {
      setMostrarRegistroMarca(false);
      setMostrarRadiografiaMarca(false);
      setMostrarContacto(true);

      navigate("/", { replace: true });
      return;
    }

    if (abrirRadiografia === "true") {
      setMostrarContacto(false);
      setMostrarRegistroMarca(false);
      setMostrarRadiografiaMarca(true);

      navigate("/", { replace: true });
      return;
    }

    if (abrirRegistroMarca === "true") {
      setMostrarContacto(false);
      setMostrarRadiografiaMarca(false);
      setMostrarRegistroMarca(true);

      navigate("/", { replace: true });
    }
  }, [location.search, navigate]);

  const servicios = [
    {
      id: 1,
      icon: <Search size={36} strokeWidth={2.2} />,
      title: "Radiografía de Marca",
      subtitle: "Cómo validar tu marca antes de registrarla",
      description:
        "Revera te da una visión clara y estructurada de la viabilidad de tu marca antes de invertir tiempo, dinero o identidad en ella.",
      action: () => setMostrarRadiografiaMarca(true),
    },
    {
      id: 2,
      icon: <FileText size={36} strokeWidth={2.2} />,
      title: "Registro Estratégico de Marca",
      subtitle: "Registra tu marca con seguridad desde el inicio",
      description:
        "Gestionamos el proceso aplicando criterios jurídicos para reducir riesgos y evitar errores que puedan costarte.",
      action: () => setMostrarRegistroMarca(true),
    },
    {
      id: 3,
      icon: <CalendarDays size={36} strokeWidth={2.2} />,
      title: "Asesoría Personalizada",
      subtitle:
        "Si prefieres hablarlo antes de avanzar, este es tu punto de partida",
      description:
        "Agenda una sesión personalizada y obtén claridad sobre tu marca o cualquier cuestión de propiedad intelectual.",
      action: () => setMostrarContacto(true),
    },
  ];

  const abrirContacto = () => {
    setMostrarRegistroMarca(false);
    setMostrarRadiografiaMarca(false);
    setMostrarContacto(true);
  };

  const cerrarContacto = () => {
    setMostrarContacto(false);
  };

  const cerrarRegistroMarca = () => {
    setMostrarRegistroMarca(false);
  };

  const cerrarRadiografiaMarca = () => {
    setMostrarRadiografiaMarca(false);
  };

  return (
    <div id="home-top" className="home-page revera-page-shell">
      <div
        className="home-main-background-image"
        style={{ backgroundImage: `url(${homeMainBg})` }}
        aria-hidden="true"
      />

      <div
        className="home-background-glow home-background-glow-left"
        aria-hidden="true"
      />

      <div
        className="home-background-glow home-background-glow-right"
        aria-hidden="true"
      />

      <div className="revera-content-layer">
        <Navbar onContactoClick={abrirContacto} />

        <main className="hero-section">
          <section className="hero-content">
            <h1>Un sistema claro para tomar decisiones sobre tu marca</h1>

            <h2>
              Analiza, registra o resuelve tus dudas con criterio jurídico en
              cada etapa del proceso.
            </h2>

            <p>Selecciona el camino que mejor se adapte a tu caso</p>
          </section>

          <section className="services-section">
            {servicios.map((service) => (
              <div
                key={service.id}
                onClick={service.action}
                style={{ cursor: service.action ? "pointer" : "default" }}
              >
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  subtitle={service.subtitle}
                  description={service.description}
                />
              </div>
            ))}
          </section>
        </main>

        <Footer />

        <FloatingHelpButton />
      </div>

      {mostrarContacto && (
        <div className="contacto-modal-overlay" onClick={cerrarContacto}>
          <div
            className="contacto-modal-container"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="contacto-modal-close"
              onClick={cerrarContacto}
              aria-label="Cerrar formulario"
            >
              <X size={18} strokeWidth={2.1} />
            </button>

            <div className="contacto-modal-header">
              <h2>
                Agenda una Cita{" "}
                <a
                  href="/guia/precios-servicios-revera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contacto-modal-title-link"
                >
                  Ver precios
                </a>
              </h2>

              <p>
                Completa el formulario y nos pondremos en contacto contigo. {" "}
                <a
                  href="/guia/como-funcionan-servicios-revera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contacto-modal-subtitle-link"
                >
                  Cómo funcionan los servicios de Revera
                </a>
              </p>
            </div>

            <AgendaForm onSuccess={cerrarContacto} />
          </div>
        </div>
      )}

      <ChatbotRegistroMarca
        abierto={mostrarRegistroMarca}
        onClose={cerrarRegistroMarca}
      />

      <ChatbotRadiografiaMarca
        abierto={mostrarRadiografiaMarca}
        onClose={cerrarRadiografiaMarca}
      />
    </div>
  );
}

export default Home;
