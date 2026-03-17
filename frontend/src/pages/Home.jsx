import { useRef, useState } from "react"
import "../styles/revera.css"
import "../styles/hero.css"
import "../styles/agenda.css"

import Navbar from "../components/Navbar"
import ContactInfo from "../components/ContactInfo"
import AgendaForm from "../components/AgendaForm"
import ServiceCard from "../components/ServiceCard"

import { Search, FileText, CalendarDays } from "lucide-react"

import rFondo from "../assets/r-fondo.jpg"
import tresPuntos from "../assets/tres-puntos.jpg"
import logoR from "../assets/logo-r.jpg"



function Home() {
  const [mostrarAgenda, setMostrarAgenda] = useState(false)
  const agendaRef = useRef(null)

  const abrirAgenda = () => {
    setMostrarAgenda(true)

    setTimeout(() => {
      agendaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })
    }, 100)
  }

  return (
    <div className="home">
      <Navbar onContactoClick={abrirAgenda} />

      <section className="hero">
        <img src={rFondo} alt="" className="hero-r-bg" />
        <img src={logoR} alt="" className="hero-logo-top" />
        <img src={tresPuntos} alt="" className="hero-dots" />

        <div className="hero-text">
          <h1>¿Necesitas ayuda con tu marca?</h1>
          <h2>¡Nosotros te ayudamos!</h2>
          <p>Selecciona el servicio que necesitas</p>
        </div>
      </section>

      <section className="services">
        <ServiceCard
          titulo="Estudio de Registrabilidad"
          descripcion="Verificamos si tu marca puede ser registrada legalmente"
          icono={<Search size={28} />}
        />

        <ServiceCard
          titulo="Registro de Marca"
          descripcion="Iniciamos el proceso completo de registro de tu marca"
          icono={<FileText size={28} />}
        />

        <ServiceCard
          titulo="Asesoría Personalizada"
          descripcion="Agenda una cita con nuestros expertos"
          icono={<CalendarDays size={28} />}
          onClick={abrirAgenda}
        />
      </section>

      {mostrarAgenda && (
        <section ref={agendaRef} className="agenda-section">
          <div className="agenda-header">
            <h1>Agenda una Cita</h1>
            <p>Completa el formulario y nos pondremos en contacto contigo</p>
          </div>

          <div className="agenda-layout">
            <ContactInfo />
            <AgendaForm />
          </div>
        </section>
      )}
    </div>
  )
}

export default Home
