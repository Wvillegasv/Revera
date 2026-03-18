import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const irAContacto = () => {
    if (location.pathname === "/") {
      const seccion = document.getElementById("contacto");
      if (seccion) {
        seccion.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/");

      setTimeout(() => {
        const seccion = document.getElementById("contacto");
        if (seccion) {
          seccion.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">REVERA</div>

      <nav className="navbar-menu">
        <Link
          to="/chatbot-registrabilidad"
          className={`navbar-pill ${
            location.pathname === "/chatbot-registrabilidad" ? "active" : ""
          }`}
        >
          Chat
        </Link>

        <button
          type="button"
          className="navbar-link navbar-button"
          onClick={irAContacto}
        >
          Contacto
        </button>

        <Link
          to="/blog"
          className={`navbar-link ${
            location.pathname === "/blog" ? "active-link" : ""
          }`}
        >
          Blog
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;
