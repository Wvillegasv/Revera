import { useEffect, useMemo, useRef, useState } from "react";
import { X, Send, Upload } from "lucide-react";
import {
  RADIOGRAFIA_FLOW,
  RADIOGRAFIA_INTRO,
} from "./radiografiaFlow";
import {
  formatearNombreArchivo,
  formatearTelefono,
  obtenerLimitesPaso,
  obtenerMaxLengthPaso,
  obtenerPasoPorId,
  obtenerSiguientePaso,
  validarFlujoCompletoAntesDeEnviar,
  validarRespuesta,
} from "./radiografiaHelpers";
import { enviarRadiografiaMarca } from "../../services/radiografiaMarcaApi";
import "../../styles/chatbotRadiografiaMarca.css";
import { Link } from "react-router-dom";

const DURACION_MENSAJE_EXITO_MS = 30000;

function crearMensajesIniciales(primerPaso) {
  return [
    ...RADIOGRAFIA_INTRO.map((mensaje) => ({
      tipo: "bot",
      texto:
        typeof mensaje === "string"
          ? mensaje
          : mensaje.texto || "",
      linkTexto:
        typeof mensaje === "string"
          ? ""
          : mensaje.linkTexto || "",
      linkUrl:
        typeof mensaje === "string"
          ? ""
          : mensaje.linkUrl || "",
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
  const [enviandoInformacion, setEnviandoInformacion] = useState(false);

  /*
    Cuando hay un id, la persona está editando desde el resumen.
    Usar el identificador del paso, en lugar de un booleano, evita que
    el flujo vuelva accidentalmente a la siguiente pregunta normal.
  */
  const [pasoEditadoId, setPasoEditadoId] = useState(null);

  const chatRef = useRef(null);
  const timeoutCierreRef = useRef(null);

  const pasoActual = useMemo(
    () => obtenerPasoPorId(RADIOGRAFIA_FLOW, pasoActualId),
    [pasoActualId]
  );

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes, finalizado, enviadoCorrectamente]);

  useEffect(() => {
    return () => {
      if (timeoutCierreRef.current) {
        clearTimeout(timeoutCierreRef.current);
      }
    };
  }, []);

  if (!abierto) {
    return null;
  }

  const limpiarTemporizadorCierre = () => {
    if (timeoutCierreRef.current) {
      clearTimeout(timeoutCierreRef.current);
      timeoutCierreRef.current = null;
    }
  };

  const reiniciarChat = () => {
    limpiarTemporizadorCierre();

    setPasoActualId(primerPaso.id);
    setRespuestas({});
    setMensajes(crearMensajesIniciales(primerPaso));
    setValorActual("");
    setArchivoActual(null);
    setError("");
    setFinalizado(false);
    setEnviadoCorrectamente(false);
    setEnviandoInformacion(false);
    setPasoEditadoId(null);
  };

  const cerrar = () => {
    reiniciarChat();

    if (onClose) {
      onClose();
    }
  };

  const obtenerTextoRespuesta = (paso, valor) => {
    if (paso.type === "file") {
      return formatearNombreArchivo(valor);
    }

    if (paso.type === "phone") {
      return formatearTelefono(valor);
    }

    if (valor && String(valor).trim() !== "") {
      return String(valor).trim();
    }

    return "No indicado";
  };


  const volverAlResumenDespuesDeEditar = ({
    textoRespuesta,
    nuevasRespuestas,
  }) => {
    setRespuestas(nuevasRespuestas);
    setPasoEditadoId(null);
    setFinalizado(true);
    setEnviadoCorrectamente(false);
    setValorActual("");
    setArchivoActual(null);
    setError("");

    setMensajes((prev) => [
      ...prev.map((mensaje) => ({
        ...mensaje,
        current: false,
      })),
      {
        tipo: "user",
        texto: textoRespuesta,
      },
      {
        tipo: "bot",
        texto:
          "Respuesta actualizada. Revisa nuevamente tu información antes de enviarla.",
      },
    ]);
  };

  const agregarMensajeUsuarioYPregunta = ({
    textoRespuesta,
    siguientePasoId,
    esEdicion,
  }) => {
    setMensajes((prev) => {
      const mensajesActualizados = [
        ...prev.map((mensaje) => ({
          ...mensaje,
          current: false,
        })),
        {
          tipo: "user",
          texto: textoRespuesta,
        },
      ];

      /*
        Después de editar, no se calcula la ruta normal ni se vuelve a
        formular la siguiente pregunta. El chat vuelve directamente al resumen.
      */
      if (esEdicion) {
        return [
          ...mensajesActualizados,
          {
            tipo: "bot",
            texto:
              "Respuesta actualizada. Revisa nuevamente tu información antes de enviarla.",
          },
        ];
      }

      if (siguientePasoId === "resumen") {
        return [
          ...mensajesActualizados,
          {
            tipo: "bot",
            texto: "Hemos preparado el resumen de tu Radiografía de Marca.",
          },
        ];
      }

      const siguientePaso = obtenerPasoPorId(
        RADIOGRAFIA_FLOW,
        siguientePasoId
      );

      if (!siguientePaso) {
        return mensajesActualizados;
      }

      return [
        ...mensajesActualizados,
        {
          tipo: "bot",
          texto: siguientePaso.label,
          sectionTitle: siguientePaso.sectionTitle || "",
          preguntaId: siguientePaso.id,
          required: siguientePaso.required,
          current: true,
        },
      ];
    });
  };

  const guardarRespuesta = (valor) => {
    if (!pasoActual) {
      setError("No fue posible identificar la pregunta actual.");
      return;
    }

    const respuestaFinal =
      pasoActual.type === "file" ? archivoActual : valor;

    const mensajeError = validarRespuesta(pasoActual, respuestaFinal);

    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    const textoRespuesta = obtenerTextoRespuesta(
      pasoActual,
      respuestaFinal
    );

    const nuevasRespuestas = {
      ...respuestas,
      [pasoActual.id]: {
        pregunta: pasoActual.label,
        valor: textoRespuesta,
        archivo: pasoActual.type === "file" ? respuestaFinal : null,
        telefonoCodigoPais:
          pasoActual.type === "phone"
            ? respuestaFinal?.codigoPais || ""
            : "",
        telefonoNumero:
          pasoActual.type === "phone"
            ? respuestaFinal?.numero || ""
            : "",
      },
    };

    const esEdicion =
      Boolean(pasoEditadoId) && pasoEditadoId === pasoActual.id;

    if (esEdicion) {
      volverAlResumenDespuesDeEditar({
        textoRespuesta,
        nuevasRespuestas,
      });

      return;
    }

    setError("");
    setRespuestas(nuevasRespuestas);
    setValorActual("");
    setArchivoActual(null);

    const siguientePasoId = obtenerSiguientePaso(
      pasoActual,
      respuestaFinal
    );

    if (!siguientePasoId) {
      setError("No fue posible determinar el siguiente paso.");
      return;
    }

    if (siguientePasoId === "resumen") {
      setFinalizado(true);

      agregarMensajeUsuarioYPregunta({
        textoRespuesta,
        siguientePasoId,
      });

      return;
    }

    setPasoActualId(siguientePasoId);

    agregarMensajeUsuarioYPregunta({
      textoRespuesta,
      siguientePasoId,
    });
  };

  const editarRespuesta = (preguntaId) => {
    const pasoAEditar = obtenerPasoPorId(RADIOGRAFIA_FLOW, preguntaId);
    const respuestaAnterior = respuestas[preguntaId];

    if (!pasoAEditar || !respuestaAnterior) {
      return;
    }

    setError("");
    setFinalizado(false);
    setEnviadoCorrectamente(false);
    setPasoEditadoId(preguntaId);
    setPasoActualId(preguntaId);

    /*
      Se agrega la pregunta de edición al final sin borrar respuestas
      posteriores. Todas las respuestas existentes se mantienen.
    */
    setMensajes((prev) => [
      ...prev.map((mensaje) => ({
        ...mensaje,
        current: false,
      })),
      {
        tipo: "bot",
        texto: `Editando respuesta: ${pasoAEditar.label}`,
        preguntaId,
        required: pasoAEditar.required,
        current: true,
      },
    ]);

    if (pasoAEditar.type === "file") {
      setArchivoActual(respuestaAnterior.archivo || null);
      setValorActual("");
      return;
    }

    if (pasoAEditar.type === "phone") {
      setValorActual({
        codigoPais: respuestaAnterior.telefonoCodigoPais || "506",
        numero: respuestaAnterior.telefonoNumero || "",
      });

      setArchivoActual(null);
      return;
    }

    setValorActual(
      respuestaAnterior.valor === "No indicado"
        ? ""
        : respuestaAnterior.valor
    );

    setArchivoActual(null);
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
            codigoPais: "506",
            numero: "",
          };

    guardarRespuesta(telefonoValue);
  };

  const renderMensajeLimitesPaso = () => {
    if (!pasoActual || finalizado) {
      return null;
    }

    if (["text", "email", "textarea"].includes(pasoActual.type)) {
      const { min: minimo, max: maximo } = obtenerLimitesPaso(
        pasoActual.id
      );

      if (!minimo && !maximo) {
        return null;
      }

      const longitudActual = String(valorActual ?? "").length;
      const alcanzoMaximo = Boolean(maximo && longitudActual >= maximo);

      return (
        <small
          className={`radiografia-limit-message ${
            alcanzoMaximo ? "radiografia-limit-message--limit" : ""
          }`}
          role="status"
          aria-live="polite"
        >
          {longitudActual}
          {maximo ? ` / ${maximo}` : ""} caracteres.
          {minimo ? ` Mínimo permitido: ${minimo} caracteres.` : ""}
          {maximo ? ` Máximo permitido: ${maximo} caracteres.` : ""}
        </small>
      );
    }

    if (pasoActual.type === "phone") {
      const telefonoValue =
        typeof valorActual === "object" && valorActual !== null
          ? valorActual
          : { codigoPais: "506", numero: "" };

      const codigoPais = String(telefonoValue.codigoPais || "");
      const numero = String(telefonoValue.numero || "");
      const esCostaRica = codigoPais === "506";

      return (
        <small
          className="radiografia-limit-message"
          role="status"
          aria-live="polite"
        >
          Código país: {codigoPais.length} / 3 dígitos. Teléfono: {numero.length}
          {esCostaRica ? " / 8" : " / 20"} dígitos.
          {esCostaRica
            ? " Para Costa Rica se requieren exactamente 8 dígitos."
            : " Mínimo permitido: 6. Máximo permitido: 20 dígitos."}
        </small>
      );
    }

    return null;
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
          <div
            className="radiografia-field-with-counter"
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <textarea
              value={valorActual}
              onChange={(event) => setValorActual(event.target.value)}
              placeholder={pasoActual.placeholder || "Escribe tu respuesta..."}
              maxLength={obtenerMaxLengthPaso(pasoActual.id)}
              rows={4}
              style={{ width: "100%" }}
            />

            {renderMensajeLimitesPaso()}
          </div>

          <button type="submit" className="radiografia-next-button">
            <Send size={16} strokeWidth={2.1} />
            Siguiente
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
          <div
            className="radiografia-phone-fields-with-counter"
            style={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="radiografia-phone-fields-row"
              style={{
                display: "flex",
                gap: "10px",
                width: "100%",
              }}
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
                maxLength={3}
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
                maxLength={20}
                aria-label="Número de teléfono"
              />
            </div>

            {renderMensajeLimitesPaso()}
          </div>

          <button type="submit" className="radiografia-next-button">
            <Send size={16} strokeWidth={2.1} />
            Siguiente
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
            Siguiente
          </button>
        </div>
      );
    }

    return (
      <form className="radiografia-input-area" onSubmit={manejarSubmit}>
        <div
          className="radiografia-field-with-counter"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <input
            type={pasoActual.type === "email" ? "email" : "text"}
            value={valorActual}
            onChange={(event) => setValorActual(event.target.value)}
            placeholder={pasoActual.placeholder || "Escribe tu respuesta..."}
            maxLength={obtenerMaxLengthPaso(pasoActual.id)}
            style={{ width: "100%" }}
          />

          {renderMensajeLimitesPaso()}
        </div>

        <button type="submit" className="radiografia-next-button">
          <Send size={16} strokeWidth={2.1} />
          Siguiente
        </button>
      </form>
    );
  };

  const renderResumen = () => {
    return (
      <div className="radiografia-summary-card">
        <h3 className="radiografia-summary-title">
          Revisa tu información antes de enviarla
        </h3>

        {Object.entries(respuestas).map(([key, item]) => (
          <div className="radiografia-summary-row" key={key}>
            <div className="radiografia-summary-row-content">
              <strong>{item.pregunta}</strong>
              <span>{item.valor}</span>
            </div>

            <button
              type="button"
              className="radiografia-edit-btn"
              onClick={() => editarRespuesta(key)}
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    );
  };

  const enviarInformacion = async () => {
    if (enviandoInformacion) {
      return;
    }

    const validacionFinal = validarFlujoCompletoAntesDeEnviar(
      RADIOGRAFIA_FLOW,
      respuestas
    );

    if (validacionFinal) {
      setError(
        `${validacionFinal.pregunta} ${validacionFinal.mensaje}`
      );
      return;
    }

    setError("");
    setEnviandoInformacion(true);

    /*
      Muestra el agradecimiento inmediatamente.
      Si el backend falla, se retorna al resumen y aparece el error.
    */
    setFinalizado(true);
    setEnviadoCorrectamente(true);

    try {
      const payload = construirPayloadRadiografia(respuestas);
      const formData = new FormData();

      formData.append("data", JSON.stringify(payload));

      const archivoLogo = respuestas.archivoLogo?.archivo;

      if (archivoLogo) {
        formData.append("archivoLogo", archivoLogo);
      }

      await enviarRadiografiaMarca(formData);

      limpiarTemporizadorCierre();

      timeoutCierreRef.current = setTimeout(() => {
        cerrar();
      }, DURACION_MENSAJE_EXITO_MS);
    } catch (errorEnvio) {
      console.error(
        "Error enviando Radiografía de Marca:",
        errorEnvio
      );

      setEnviadoCorrectamente(false);
      setFinalizado(true);

      const mensaje =
        errorEnvio.response?.data?.mensaje ||
        errorEnvio.response?.data?.error ||
        "No fue posible enviar la solicitud. Intente nuevamente.";

      setError(mensaje);
    } finally {
      setEnviandoInformacion(false);
    }
  };

  return (
    <div className="radiografia-overlay">
      <section
        className={`radiografia-modal ${
          enviadoCorrectamente ? "radiografia-modal--final-message" : ""
        }`}
        style={
          enviadoCorrectamente
            ? { transform: "translateY(-50px)" }
            : undefined
        }
      >
        {!enviadoCorrectamente && (
          <button
            type="button"
            className="radiografia-close"
            onClick={cerrar}
            aria-label="Cerrar Radiografía de Marca"
          >
            <X size={19} strokeWidth={2.1} />
          </button>
        )}

        {!enviadoCorrectamente && (
          <header className="radiografia-header">
            <span>Radiografía de Marca</span>

            <p>
              Responde unas preguntas rápidas para evaluar la viabilidad inicial
              de tu marca.{" "}
              <Link
                to="/guia/precios-servicios-revera"
                className="radiografia-prices-link"
              >
                Conoce los precios de nuestros servicios.
              </Link>
            </p>
          </header>
        )}

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

                {mensaje.linkTexto && mensaje.linkUrl && (
                  <>
                    {" "}
                    <a
                      href={mensaje.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="radiografia-guide-link"
                    >
                      {mensaje.linkTexto}
                    </a>
                  </>
                )}

                {mensaje.required && (
                  <span className="required">*</span>
                )}
              </div>
            </div>
          ))}

          {finalizado && (
            <div className="radiografia-summary">
              {enviadoCorrectamente ? (
                <div
                  className="radiografia-success-layout"
                  style={{ transform: "translateY(-03px)" }}
                >
                  <div className="radiografia-success-header">
                    <h2>Radiografía de Marca</h2>
                    <p>Solicitud enviada correctamente.</p>
                  </div>

                  <div className="radiografia-success-content">
                    <div className="radiografia-success-icon">
                      <span>✓</span>
                    </div>

                    <h3>
                      ¡Gracias por compartir su información con nosotros!
                    </h3>

                    <p>Nos pondremos en contacto.</p>

                    <p>
                      La confidencialidad y protección de la información de
                      nuestros clientes es una prioridad para nosotros.
                      Tratamos sus datos personales de manera segura,
                      responsable y conforme a nuestra Política de Privacidad.
                    </p>

                    <p>
                      Si desea conocer más sobre cómo recopilamos, utilizamos y
                      protegemos su información, por favor haga clic en el
                      siguiente enlace:{" "}
                      <Link
                        to="/aviso-privacidad"
                        className="radiografia-privacy-link"
                      >
                        Aviso de Privacidad
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {renderResumen()}

                  <div className="radiografia-summary-actions">
                    <button
                      type="button"
                      onClick={enviarInformacion}
                      disabled={enviandoInformacion}
                    >
                      {enviandoInformacion
                        ? "Enviando información..."
                        : "Enviar información"}
                    </button>

                    <button
                      type="button"
                      className="secondary"
                      onClick={reiniciarChat}
                      disabled={enviandoInformacion}
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