import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/adminProtectedRoute.css";

function ProtectedRoute() {
  const { autenticado, cargandoSesion } = useAuth();
  const location = useLocation();

  if (cargandoSesion) {
    return (
      <div className="admin-session-loader" role="status" aria-live="polite">
        <div className="admin-session-loader__spinner" />
        <p>Validando sesión administrativa...</p>
      </div>
    );
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
