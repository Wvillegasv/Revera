import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/loginAdmin.css";

function obtenerMensajeError(error) {
  return (
    error?.response?.data?.mensaje ||
    error?.response?.data?.message ||
    error?.message ||
    "No fue posible iniciar sesión. Verifique sus credenciales."
  );
}

function obtenerDestino(location) {
  const ruta = location.state?.from?.pathname;

  if (!ruta || ruta === "/admin/login") {
    return "/admin";
  }

  return ruta.startsWith("/admin") ? ruta : "/admin";
}

function LoginAdmin() {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const { autenticado, cargandoSesion, iniciarSesion } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!cargandoSesion && autenticado) {
    return <Navigate to="/admin" replace />;
  }

  async function manejarSubmit(event) {
    event.preventDefault();
    setError("");

    const correoLimpio = correo.trim().toLowerCase();

    if (!correoLimpio || !clave) {
      setError("Ingrese el correo y la contraseña.");
      return;
    }

    setEnviando(true);

    try {
      await iniciarSesion({
        correo: correoLimpio,
        clave,
      });

      navigate(obtenerDestino(location), { replace: true });
    } catch (errorLogin) {
      setError(obtenerMensajeError(errorLogin));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="admin-login-page">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-brand">
          <span className="admin-login-brand__name">REVERA</span>
          <span className="admin-login-brand__subtitle">CMS Administrativo</span>
        </div>

        <div className="admin-login-heading">
          <h1 id="admin-login-title">Iniciar sesión</h1>
          <p>Ingrese sus credenciales para administrar el contenido y los reportes.</p>
        </div>

        <form className="admin-login-form" onSubmit={manejarSubmit} noValidate>
          <div className="admin-login-field">
            <label htmlFor="admin-correo">Correo electrónico</label>
            <div className="admin-login-input">
              <Mail size={19} aria-hidden="true" />
              <input
                id="admin-correo"
                name="correo"
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="correo@revera-legal.com"
                autoComplete="username"
                disabled={enviando}
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-clave">Contraseña</label>
            <div className="admin-login-input">
              <LockKeyhole size={19} aria-hidden="true" />
              <input
                id="admin-clave"
                name="clave"
                type={mostrarClave ? "text" : "password"}
                value={clave}
                onChange={(event) => setClave(event.target.value)}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                disabled={enviando}
              />

              <button
                type="button"
                className="admin-login-password-toggle"
                onClick={() => setMostrarClave((estado) => !estado)}
                aria-label={mostrarClave ? "Ocultar contraseña" : "Mostrar contraseña"}
                disabled={enviando}
              >
                {mostrarClave ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={enviando || cargandoSesion}
          >
            {enviando ? "Validando..." : "Ingresar al CMS"}
          </button>
        </form>

        <p className="admin-login-security">
          Acceso exclusivo para personal autorizado de REVERA.
        </p>
      </section>
    </div>
  );
}

export default LoginAdmin;
