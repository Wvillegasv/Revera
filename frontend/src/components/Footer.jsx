import { useState } from "react";
import { Instagram, Facebook, MapPin } from "lucide-react";
import AvisoPrivacidadModal from "./AvisoPrivacidadModal";
import "../styles/footer.css";

function Footer() {
  const [mostrarAvisoPrivacidad, setMostrarAvisoPrivacidad] =
    useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-left">
          <span className="footer-location">
            <MapPin size={16} strokeWidth={2} />
            <span>Costa Rica</span>
          </span>

          <span className="footer-separator">|</span>

          <button
            type="button"
            className="footer-privacy-link"
            onClick={() => setMostrarAvisoPrivacidad(true)}
          >
            Aviso de Privacidad
          </button>

          <span className="footer-separator">|</span>

          <span className="footer-copy">
            © 2026 REVERA. Todos los derechos reservados.
          </span>
        </div>

        <div className="footer-social">
          <span className="footer-social-label">Síguenos:</span>

          <a
            href="https://www.instagram.com/revera.legal"
            className="footer-social-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <Instagram size={16} strokeWidth={2} />
          </a>

          <a
            href="https://www.facebook.com/people/Revera/61591048964557/"
            className="footer-social-link"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <Facebook size={16} strokeWidth={2} />
          </a>
        </div>
      </footer>

      <AvisoPrivacidadModal
        abierto={mostrarAvisoPrivacidad}
        onCerrar={() => setMostrarAvisoPrivacidad(false)}
      />
    </>
  );
}

export default Footer;