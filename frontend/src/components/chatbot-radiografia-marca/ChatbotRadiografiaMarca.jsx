import { useMemo, useRef, useState, useEffect } from "react";
import { X, Send, Upload } from "lucide-react";
import {
  RADIOGRAFIA_FLOW,
  RADIOGRAFIA_INTRO,
} from "./radiografiaFlow";
import {
  formatearNombreArchivo,
  formatearTelefono,
  obtenerPasoPorId,
  obtenerSiguientePaso,
  validarRespuesta,
} from "./radiografiaHelpers";
import { enviarRadiografiaMarca } from "../../services/radiografiaMarcaApi";
import "../../styles/chatbotRadiografiaMarca.css";

function crearMensajesIniciales(primerPaso) {
  return [
    ...RADIOGRAFIA_INTRO.map((mensaje) => ({
      tipo: "bot",
      texto: mensaje,
    })),
    {
      tipo: "bot",
      texto: primerPaso.label,
      preguntaId: primerPaso.id,
      required: primerPaso.required,
      current: true,
    },
  ];
}

function construirPayloadRadiografia(respuestas) {
  const telefono = respuestas.telefonoContacto || {};

  return {
    nombreMarca: respuestas.nombreMarca?.valor || "",
    estadoUso: respuestas.estadoUso?.valor || "",
    tipoProductoServicio: respuestas.tipoProductoServicio?.valor || "",
    fraseSimple: respuestas.fraseSimple?.valor || "",

    alcanceUso: respuestas.alcanceUso?.valor || "",
    alcanceUsoOtro: respuestas.alcanceUsoOtro?.valor || "",

    existenMarcasSimilares: respuestas.marcasSimilares?.valor || "",
    marcasSimilaresDetalle: respuestas.cualesMarcasSimilares?.valor || "",

    diferenciador: respuestas.diferenciador?.valor || "",
    tipoMarcaVisual: respuestas.tipoMarcaVisual?.valor || "",

    haVendido: respuestas.haVendido?.valor || "",
    desdeCuandoUso: respuestas.desdeCuando?.valor || "",

    preguntaClave: respuestas.preguntaClave?.valor || "",

    nombreCompletoContacto: respuestas.nombreCompletoContacto?.valor || "",
    correoContacto: respuestas.correoContacto?.valor || "",

    telefonoCodigoPais: telefono.telefonoCodigoPais || "",
    telefonoNumero: telefono.telefonoNumero || "",
    telefonoContacto:
      telefono.telefonoCodigoPais && telefono.telefonoNumero
        ? `${telefono.telefonoCodigoPais}${telefono.telefonoNumero}`
        : "",
  };
}

function ChatbotRadiografiaMarca({ abierto, onClose }) {
  const primerPaso = RADIOGRAFIA_FLOW[0];

  const [pasoActualId, setPasoActualId] = useState(primerPaso.id);
  const [respuestas, setRespuestas] = useState({});
  const [mensajes, setMensajes] = useState(() =>
    crearMensajesIniciales(primerPaso)
  );

  const [valorActual, setValorActual] = useState("");
  const [archivoActual, setArchivoActual] = useState(null);
  const [error, setError] = useState("");
  const [finalizado, setFinalizado] = useState(false);
  const [enviadoCorrectamente, setEnviadoCorrectamente] = useState(false);

  const chatRef = useRef(null);

  const pasoActual = useMemo(
    () => obtenerPasoPorId(RADIOGRAFIA_FLOW, pasoActualId),
    [pasoActualId]
  );

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes, finalizado, enviadoCorrectamente]);

  if (!abierto) {
    return null;
  }

  const reiniciarChat = () => {
    setPasoActualId(primerPaso.id);
    setRespuestas({});
    setMensajes(crearMensajesIniciales(primerPaso));
    setValorActual("");
    setArchivoActual(null);
    setError("");
    setFinalizado(false);
    setEnviadoCorrectamente(false);
  };

  const cerrar = () => {
    reiniciarChat();

    if (onClose) {
      onClose();
    }
  };

  const agregarMensajeUsuario = (texto) => {
    setMensajes((prev) => [
      ...prev.map((mensaje) => ({
        ...mensaje,
        current: false,
      })),
      {
        tipo: "user",
        texto,
      },
    ]);
  };

  const agregarPreguntaBot = (siguientePasoId) => {
    const siguientePaso = obtenerPasoPorId(RADIOGRAFIA_FLOW, siguientePasoId);

    if (!siguientePaso) {
      return;
    }

    setMensajes((prev) => [
      ...prev,
      {
        tipo: "bot",
        texto: siguientePaso.label,
        sectionTitle: siguientePaso.sectionTitle || "",
        preguntaId: siguientePaso.id,
        required: siguientePaso.required,
        current: true,
      },
    ]);
  };

  const obtenerTextoRespuesta = (paso, valor) => {
    if (paso.type === "file") {
      return formatearNombreArchivo(archivoActual);
    }

    if (paso.type === "phone") {
      return formatearTelefono(valor);
    }

    if (valor && String(valor).trim() !== "") {
      return valor;
    }

    return "No indicado";
  };

  const guardarRespuesta = (valor) => {
    if (!pasoActual) {
      return;
    }

    const respuestaFinal = pasoActual.type === "file" ? archivoActual : valor;
    const mensajeError = validarRespuesta(pasoActual, respuestaFinal);

    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    setError("");

    const textoRespuesta = obtenerTextoRespuesta(pasoActual, respuestaFinal);

    const nuevasRespuestas = {
      ...respuestas,
      [pasoActual.id]: {
        pregunta: pasoActual.label,
        valor: textoRespuesta,
        archivo: pasoActual.type === "file" ? archivoActual : null,
        telefonoCodigoPais:
          pasoActual.type === "phone" ? respuestaFinal.codigoPais || "" : "",
        telefonoNumero:
          pasoActual.type === "phone" ? respuestaFinal.numero || "" : "",
      },
    };

    setRespuestas(nuevasRespuestas);
    agregarMensajeUsuario(textoRespuesta);

    const siguientePaso = obtenerSiguientePaso(pasoActual, respuestaFinal);

    setValorActual("");
    setArchivoActual(null);

    if (siguientePaso === "resumen") {
      setFinalizado(true);

      setMensajes((prev) => [
        ...prev,
        {
          tipo: "bot",
          texto: "Hemos preparado el resumen de tu Radiografía de Marca.",
        },
      ]);

      return;
    }

    setPasoActualId(siguientePaso);
    agregarPreguntaBot(siguientePaso);
  };

  const manejarSubmit = (event) => {
    event.preventDefault();
    guardarRespuesta(valorActual);
  };

  const manejarSubmitTelefono = (event) => {
    event.preventDefault();

    const telefonoValue =
      typeof valorActual === "object" && valorActual !== null
        ? valorActual
        : {
            codigoPais: "",
            numero: "",
          };

    guardarRespuesta(telefonoValue);
  };

  const renderCampo = () => {
    if (!pasoActual || finalizado) {
      return null;
    }

    if (pasoActual.type === "options") {
      return (
        <div className="radiografia-options">
          {pasoActual.options.map((opcion) => (
            <button
              type="button"
              key={opcion.value}
              onClick={() => guardarRespuesta(opcion.value)}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      );
    }

    if (pasoActual.type === "textarea") {
      return (
        <form className="radiografia-input-area" onSubmit={manejarSubmit}>
          <textarea
            value={valorActual}
            onChange={(event) => setValorActual(event.target.value)}
            placeholder={pasoActual.placeholder || "Escribe tu respuesta..."}
            rows={4}
          />

          <button type="submit">
            <Send size={17} strokeWidth={2.1} />
            Enviar
          </button>
        </form>
      );
    }

    if (pasoActual.type === "phone") {
      const telefonoValue =
        typeof valorActual === "object" && valorActual !== null
          ? valorActual
          : {
              codigoPais: "506",
              numero: "",
            };

      return (
        <form
          className="radiografia-input-area radiografia-phone-area"
          onSubmit={manejarSubmitTelefono}
        >
          <input
            type="text"
            inputMode="numeric"
            className="radiografia-phone-code"
            value={telefonoValue.codigoPais}
            onChange={(event) =>
              setValorActual({
                ...telefonoValue,
                codigoPais: event.target.value.replace(/\D/g, ""),
              })
            }
            placeholder={pasoActual.placeholderCodigoPais || "506"}
            aria-label="Código de país"
          />

          <input
            type="text"
            inputMode="numeric"
            className="radiografia-phone-number"
            value={telefonoValue.numero}
            onChange={(event) =>
              setValorActual({
                ...telefonoValue,
                numero: event.target.value.replace(/\D/g, ""),
              })
            }
            placeholder={pasoActual.placeholderNumero || "88887777"}
            aria-label="Número de teléfono"
          />

          <button type="submit">
            <Send size={17} strokeWidth={2.1} />
            Enviar
          </button>
        </form>
      );
    }

    if (pasoActual.type === "file") {
      return (
        <div className="radiografia-file-area">
          <label className="radiografia-file-label">
            <Upload size={18} strokeWidth={2.1} />
            Seleccionar archivo
            <input
              type="file"
              accept={pasoActual.accept}
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setArchivoActual(file);
              }}
            />
          </label>

          {archivoActual && (
            <p className="radiografia-file-name">
              {formatearNombreArchivo(archivoActual)}
            </p>
          )}

          <button
            type="button"
            className="radiografia-file-submit"
            onClick={() => guardarRespuesta(archivoActual)}
          >
            Continuar
          </button>
        </div>
      );
    }

    return (
      <form className="radiografia-input-area" onSubmit={manejarSubmit}>
        <input
          type={pasoActual.type === "email" ? "email" : "text"}
          value={valorActual}
          onChange={(event) => setValorActual(event.target.value)}
          placeholder={pasoActual.placeholder || "Escribe tu respuesta..."}
        />

        <button type="submit">
          <Send size={17} strokeWidth={2.1} />
          Enviar
        </button>
      </form>
    );
  };

  const renderResumen = () => {
    const lista = Object.entries(respuestas);

    return (
      <div className="radiografia-summary-card">
        {lista.map(([key, item]) => (
          <div className="radiografia-summary-row" key={key}>
            <strong>{item.pregunta}</strong>
            <span>{item.valor}</span>
          </div>
        ))}
      </div>
    );
  };

  const enviarInformacion = async () => {
    try {
      setError("");

      const payload = construirPayloadRadiografia(respuestas);
      const formData = new FormData();

      formData.append("data", JSON.stringify(payload));

      const archivoLogo = respuestas.archivoLogo?.archivo;

      if (archivoLogo) {
        formData.append("archivoLogo", archivoLogo);
      }

      const resultado = await enviarRadiografiaMarca(formData);

      console.log("Respuesta backend Radiografía:", resultado);

      setEnviadoCorrectamente(true);

      setTimeout(() => {
        cerrar();
      }, 5000);
    } catch (error) {
      console.error("Error enviando Radiografía de Marca:", error);

      const mensaje =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No fue posible enviar la solicitud. Intente nuevamente.";

      setError(mensaje);
    }
  };

  return (
    <div className="radiografia-overlay" onClick={cerrar}>
      <section
        className="radiografia-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="radiografia-close"
          onClick={cerrar}
          aria-label="Cerrar Radiografía de Marca"
        >
          <X size={19} strokeWidth={2.1} />
        </button>

        <header className="radiografia-header">
          <span>Radiografía de Marca</span>
          <h2>Vamos a hacer una radiografía de tu marca</h2>
          <p>
            Responde unas preguntas rápidas para evaluar la viabilidad inicial de
            tu marca.
          </p>
        </header>

        <div className="radiografia-chat" ref={chatRef}>
          {mensajes.map((mensaje, index) => (
            <div
              className={`radiografia-message ${mensaje.tipo} ${
                mensaje.current ? "current" : ""
              }`}
              key={`${mensaje.tipo}-${index}`}
            >
              {mensaje.sectionTitle && (
                <div className="radiografia-section-title">
                  {mensaje.sectionTitle}
                </div>
              )}

              <div>
                {mensaje.texto}
                {mensaje.required && <span className="required">*</span>}
              </div>
            </div>
          ))}

          {finalizado && (
            <div className="radiografia-summary">
              {enviadoCorrectamente ? (
                <div className="radiografia-success-layout">
                  <div className="radiografia-success-header">
                    <h2>Radiografía de Marca</h2>
                    <p>
                      Completa el flujo conversacional para iniciar tu solicitud.
                    </p>
                  </div>

                  <div className="radiografia-success-content">
                    <div className="radiografia-success-icon">
                      <span>✓</span>
                    </div>

                    <h3>Solicitud enviada</h3>

                    <p>
                      Su solicitud de radiografía de marca ha sido enviada
                      correctamente. Nos pondremos en contacto con usted.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {renderResumen()}

                  <div className="radiografia-summary-actions">
                    <button type="button" onClick={enviarInformacion}>
                      Enviar información
                    </button>

                    <button
                      type="button"
                      className="secondary"
                      onClick={reiniciarChat}
                    >
                      Reiniciar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {!finalizado && (
          <footer className="radiografia-footer">
            {error && <p className="radiografia-error">{error}</p>}
            {renderCampo()}
          </footer>
        )}

        {finalizado && !enviadoCorrectamente && error && (
          <footer className="radiografia-footer">
            <p className="radiografia-error">{error}</p>
          </footer>
        )}
      </section>
    </div>
  );
}

export default ChatbotRadiografiaMarca;