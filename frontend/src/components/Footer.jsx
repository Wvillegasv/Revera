import { Link } from "react-router-dom";
/*import { Instagram, Facebook, Linkedin, Twitter } from "lucide-react"; */
import { Instagram, Facebook } from "lucide-react";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <Link to="/aviso-privacidad" className="footer-privacy-link">
          Aviso de Privacidad
        </Link>

        <span className="footer-separator">|</span>

        <span className="footer-copy">
          © 2026 REVERA. Todos los derechos reservados.
        </span>
      </div>

      <div className="footer-social">
        <span className="footer-social-label">Síguenos:</span>

        <a
          href="https://www.instagram.com/"
          className="footer-social-link"
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
        >
          <Instagram size={16} strokeWidth={2} />
        </a>

        <a
          href="https://www.facebook.com/"
          className="footer-social-link"
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
        >
          <Facebook size={16} strokeWidth={2} />
        </a>
          
      </div>
    </footer>
  );
}

export default Footer;