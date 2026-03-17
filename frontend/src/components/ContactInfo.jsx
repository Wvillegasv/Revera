import "../styles/contactinfo.css"
import { Mail, Phone, Clock } from "lucide-react"

function ContactInfo() {
  return (
    <div className="contact-info">
      <h2>Información de Contacto</h2>

      <div className="contact-item">
        <Mail size={22} />
        <div>
          <strong>Email</strong>
          <p>contacto@revera.com</p>
        </div>
      </div>

      <div className="contact-item">
        <Phone size={22} />
        <div>
          <strong>Teléfono</strong>
          <p>+52 55 1234 5678</p>
        </div>
      </div>

      <div className="contact-item">
        <Clock size={22} />
        <div>
          <strong>Horario</strong>
          <p>Lun - Vie: 9:00 - 18:00</p>
          <p>Sáb: 10:00 - 14:00</p>
        </div>
      </div>
    </div>
  )
}

export default ContactInfo
