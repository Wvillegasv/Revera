import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-top">
          <p className="footer-text">
            © {new Date().getFullYear()} REVERA. Todos los derechos reservados.
          </p>
        </div>

        <div className="footer-middle">
          <div className="footer-links">
            <a href="#">Aviso de Privacidad</a>
            <a href="#">Términos y Condiciones</a>
          </div>

          <div className="footer-social">
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="LinkedIn">LinkedIn</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
