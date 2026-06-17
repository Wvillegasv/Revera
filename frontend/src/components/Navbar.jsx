import { Link, useLocation, useNavigate } from "react-router-dom";
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