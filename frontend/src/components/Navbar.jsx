import { Link } from "react-router-dom"
import "../styles/navbar.css"

function Navbar({ onContactoClick }) {
  return (
    <nav className="navbar">
      <div className="logo-revera" aria-label="REVERA">
        <svg
          viewBox="0 0 360 48"
          className="logo-revera-svg"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <g className="logo-revera-group">
            <text x="0" y="33" className="logo-letter">R</text>
            <text x="55" y="33" className="logo-letter">E</text>
            <text x="107" y="33" className="logo-letter">V</text>
            <text x="165" y="33" className="logo-letter">E</text>
            <text x="217" y="33" className="logo-letter">R</text>
            <text x="272" y="33" className="logo-letter">A</text>
          </g>
        </svg>
      </div>

      <div className="menu">
        <button className="menu-pill">
          Chat
        </button>

        <button className="menu-link" onClick={onContactoClick}>
          Contacto
        </button>

        <Link to="/blog">
          <button className="menu-link">
            Blog
          </button>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
