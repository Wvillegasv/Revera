import { Construction } from "lucide-react";
import { Link } from "react-router-dom";
import "../../styles/moduloEnConstruccion.css";

function ModuloEnConstruccion({ titulo, descripcion }) {
  return (
    <section className="admin-pending-module">
      <div className="admin-pending-module__icon">
        <Construction size={36} />
      </div>

      <span className="admin-page-eyebrow">Próxima etapa</span>
      <h1>{titulo}</h1>
      <p>{descripcion}</p>

      <Link to="/admin" className="admin-pending-module__back">
        Volver al inicio del CMS
      </Link>
    </section>
  );
}

export default ModuloEnConstruccion;
