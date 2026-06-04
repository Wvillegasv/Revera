import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Guia from "./pages/Guia";
import ArticuloDetalle from "./pages/ArticuloDetalle";
import ChatbotRegistrabilidad from "./pages/ChatbotRegistrabilidad";
import ChatbotRegistroMarca from "./pages/ChatbotRegistroMarca";
import AdminArticulos from "./pages/admin/AdminArticulos";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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

        <Route path="/admin/articulos" element={<AdminArticulos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;