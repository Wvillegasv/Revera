import {
  CalendarDays,
  ClipboardList,
  FileText,
  ScanSearch,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/adminInicio.css";

const modulos = [
  {
    to: "/admin/articulos",
    titulo: "Artículos",
    descripcion: "Administrar contenido, bloques, imágenes y artículos relacionados.",
    icon: FileText,
  },
  {
    to: "/admin/reportes/radiografia-marca",
    titulo: "Radiografía de Marca",
    descripcion: "Consultar solicitudes y preparar su exportación a Excel.",
    icon: ScanSearch,
  },
  {
    to: "/admin/reportes/registro-marca",
    titulo: "Registro Estratégico",
    descripcion: "Consultar solicitudes de registro estratégico de marca.",
    icon: ClipboardList,
  },
  {
    to: "/admin/reportes/agenda-citas",
    titulo: "Agenda una Cita",
    descripcion: "Consultar citas, filtros de fecha y estados de atención.",
    icon: CalendarDays,
  },
];

function obtenerNombre(usuario) {
  return (
    usuario?.nombreCompleto ||
    usuario?.nombre_completo ||
    usuario?.nombre ||
    usuario?.correo ||
    "Administrador"
  );
}

function AdminInicio() {
  const { usuario } = useAuth();

  return (
    <section className="admin-home">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Panel administrativo</span>
          <h1>Bienvenido, {obtenerNombre(usuario)}</h1>
          <p>Seleccione el módulo que desea gestionar.</p>
        </div>
      </header>

      <div className="admin-module-grid">
        {modulos.map(({ to, titulo, descripcion, icon: Icon }) => (
          <Link key={to} to={to} className="admin-module-card">
            <span className="admin-module-card__icon">
              <Icon size={27} />
            </span>

            <span className="admin-module-card__content">
              <strong>{titulo}</strong>
              <span>{descripcion}</span>
            </span>

            <span className="admin-module-card__action">Abrir módulo</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default AdminInicio;
