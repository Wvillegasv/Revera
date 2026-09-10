import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";

import reveraWordmark from "../assets/revera-wordmark.png";

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
      <nav className="navbar-shell" aria-label="Menú principal">
        <Link to="/" className="navbar-brand" aria-label="Ir al inicio">
          <img
            src={reveraWordmark}
            alt="REVERA"
            className="navbar-logo-image"
          />
        </Link>

        <div className="navbar-menu">
          <Link
            to="/"
            className={`navbar-pill ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            Inicio
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
        </div>

        <span className="navbar-profile-visual" aria-hidden="true">
          <UserRound size={24} strokeWidth={1.7} />
        </span>
      </nav>
    </header>
  );
}

export default Navbar;