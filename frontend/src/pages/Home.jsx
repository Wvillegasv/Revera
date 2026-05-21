import { useState } from "react";
import { Search, FileText, CalendarDays, X } from "lucide-react";

import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";
import AgendaForm from "../components/AgendaForm";
import Footer from "../components/Footer";
import FloatingHelpButton from "../components/FloatingHelpButton";

import ChatbotRegistroMarca from "../components/chatbot-registro-marca/ChatbotRegistroMarca";
import ChatbotRadiografiaMarca from "../components/chatbot-radiografia-marca/ChatbotRadiografiaMarca";

import "../styles/revera.css";
import "../styles/hero.css";
import "../styles/agenda.css";

function Home() {
  const [mostrarContacto, setMostrarContacto] = useState(false);
  const [mostrarRegistroMarca, setMostrarRegistroMarca] = useState(false);
  const [mostrarRadiografiaMarca, setMostrarRadiografiaMarca] = useState(false);

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
    <div id="home-top" className="home-page">
      <Navbar onContactoClick={abrirContacto} />

      <main className="hero-section">
        <div className="hero-background-shape" aria-hidden="true"></div>

        <section className="hero-content">
          <div className="hero-brand-mark" aria-hidden="true">
            <div className="hero-logo-circle">
              <svg
                viewBox="0 0 100 100"
                className="hero-logo-svg"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="50" cy="50" r="44" className="hero-logo-ring" />

                <g transform="translate(-2, 3)">
                  <path
                    d="M40 25 H58 C80 25, 80 52, 58 52 H40"
                    className="hero-logo-stroke"
                  />

                  <circle cx="40" cy="52" r="3.5" className="hero-logo-fill" />

                  <path
                    d="M32 65 H39 L43.5 52 H36.5 L32 65 Z"
                    className="hero-logo-fill"
                  />

                  <path
                    d="M58 52 C65 52, 72 58, 72 65"
                    className="hero-logo-stroke"
                  />
                </g>
              </svg>
            </div>

            <div className="hero-dots">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          <h1>Un sistema claro para tomar decisiones sobre tu marca</h1>

          <h2>
            Analiza, registra o resuelve tus dudas con criterio jurídico en cada
            etapa del proceso.
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
              <h2>Agenda una Cita</h2>
              <p>Completa el formulario y nos pondremos en contacto contigo</p>
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

      <Footer />

      <FloatingHelpButton />
    </div>
  );
}

export default Home;