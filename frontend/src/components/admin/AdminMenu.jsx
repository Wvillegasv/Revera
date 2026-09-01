import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanSearch,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const enlaces = [
  {
    to: "/admin",
    label: "Inicio",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/admin/articulos",
    label: "Artículos",
    icon: FileText,
  },
  {
    to: "/admin/reportes/radiografia-marca",
    label: "Radiografía de Marca",
    icon: ScanSearch,
  },
  {
    to: "/admin/reportes/registro-marca",
    label: "Registro Estratégico",
    icon: ClipboardList,
  },
  {
    to: "/admin/reportes/agenda-citas",
    label: "Agenda una Cita",
    icon: CalendarDays,
  },
];

function obtenerNombreUsuario(usuario) {
  return (
    usuario?.nombreCompleto ||
    usuario?.nombre_completo ||
    usuario?.nombre ||
    usuario?.correo ||
    "Usuario administrador"
  );
}

function obtenerRolUsuario(usuario) {
  return usuario?.rol || usuario?.us_rol || "ADMIN";
}

function AdminMenu() {
  const [abierto, setAbierto] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const { usuario, cerrarSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setAbierto(false);
  }, [location.pathname]);

  async function manejarCerrarSesion() {
    setCerrandoSesion(true);

    try {
      await cerrarSesion();
    } catch (error) {
      console.error("No fue posible cerrar la sesión en el backend:", error);
    } finally {
      setCerrandoSesion(false);
      navigate("/admin/login", { replace: true });
    }
  }

  return (
    <>
      <button
        type="button"
        className="admin-menu-toggle"
        onClick={() => setAbierto((estado) => !estado)}
        aria-label={abierto ? "Cerrar menú administrativo" : "Abrir menú administrativo"}
        aria-expanded={abierto}
      >
        {abierto ? <X size={22} /> : <Menu size={22} />}
      </button>

      {abierto && (
        <button
          type="button"
          className="admin-menu-overlay"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar menú administrativo"
        />
      )}

      <aside className={`admin-sidebar ${abierto ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__brand-name">REVERA</span>
          <span className="admin-sidebar__brand-subtitle">CMS Administrativo</span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Menú administrativo">
          {enlaces.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <strong>{obtenerNombreUsuario(usuario)}</strong>
            <span>{obtenerRolUsuario(usuario)}</span>
          </div>

          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={manejarCerrarSesion}
            disabled={cerrandoSesion}
          >
            <LogOut size={18} />
            <span>{cerrandoSesion ? "Cerrando..." : "Cerrar sesión"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminMenu;
