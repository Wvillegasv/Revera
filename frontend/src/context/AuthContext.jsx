import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  cerrarSesionAdmin,
  iniciarSesionAdmin,
  obtenerSesionAdmin,
} from "../services/authApi";

const AuthContext = createContext(null);

function extraerUsuario(respuesta) {
  if (!respuesta) return null;

  return (
    respuesta.usuario ||
    respuesta.data?.usuario ||
    respuesta.data ||
    null
  );
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  const verificarSesion = useCallback(async () => {
    setCargandoSesion(true);

    try {
      const respuesta = await obtenerSesionAdmin();
      setUsuario(extraerUsuario(respuesta));
    } catch (error) {
      const status = error?.response?.status;

      if (status !== 401) {
        console.error("No fue posible verificar la sesión administrativa:", error);
      }

      setUsuario(null);
    } finally {
      setCargandoSesion(false);
    }
  }, []);

  useEffect(() => {
    verificarSesion();
  }, [verificarSesion]);

  const iniciarSesion = useCallback(async ({ correo, clave }) => {
    const respuesta = await iniciarSesionAdmin({ correo, clave });
    const usuarioAutenticado = extraerUsuario(respuesta);

    if (!usuarioAutenticado) {
      throw new Error("El backend no devolvió la información del usuario.");
    }

    setUsuario(usuarioAutenticado);
    return usuarioAutenticado;
  }, []);

  const cerrarSesion = useCallback(async () => {
    try {
      await cerrarSesionAdmin();
    } finally {
      setUsuario(null);
    }
  }, []);

  const valor = useMemo(
    () => ({
      usuario,
      autenticado: Boolean(usuario),
      cargandoSesion,
      iniciarSesion,
      cerrarSesion,
      verificarSesion,
    }),
    [
      usuario,
      cargandoSesion,
      iniciarSesion,
      cerrarSesion,
      verificarSesion,
    ],
  );

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return contexto;
}
