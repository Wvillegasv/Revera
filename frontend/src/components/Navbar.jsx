import { Link, useLocation, useNavigate } from "react-router-dom";
import reveraLogo from "../assets/revera-logo.png";
import "../styles/navbar.css";

function Navbar({ onContactoClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const irAContacto = () => {
    if (location.pathname === "/") {
      if (onContactoClick) {
        onContactoClick();
      }
    } else {
      navigate("/");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <img
          src={reveraLogo}
          alt="REVERA"
          className="navbar-logo-image"
        />
      </div>

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