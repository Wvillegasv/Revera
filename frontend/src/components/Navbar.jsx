import { Link, useLocation, useNavigate } from "react-router-dom";
import reveraLogo from "../assets/revera-logo.png";
import "../styles/navbar.css";

function Navbar({ onContactoClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const irAContacto = () => {
    if (location.pathname === "/" && typeof onContactoClick === "function") {
      onContactoClick();
      return;
    }

    navigate("/?abrirAgenda=true");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand" aria-label="Ir a inicio REVERA">
        <img src={reveraLogo} alt="REVERA" className="navbar-logo-image" />
      </Link>

      <nav className="navbar-menu" aria-label="Menú principal">
        <Link
          to="/"
          className={`navbar-pill ${
            location.pathname === "/" ? "active" : ""
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
          to="/guia"
          className={`navbar-link ${
            location.pathname.startsWith("/guia") ? "active-link" : ""
          }`}
        >
          Guía
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;