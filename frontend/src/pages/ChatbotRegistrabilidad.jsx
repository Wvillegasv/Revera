import Navbar from "../components/Navbar";
import "../styles/chatbot.css";

function ChatbotRegistrabilidad() {
  return (
    <div className="chatbot-page">
      <Navbar />

      <main className="chatbot-container">
        <section className="chatbot-header">
          <h1>Estudio de Registrabilidad</h1>
          <p>
            Responde unas preguntas y te guiaremos en el análisis inicial de tu marca.
          </p>
        </section>

        <section className="chatbot-box">
          <div className="chatbot-messages">
            <div className="chatbot-message bot">
              Hola, soy el asistente de REVERA. ¿Cuál es el nombre de la marca que deseas consultar?
            </div>

            <div className="chatbot-message user">
              Mi Marca Ejemplo
            </div>
          </div>

          <form className="chatbot-input-area">
            <input
              type="text"
              placeholder="Escribe tu mensaje aquí..."
            />
            <button type="submit">Enviar</button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default ChatbotRegistrabilidad;