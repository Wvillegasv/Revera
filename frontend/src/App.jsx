import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import ChatbotRegistrabilidad from "./pages/ChatbotRegistrabilidad";
import ChatbotRegistroMarca from "./pages/ChatbotRegistroMarca";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route
          path="/chatbot-registrabilidad"
          element={<ChatbotRegistrabilidad />}
        />
        <Route
          path="/chatbot-registro-marca"
          element={<ChatbotRegistroMarca />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;