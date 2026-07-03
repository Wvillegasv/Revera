import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Send, Upload, X } from "lucide-react";
import { enviarSolicitudRegistroMarca } from "../../services/registroMarcaApi";
import ChatMessage from "./ChatMessage";
import {
  INITIAL_FORM,
  buildBaseSteps,
  buildContactoFinalSteps,
  buildEmpresaSteps,
  buildMarcaSteps,
  buildNombreComercialSteps,
  buildPersonaSteps,
  insertarPasosOtroPais,
} from "./flowConfig";
import {
  buildRequestFormData,
  buildResumenItems,
  formatearTelefonoVisual,
  validateCorreo,
  validateRequiredOption,
  validateTelefono,
  validateTexto,
} from "./chatbotHelpers";
import "../../styles/chatbot-registro-marca.css";

const DURACION_MENSAJE_EXITO_MS = 20000;

function tieneRespuesta(step, formData) {
  const value = formData[step.key];

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && value !== "";
}

function obtenerTextoRespuesta(step, formData) {
  const value = formData[step.key];

  if (step.type === "file") {
    return value?.name || "No adjuntó archivo";
  }

  if (step.type === "phone") {
    return formatearTelefonoVisual({
      codigoPais: formData[step.phoneKeys?.codigoPais],
      numero: formData[step.phoneKeys?.numero],
    });
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value ?? "");
}

export default function ChatbotRegistroMarca({ abierto, onClose }) {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const timeoutCierreRef = useRef(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errorActual, setErrorActual] = useState("");
  const [enResumen, setEnResumen] = useState(false);
  const [editandoPasoKey, setEditandoPasoKey] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeFinal, setMensajeFinal] = useState("");

  const validators = useMemo(
    () => ({
      validateRequiredOption,
      validateCorreo,
      validateTelefono,
      validateTexto,
    }),
    []
  );

  const steps = useMemo(() => {
    const baseSteps = buildBaseSteps(validators);
    const middleSteps =
      formData.tipoTramite === "Marca"
        ? buildMarcaSteps(validators)
        : formData.tipoTramite === "Nombre Comercial"
        ? buildNombreComercialSteps(validators)
        : [];
    const ownerSteps =
      formData.tipoTitular === "Persona"
        ? buildPersonaSteps(validators)
        : formData.tipoTitular === "Empresa"
        ? buildEmpresaSteps(validators)
        : [];

    return insertarPasosOtroPais(
      [
        ...baseSteps,
        ...middleSteps,
        ...ownerSteps,
        ...buildContactoFinalSteps(validators),
      ],
      formData,
      validators
    );
  }, [formData, validators]);

  const currentStep = enResumen ? null : steps[stepIndex];

  const messages = useMemo(() => {
    const result = [];
    const limite = enResumen ? steps.length : stepIndex;

    for (let index = 0; index < limite; index += 1) {
      const step = steps[index];

      if (!tieneRespuesta(step, formData)) {
        continue;
      }

      result.push({
        from: "system",
        text: step.question,
        links: step.links || [],
      });

      result.push({
        from: "user",
        text: obtenerTextoRespuesta(step, formData),
      });
    }

    if (!enResumen && currentStep) {
      result.push({
        from: "system",
        text: currentStep.question,
        links: currentStep.links || [],
        editando: Boolean(editandoPasoKey),
      });
    }

    if (enResumen) {
      result.push({
        from: "system",
        text: "Revisa tu información antes de enviarla.",
      });
    }

    return result;
  }, [currentStep, editandoPasoKey, enResumen, formData, stepIndex, steps]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [enviado, enResumen, errorActual, messages]);

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

  function limpiarTemporizadorCierre() {
    if (timeoutCierreRef.current) {
      clearTimeout(timeoutCierreRef.current);
      timeoutCierreRef.current = null;
    }
  }

  function resetChat() {
    limpiarTemporizadorCierre();
    setStepIndex(0);
    setInputValue("");
    setFormData(INITIAL_FORM);
    setErrorActual("");
    setEnResumen(false);
    setEditandoPasoKey("");
    setEnviado(false);
    setIsSubmitting(false);
    setMensajeFinal("");
  }

  function cerrarChat() {
    resetChat();

    if (typeof onClose === "function") {
      onClose();
    }
  }

  function setFieldValue(key, value) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function setPhoneFieldValue(step, value) {
    const codigoPais = String(value?.codigoPais || "").trim();
    const numero = String(value?.numero || "").trim();
    const phoneKeys = step.phoneKeys || {};

    setFormData((prev) => ({
      ...prev,
      [phoneKeys.codigoPais || `${step.key}CodigoPais`]: codigoPais,
      [phoneKeys.numero || `${step.key}Numero`]: numero,
      [phoneKeys.completo || step.key]: `${codigoPais}${numero}`,
    }));
  }

  function getCurrentPhoneValue() {
    const phoneKeys = currentStep?.phoneKeys || {};

    if (typeof inputValue === "object" && inputValue !== null) {
      return inputValue;
    }

    return {
      codigoPais:
        formData[phoneKeys.codigoPais] || currentStep?.placeholderCodigoPais || "506",
      numero: formData[phoneKeys.numero] || "",
    };
  }

  function getCurrentMultiValue() {
    if (Array.isArray(inputValue)) {
      return inputValue;
    }

    return Array.isArray(formData[currentStep?.key])
      ? formData[currentStep.key]
      : [];
  }

  function validateCurrentValue(value) {
    if (!currentStep || typeof currentStep.validate !== "function") {
      return "";
    }

    return currentStep.validate(value);
  }

  function handleAdvance(value) {
    const validationMessage = validateCurrentValue(value);

    if (validationMessage) {
      setErrorActual(validationMessage);
      return;
    }

    setErrorActual("");

    if (currentStep.type === "phone") {
      setPhoneFieldValue(currentStep, value);
    } else {
      setFieldValue(currentStep.key, value);
    }

    setInputValue("");

    if (editandoPasoKey) {
      setEditandoPasoKey("");
      setStepIndex(steps.length);
      setEnResumen(true);
      return;
    }

    const nextIndex = stepIndex + 1;

    if (nextIndex >= steps.length) {
      setStepIndex(steps.length);
      setEnResumen(true);
      return;
    }

    setStepIndex(nextIndex);
  }

  function handleTextSubmit(event) {
    event.preventDefault();

    if (!isSubmitting) {
      handleAdvance(inputValue);
    }
  }

  function handlePhoneSubmit(event) {
    event.preventDefault();

    if (!isSubmitting) {
      handleAdvance(getCurrentPhoneValue());
    }
  }

  function handleOptionClick(option) {
    if (!isSubmitting) {
      handleAdvance(option);
    }
  }

  function toggleNizaOption(option) {
    const seleccionActual = getCurrentMultiValue();

    if (option === "No sé") {
      setInputValue(seleccionActual.includes("No sé") ? [] : ["No sé"]);
      setErrorActual("");
      return;
    }

    const sinNoSe = seleccionActual.filter((item) => item !== "No sé");
    const seleccionNueva = sinNoSe.includes(option)
      ? sinNoSe.filter((item) => item !== option)
      : [...sinNoSe, option];

    setInputValue(seleccionNueva);
    setErrorActual("");
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    if (file) {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
        "application/pdf",
      ];

      if (!allowedMimeTypes.includes(file.type)) {
        setErrorActual("Formato no permitido. Usa JPG, JPEG, PNG, WEBP, BMP o PDF.");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setErrorActual("El archivo supera el máximo permitido de 50 MB.");
        return;
      }
    }

    handleAdvance(file);
  }

  function editarRespuesta(stepKey) {
    const index = steps.findIndex((step) => step.key === stepKey);

    if (index < 0) {
      return;
    }

    const step = steps[index];
    const valorExistente = formData[stepKey];

    setErrorActual("");
    setEnResumen(false);
    setEditandoPasoKey(stepKey);
    setStepIndex(index);

    if (step.type === "phone") {
      setInputValue({
        codigoPais: formData[step.phoneKeys?.codigoPais] || "506",
        numero: formData[step.phoneKeys?.numero] || "",
      });
      return;
    }

    if (step.type === "multi-options") {
      setInputValue(Array.isArray(valorExistente) ? valorExistente : []);
      return;
    }

    if (step.type === "file") {
      setInputValue("");
      return;
    }

    setInputValue(valorExistente || "");
  }

  async function enviarInformacion() {
    if (isSubmitting) {
      return;
    }

    setErrorActual("");
    setIsSubmitting(true);
    setMensajeFinal(
      "Tu solicitud de Registro Estratégico de Marca fue enviada correctamente. Nos pondremos en contacto contigo pronto."
    );

    // El agradecimiento aparece de inmediato. Si el backend devuelve un error,
    // se vuelve al resumen para permitir la corrección o un nuevo intento.
    setEnviado(true);

    try {
      const requestData = buildRequestFormData(formData);
      await enviarSolicitudRegistroMarca(requestData);

      limpiarTemporizadorCierre();
      timeoutCierreRef.current = setTimeout(() => {
        resetChat();

        if (typeof onClose === "function") {
          onClose();
        }

        navigate("/");
      }, DURACION_MENSAJE_EXITO_MS);
    } catch (error) {
      setEnviado(false);
      setEnResumen(true);
      setMensajeFinal("");
      setErrorActual(
        error?.response?.data?.message ||
          "Ocurrió un error al enviar la solicitud de registro de marca. Revisa la información e inténtalo nuevamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderQuestionContent(message) {
    return (
      <>
        {message.editando && <strong className="crm-editing-prefix">Editando: </strong>}
        {message.text}
        {message.links?.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="crm-question-link"
          >
            {link.text}
          </a>
        ))}
      </>
    );
  }

  function renderInputPanel() {
    if (!currentStep || enviado) {
      return null;
    }

    if (currentStep.type === "phone") {
      const phoneValue = getCurrentPhoneValue();

      return (
        <form onSubmit={handlePhoneSubmit} className="crm-form-inline crm-phone-inline">
          <input
            type="text"
            inputMode="numeric"
            className="crm-input crm-phone-code"
            value={phoneValue.codigoPais}
            onChange={(event) => {
              setInputValue({
                ...phoneValue,
                codigoPais: event.target.value.replace(/\D/g, ""),
              });
              setErrorActual("");
            }}
            placeholder={currentStep.placeholderCodigoPais || "506"}
            disabled={isSubmitting}
            aria-label="Código de país"
          />
          <input
            type="text"
            inputMode="numeric"
            className="crm-input crm-phone-number"
            value={phoneValue.numero}
            onChange={(event) => {
              setInputValue({
                ...phoneValue,
                numero: event.target.value.replace(/\D/g, ""),
              });
              setErrorActual("");
            }}
            placeholder={currentStep.placeholderNumero || "88887777"}
            disabled={isSubmitting}
            aria-label="Número de teléfono"
          />
          <button type="submit" className="crm-send-btn" disabled={isSubmitting}>
            <Send size={18} strokeWidth={2.2} />
            <span>Siguiente</span>
          </button>
        </form>
      );
    }

    if (currentStep.type === "text") {
      return (
        <form onSubmit={handleTextSubmit} className="crm-form-inline">
          <input
            type={currentStep.key === "correo" ? "email" : "text"}
            className="crm-input"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              setErrorActual("");
            }}
            placeholder={currentStep.placeholder || "Escribe tu respuesta"}
            disabled={isSubmitting}
          />
          <button type="submit" className="crm-send-btn" disabled={isSubmitting}>
            <Send size={18} strokeWidth={2.2} />
            <span>Siguiente</span>
          </button>
        </form>
      );
    }

    if (currentStep.type === "textarea") {
      return (
        <form onSubmit={handleTextSubmit} className="crm-form-block">
          <textarea
            className="crm-textarea"
            value={inputValue}
            onChange={(event) => {
              setInputValue(event.target.value);
              setErrorActual("");
            }}
            placeholder={currentStep.placeholder || "Escribe tu respuesta"}
            rows={5}
            disabled={isSubmitting}
          />
          <button type="submit" className="crm-primary-btn" disabled={isSubmitting}>
            <Send size={18} strokeWidth={2.2} />
            Siguiente
          </button>
        </form>
      );
    }

    if (currentStep.type === "options") {
      return (
        <div className="crm-options-grid">
          {currentStep.options.map((option) => (
            <button
              type="button"
              key={option}
              className="crm-option-btn"
              onClick={() => handleOptionClick(option)}
              disabled={isSubmitting}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (currentStep.type === "multi-options") {
      const seleccionadas = getCurrentMultiValue();

      return (
        <div className="crm-multi-options-panel">
          <p className="crm-options-help">
            Puedes seleccionar una o varias clases. Luego pulsa Siguiente.
          </p>
          <div className="crm-options-grid">
            {currentStep.options.map((option) => {
              const selected = seleccionadas.includes(option);

              return (
                <button
                  type="button"
                  key={option}
                  className={`crm-option-btn ${selected ? "crm-option-btn--selected" : ""}`}
                  onClick={() => toggleNizaOption(option)}
                  disabled={isSubmitting}
                  aria-pressed={selected}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="crm-primary-btn"
            onClick={() => handleAdvance(seleccionadas)}
            disabled={isSubmitting}
          >
            <Send size={18} strokeWidth={2.2} />
            Siguiente
          </button>
        </div>
      );
    }

    if (currentStep.type === "file") {
      const archivoActual = formData[currentStep.key];

      return (
        <div className="crm-file-box">
          <label className="crm-file-label">
            <Upload size={18} />
            <span>Seleccionar archivo</span>
            <input
              type="file"
              accept={currentStep.accept}
              onChange={handleFileChange}
              hidden
              disabled={isSubmitting}
            />
          </label>
          {archivoActual?.name && <span className="crm-file-name">{archivoActual.name}</span>}
          <button
            type="button"
            className="crm-secondary-btn"
            onClick={() => handleAdvance(null)}
            disabled={isSubmitting}
          >
            Siguiente sin adjuntar
          </button>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="crm-overlay" onClick={cerrarChat}>
      <section className="crm-modal" onClick={(event) => event.stopPropagation()}>
        <header className="crm-header">
          <div>
            <h2>Registro de Marca</h2>
            <p>
              Completa el flujo conversacional para iniciar tu solicitud. Consulta{" "}
              <a
                href="/guia/precios-servicios-revera"
                target="_blank"
                rel="noopener noreferrer"
                className="crm-header-link"
              >
                Precios de servicios Revera
              </a>{" "}
              y{" "}
              <a
                href="/guia/como-funcionan-servicios-revera"
                target="_blank"
                rel="noopener noreferrer"
                className="crm-header-link"
              >
                Cómo funcionan los servicios de Revera
              </a>
              .
            </p>
          </div>
          <button
            type="button"
            className="crm-close-btn"
            onClick={cerrarChat}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>

        <div className="crm-body">
          {enviado ? (
            <div className="crm-success">
              <CheckCircle2 size={42} strokeWidth={1.8} />
              <h3>¡Gracias por compartir tu información con nosotros!</h3>
              <p>{mensajeFinal}</p>
            </div>
          ) : (
            <>
              <div className="crm-chat-window">
                {messages.map((message, index) => {
                  if (message.from === "user") {
                    return (
                      <ChatMessage from="user" key={`user-${index}`}>
                        {message.text}
                      </ChatMessage>
                    );
                  }

                  return (
                    <ChatMessage from="system" key={`system-${index}`}>
                      {renderQuestionContent(message)}
                    </ChatMessage>
                  );
                })}

                {enResumen && (
                  <div className="crm-chat-message crm-chat-message--system">
                    <div className="crm-chat-bubble crm-summary-bubble">
                      <div className="crm-summary-list">
                        {buildResumenItems(formData).map((item) => (
                          <div className="crm-summary-row" key={item.key}>
                            <p className="crm-summary-line">
                              <span className="crm-summary-label">{item.etiqueta}:</span>{" "}
                              <span className="crm-summary-value">{item.valor}</span>
                            </p>
                            <button
                              type="button"
                              className="crm-edit-btn"
                              onClick={() => editarRespuesta(item.key)}
                              disabled={isSubmitting}
                            >
                              Editar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {enResumen ? (
                <div className="crm-summary-actions">
                  <button
                    type="button"
                    className="crm-primary-btn"
                    onClick={enviarInformacion}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando información..." : "Enviar información"}
                  </button>
                  <button
                    type="button"
                    className="crm-secondary-btn"
                    onClick={resetChat}
                    disabled={isSubmitting}
                  >
                    Reiniciar
                  </button>
                  <a
                    href="/aviso-privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="crm-privacy-link"
                  >
                    Aviso de Privacidad
                  </a>
                </div>
              ) : (
                <div className="crm-input-panel">{renderInputPanel()}</div>
              )}

              {errorActual && <p className="crm-error-text">{errorActual}</p>}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
