import { useState } from "react";
import { Search, FileText, CalendarDays, X } from "lucide-react";
import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";
import AgendaForm from "../components/AgendaForm";
import ChatbotRegistroMarca from "../components/chatbot-registro-marca/ChatbotRegistroMarca";
import "../styles/revera.css";
import "../styles/hero.css";
import "../styles/agenda.css";

function Home() {
  const [mostrarContacto, setMostrarContacto] = useState(false);
  const [mostrarRegistroMarca, setMostrarRegistroMarca] = useState(false);

  const servicios = [
    {
      id: 1,
      icon: <Search size={34} strokeWidth={2.2} />,
      title: "Estudio de Registrabilidad",
      description: "Verificamos si tu marca puede ser registrada legalmente",
    },
    {
      id: 2,
      icon: <FileText size={34} strokeWidth={2.2} />,
      title: "Registro de Marca",
      description: "Iniciamos el proceso completo de registro de tu marca",
      action: () => setMostrarRegistroMarca(true),
    },
    {
      id: 3,
      icon: <CalendarDays size={34} strokeWidth={2.2} />,
      title: "Asesoría Personalizada",
      description: "Agenda una cita con nuestros expertos",
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

          <h1>¿Necesitas ayuda con tu marca?</h1>
          <h2>¡Nosotros te ayudamos!</h2>
          <p>Selecciona el servicio que necesitas</p>
        </section>

        <section className="services-section">
          {servicios.map((service) => (
            <div
              key={service.id}
              onClick={service.action ? service.action : undefined}
              style={{ cursor: service.action ? "pointer" : "default" }}
            >
              <ServiceCard
                icon={service.icon}
                title={service.title}
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
            onClick={(e) => e.stopPropagation()}
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
    </div>
  );
}

export default Home;