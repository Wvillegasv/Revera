import { useState } from "react"
import { Link } from "react-router-dom"
import "../styles/revera.css"
import "../styles/chatbot.css"

function ChatbotRegistroMarca() {
  const pasos = [
    "Hola. Iniciemos el proceso de registro de marca. ¿Cuál es tu nombre completo?",
    "Gracias. ¿Cuál es tu correo electrónico?",
    "¿Cuál es tu teléfono?",
    "¿Cuál es el nombre exacto de la marca que deseas registrar?",
    "¿Qué producto o servicio distinguirá esta marca?",
    "¿La marca ya está en uso o será una nueva solicitud?",
    "¿Deseas agregar comentarios adicionales?"
  ]

  const [indicePaso, setIndicePaso] = useState(0)
  const [input, setInput] = useState("")
  const [respuestas, setRespuestas] = useState([])
  const [finalizado, setFinalizado] = useState(false)

  const enviarRespuesta = () => {
    if (!input.trim()) return

    const nuevasRespuestas = [...respuestas, input.trim()]
    setRespuestas(nuevasRespuestas)
    setInput("")

    if (indicePaso < pasos.length - 1) {
      setIndicePaso(indicePaso + 1)
    } else {
      setFinalizado(true)
    }
  }

  const progreso = ((indicePaso + (finalizado ? 1 : 0)) / pasos.length) * 100

  return (
    <div className="chatbot-page">
      <div className="chatbot-shell">
        <div className="chatbot-header">
          <h1>Registro de Marca</h1>
          <p>
            Responde este flujo guiado para iniciar el proceso de registro de marca.
          </p>
        </div>

        <div className="chatbot-body">
          <div className="chatbot-messages">
            {pasos.slice(0, indicePaso + 1).map((mensaje, index) => (
              <div key={`bot-${index}`} className="chatbot-message bot">
                {mensaje}
              </div>
            ))}

            {respuestas.map((respuesta, index) => (
              <div key={`user-${index}`} className="chatbot-message user">
                {respuesta}
              </div>
            ))}

            {finalizado && (
              <div className="chatbot-message bot">
                Gracias. Hemos capturado tu información para iniciar el registro de marca.
              </div>
            )}
          </div>

          <div className="chatbot-progress">
            <div
              className="chatbot-progress-bar"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>
        </div>

        <div className="chatbot-footer">
          {!finalizado ? (
            <div className="chatbot-input-row">
              <input
                type="text"
                value={input}
                placeholder="Escribe tu respuesta..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    enviarRespuesta()
                  }
                }}
              />

              <button type="button" onClick={enviarRespuesta}>
                Enviar
              </button>
            </div>
          ) : (
            <div className="chatbot-input-row">
              <Link to="/">
                <button type="button">Volver al inicio</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatbotRegistroMarca
