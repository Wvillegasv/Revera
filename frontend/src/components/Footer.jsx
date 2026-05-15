import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";

import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <span>Aviso de Privacidad</span>

        <div className="footer-divider"></div>

        <span>© 2026 REVERA. Todos los derechos reservados.</span>
      </div>

      <div className="footer-right">
        <span className="footer-social-label">Síguenos:</span>

        <div className="footer-socials">
          <a href="#" aria-label="Instagram">
            <Instagram size={22} strokeWidth={2} />
          </a>

          <a href="#" aria-label="Facebook">
            <Facebook size={22} strokeWidth={2} />
          </a>

          <a href="#" aria-label="LinkedIn">
            <Linkedin size={22} strokeWidth={2} />
          </a>

          <a href="#" aria-label="Twitter">
            <Twitter size={22} strokeWidth={2} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;