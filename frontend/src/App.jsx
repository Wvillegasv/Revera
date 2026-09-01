import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Guia from "./pages/Guia";
import ArticuloDetalle from "./pages/ArticuloDetalle";
import ChatbotRegistrabilidad from "./pages/ChatbotRegistrabilidad";
import ChatbotRegistroMarca from "./pages/ChatbotRegistroMarca";

import AdminArticulos from "./pages/admin/AdminArticulos";
import AdminInicio from "./pages/admin/AdminInicio";
import LoginAdmin from "./pages/admin/LoginAdmin";
import ModuloEnConstruccion from "./pages/admin/ModuloEnConstruccion";

import ProtectedRoute from "./components/admin/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AdminLayout from "./layouts/AdminLayout";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />

          <Route path="/guia" element={<Guia />} />
          <Route path="/guia/:slug" element={<ArticuloDetalle />} />

          <Route path="/blog" element={<Blog />} />

          <Route
            path="/chatbot-registrabilidad"
            element={<ChatbotRegistrabilidad />}
          />

          <Route
            path="/chatbot-registro-marca"
            element={<ChatbotRegistroMarca />}
          />

          {/* LOGIN ADMINISTRATIVO */}
          <Route
            path="/admin/login"
            element={<LoginAdmin />}
          />

          {/* RUTAS ADMINISTRATIVAS PROTEGIDAS */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/admin"
              element={<AdminLayout />}
            >
              <Route
                index
                element={<AdminInicio />}
              />

              <Route
                path="articulos"
                element={<AdminArticulos />}
              />

              <Route
                path="reportes/radiografia-marca"
                element={
                  <ModuloEnConstruccion
                    titulo="Reporte de Radiografía de Marca"
                    descripcion="En la siguiente etapa se integrarán filtros, paginación y exportación a Excel."
                  />
                }
              />

              <Route
                path="reportes/registro-marca"
                element={
                  <ModuloEnConstruccion
                    titulo="Reporte de Registro Estratégico de Marca"
                    descripcion="En la siguiente etapa se integrarán las solicitudes, filtros y exportación a Excel."
                  />
                }
              />

              <Route
                path="reportes/agenda-citas"
                element={
                  <ModuloEnConstruccion
                    titulo="Reporte de Agenda una Cita"
                    descripcion="En la siguiente etapa se integrarán filtros por fecha, estado y exportación a Excel."
                  />
                }
              />
            </Route>
          </Route>

          {/* RUTA ADMINISTRATIVA NO RECONOCIDA */}
          <Route
            path="/admin/*"
            element={<Navigate to="/admin" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;