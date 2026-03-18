import { Mail, Phone, Clock3 } from "lucide-react";
import "../styles/contactinfo.css";

function ContactInfo() {
  return (
    <aside className="contact-info-card">
      <h3>Información de Contacto</h3>

      <div className="contact-info-item">
        <div className="contact-info-icon">
          <Mail size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h4>Email</h4>
          <p>contacto@revera.com</p>
        </div>
      </div>

      <div className="contact-info-item">
        <div className="contact-info-icon">
          <Phone size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h4>Teléfono</h4>
          <p>+52 55 1234 5678</p>
        </div>
      </div>

      <div className="contact-info-item">
        <div className="contact-info-icon">
          <Clock3 size={24} strokeWidth={2.2} />
        </div>
        <div>
          <h4>Horario</h4>
          <p>Lun - Vie: 9:00 - 18:00</p>
          <p>Sáb: 10:00 - 14:00</p>
        </div>
      </div>
    </aside>
  );
}

export default ContactInfo;