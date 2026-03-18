import Navbar from "../components/Navbar";
import "../styles/chatbot.css";

function ChatbotRegistroMarca() {
  return (
    <div className="chatbot-page">
      <Navbar />

      <main className="chatbot-container">
        <section className="chatbot-header">
          <h1>Chat de Registro de Marca</h1>
          <p>
            Te ayudamos a identificar la información necesaria para iniciar tu proceso.
          </p>
        </section>

        <section className="chatbot-box">
          <div className="chatbot-messages">
            <div className="chatbot-message bot">
              Bienvenido. ¿Deseas iniciar el proceso de registro de una marca nueva?
            </div>
            <div className="chatbot-message user">Sí, deseo iniciar.</div>
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

export default ChatbotRegistroMarca;