import { useState } from "react";
import Navbar from "../components/Navbar";
import ServiceCard from "../components/ServiceCard";
import AgendaForm from "../components/AgendaForm";
import { Search, FileText, CalendarDays, X } from "lucide-react";
import "../styles/revera.css";
import "../styles/hero.css";
import "../styles/agenda.css";

function Home() {
  const [mostrarContacto, setMostrarContacto] = useState(false);

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

  return (
    <div id="home-top" className="home-page">
      <Navbar onContactoClick={abrirContacto} />

      <main className="hero-section">
        <div className="hero-background-shape">
          <div className="hero-logo-circle">R</div>

          <div className="hero-dots">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <section className="hero-content">
          <h1>¿Necesitas ayuda con tu marca?</h1>
          <h2>¡Nosotros te ayudamos!</h2>
          <p>Selecciona el servicio que necesitas</p>
        </section>

        <section className="services-section">
          {servicios.map((service) => (
            <ServiceCard
              key={service.id}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
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
              <X size={22} />
            </button>

            <div className="contacto-modal-header">
              <h2>Agenda una Cita</h2>
              <p>Completa el formulario y nos pondremos en contacto contigo</p>
            </div>

            <AgendaForm onSuccess={cerrarContacto} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
