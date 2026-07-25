import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, FileText, Search, X } from "lucide-react";

import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";
import AgendaForm from "../components/AgendaForm";
import Footer from "../components/Footer";
import FloatingHelpButton from "../components/FloatingHelpButton";

import ChatbotRegistroMarca from "../components/chatbot-registro-marca/ChatbotRegistroMarca";
import ChatbotRadiografiaMarca from "../components/chatbot-radiografia-marca/ChatbotRadiografiaMarca";

import reveraRMask from "../assets/revera-r-mask-solid.png";
import reveraOrbitMark from "../assets/revera-orbit-mark.png";

import "../styles/revera.css";
import "../styles/hero.css";
import "../styles/agenda.css";
import "../styles/chatbotRadiografiaMarca.css";

const MODALES = {
  CONTACTO: "contacto",
  REGISTRO_MARCA: "registroMarca",
  RADIOGRAFIA_MARCA: "radiografiaMarca",
};

function obtenerModalDesdeQuery(search) {
  const params = new URLSearchParams(search);

  if (params.get("abrirAgenda") === "true") {
    return MODALES.CONTACTO;
  }

  if (params.get("abrirRadiografia") === "true") {
    return MODALES.RADIOGRAFIA_MARCA;
  }

  if (params.get("abrirRegistroMarca") === "true") {
    return MODALES.REGISTRO_MARCA;
  }

  return null;
}

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  const [modalActivo, setModalActivo] = useState(() =>
    obtenerModalDesdeQuery(window.location.search)
  );

  useEffect(() => {
    const modalDesdeQuery = obtenerModalDesdeQuery(location.search);

    if (!modalDesdeQuery) {
      return undefined;
    }

    const temporizador = window.setTimeout(() => {
      setModalActivo(modalDesdeQuery);
      navigate("/", { replace: true });
    }, 0);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [location.search, navigate]);

  const abrirModal = (modal) => {
    setModalActivo(modal);
  };

  const cerrarModal = () => {
    setModalActivo(null);
  };

  const servicios = [
    {
      id: 1,
      icon: <Search size={36} strokeWidth={2.2} />,
      title: "Radiografía de Marca",
      subtitle: "Cómo validar tu marca antes de registrarla",
      description:
        "Revera te da una visión clara y estructurada de la viabilidad de tu marca antes de invertir tiempo, dinero o identidad en ella.",
      action: () => abrirModal(MODALES.RADIOGRAFIA_MARCA),
    },
    {
      id: 2,
      icon: <FileText size={36} strokeWidth={2.2} />,
      title: "Registro Estratégico de Marca",
      subtitle: "Registra tu marca con seguridad desde el inicio",
      description:
        "Gestionamos el proceso aplicando criterios jurídicos para reducir riesgos y evitar errores que puedan costarte.",
      action: () => abrirModal(MODALES.REGISTRO_MARCA),
    },
    {
      id: 3,
      icon: <CalendarDays size={36} strokeWidth={2.2} />,
      title: "Asesoría Personalizada",
      subtitle:
        "Si prefieres hablarlo antes de avanzar, este es tu punto de partida",
      description:
        "Agenda una sesión personalizada y obtén claridad sobre tu marca o cualquier cuestión de propiedad intelectual.",
      action: () => abrirModal(MODALES.CONTACTO),
    },
  ];

  return (
    <div id="home-top" className="home-page revera-page-shell">
      <div
        className="home-main-background-image"
        style={{ "--revera-r-mask": `url(${reveraRMask})` }}
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
        <Navbar onContactoClick={() => abrirModal(MODALES.CONTACTO)} />

        <main className="hero-section">
          <div className="hero-brand-mark" aria-hidden="true">
            <img
              src={reveraOrbitMark}
              className="hero-brand-mark-image"
              alt=""
            />
          </div>

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
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    service.action();
                  }
                }}
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

      {modalActivo === MODALES.CONTACTO && (
        <div className="contacto-modal-overlay" onClick={cerrarModal}>
          <div
            className="contacto-modal-container"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="contacto-modal-close"
              onClick={cerrarModal}
              aria-label="Cerrar formulario"
            >
              <X size={18} strokeWidth={2.1} />
            </button>

            <div className="contacto-modal-header">
              <div className="contacto-modal-title-group">
                <h2>Agenda una Cita</h2>

                <a
                  href="/guia/precios-servicios-revera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contacto-modal-title-link"
                >
                  Ver precios
                </a>
              </div>

              <div className="contacto-modal-subtitle-group">
                <p>
                  Completa el formulario y nos pondremos en contacto contigo.
                </p>

                <a
                  href="/guia/como-funcionan-servicios-revera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contacto-modal-subtitle-link"
                >
                  Cómo funcionan los servicios de Revera
                </a>
              </div>
            </div>

            <AgendaForm onSuccess={cerrarModal} />
          </div>
        </div>
      )}

      <ChatbotRegistroMarca
        abierto={modalActivo === MODALES.REGISTRO_MARCA}
        onClose={cerrarModal}
      />

      <ChatbotRadiografiaMarca
        abierto={modalActivo === MODALES.RADIOGRAFIA_MARCA}
        onClose={cerrarModal}
      />
    </div>
  );
}

export default Home;
