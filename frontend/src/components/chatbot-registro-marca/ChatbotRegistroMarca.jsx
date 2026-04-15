import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Send, Upload, CheckCircle2 } from "lucide-react";
import { enviarSolicitudRegistroMarca } from "../../services/registroMarcaApi";
import ChatMessage from "./ChatMessage";
import {
  INITIAL_FORM,
  buildBaseSteps,
  buildMarcaSteps,
  buildNombreComercialSteps,
  buildPersonaSteps,
  buildEmpresaSteps,
  buildContactoFinalSteps,
  insertarPasosOtroPais,
} from "./flowConfig";
import {
  validateRequiredOption,
  validateCorreo,
  validateTelefono,
  validateTexto,
  buildResumenItems,
  buildRequestFormData,
} from "./chatbotHelpers";
import "../../styles/chatbot-registro-marca.css";

export default function ChatbotRegistroMarca({ abierto, onClose }) {
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errorActual, setErrorActual] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeFinal, setMensajeFinal] = useState("");
  const [modoConfirmacionFinal, setModoConfirmacionFinal] = useState(false);
  const chatEndRef = useRef(null);

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

    const contactSteps = buildContactoFinalSteps(validators);

    const flujoBase = [...baseSteps, ...middleSteps, ...ownerSteps, ...contactSteps];

    return insertarPasosOtroPais(flujoBase, formData, validators);
  }, [formData, validators]);

  const currentStep = steps[stepIndex];

  const messages = useMemo(() => {
    const result = [];

    for (let i = 0; i <= stepIndex && i < steps.length; i += 1) {
      const step = steps[i];

      if (step.type !== "confirmation") {
        result.push({
          from: "system",
          text: step.question,
        });
      }

      const value = formData[step.key];

      if (
        i < stepIndex &&
        step.key &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        result.push({
          from: "user",
          text: step.type === "file" ? value?.name || "Archivo adjunto" : String(value),
        });
      }
    }

    if (modoConfirmacionFinal) {
      result.push({
        from: "system",
        text: "Revisemos la información antes de enviarla.",
      });

      result.push({
        from: "summary",
        items: buildResumenItems(formData),
      });

      result.push({
        from: "system",
        text: "¿Desea enviar la información?",
      });
    }

    return result;
  }, [formData, modoConfirmacionFinal, stepIndex, steps]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, errorActual, enviado]);

  useEffect(() => {
    if (!enviado) return;

    const timeout = setTimeout(() => {
      resetChat();
      if (typeof onClose === "function") onClose();
      navigate("/");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [enviado, navigate, onClose]);

  if (!abierto) return null;

  function resetChat() {
    setStepIndex(0);
    setInputValue("");
    setFormData(INITIAL_FORM);
    setErrorActual("");
    setEnviado(false);
    setIsSubmitting(false);
    setMensajeFinal("");
    setModoConfirmacionFinal(false);
  }

  function setFieldValue(key, value) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function validateCurrentValue(value) {
    if (!currentStep || typeof currentStep.validate !== "function") {
      return "";
    }
    return currentStep.validate(value);
  }

  async function submitToBackend(payload) {
    try {
      setIsSubmitting(true);
      setErrorActual("");

      const requestData = buildRequestFormData(payload);
      await enviarSolicitudRegistroMarca(requestData);

      setMensajeFinal(
        "Su solicitud de registro de marca ha sido enviada correctamente. Nos pondremos en contacto con usted."
      );
      setEnviado(true);
    } catch (error) {
      setErrorActual(
        error?.response?.data?.message ||
          "Ocurrió un error al enviar la solicitud de registro de marca."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function manejarConfirmacionFinal(respuesta) {
    const valor = String(respuesta || "").trim().toLowerCase();

    if (valor === "no") {
      resetChat();
      return;
    }

    if (valor === "si" || valor === "sí") {
      await submitToBackend(formData);
      return;
    }

    setErrorActual("Debes seleccionar Sí o No.");
  }

  async function handleAdvance(value) {
    const validationMessage = validateCurrentValue(value);

    if (validationMessage) {
      setErrorActual(validationMessage);
      return;
    }

    setErrorActual("");

    setFieldValue(currentStep.key, value);
    setInputValue("");

    const nextIndex = stepIndex + 1;
    const nextStep = steps[nextIndex];

    if (!nextStep) {
      return;
    }

    if (nextStep.type === "confirmation") {
      setStepIndex(nextIndex);
      setModoConfirmacionFinal(true);
      return;
    }

    setStepIndex(nextIndex);
  }

  async function handleTextSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;

    await handleAdvance(inputValue);
  }

  async function handleOptionClick(option) {
    if (isSubmitting) return;
    await handleAdvance(option);
  }

  async function handleFileChange(event) {
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
        setErrorActual("Formato no permitido. Usa JPG, PNG, WEBP, BMP o PDF.");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setErrorActual("El archivo supera el máximo permitido de 50 MB.");
        return;
      }
    }

    await handleAdvance(file);
  }

  return (
    <div className="crm-overlay">
      <div className="crm-modal">
        <div className="crm-header">
          <div>
            <h2>Registro de Marca</h2>
            <p>Completa el flujo conversacional para iniciar tu solicitud.</p>
          </div>

          <button
            type="button"
            className="crm-close-btn"
            onClick={() => {
              resetChat();
              if (typeof onClose === "function") onClose();
            }}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="crm-body">
          {!enviado ? (
            <>
              <div className="crm-chat-window">
                {messages.map((msg, index) => {
                  if (msg.from === "summary") {
                    return (
                      <div
                        className="crm-chat-message crm-chat-message--system"
                        key={`summary-${index}`}
                      >
                        <div className="crm-chat-bubble crm-summary-bubble">
                          <div className="crm-summary-list">
                            {msg.items.map((item, itemIndex) => (
                              <p
                                className="crm-summary-line"
                                key={`${item.etiqueta}-${itemIndex}`}
                              >
                                <span className="crm-summary-label">
                                  {item.etiqueta}:
                                </span>{" "}
                                <span className="crm-summary-value">
                                  {item.valor}
                                </span>
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <ChatMessage from={msg.from} key={`${msg.from}-${index}`}>
                      {msg.text}
                    </ChatMessage>
                  );
                })}
                <div ref={chatEndRef}></div>
              </div>

              <div className="crm-input-panel">
                {!modoConfirmacionFinal && currentStep?.type === "text" && (
                  <form onSubmit={handleTextSubmit} className="crm-form-inline">
                    <input
                      type="text"
                      className="crm-input"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        if (errorActual) setErrorActual("");
                      }}
                      placeholder={currentStep.placeholder || "Escribe tu respuesta"}
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      className="crm-send-btn"
                      disabled={isSubmitting}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                )}

                {!modoConfirmacionFinal && currentStep?.type === "textarea" && (
                  <form onSubmit={handleTextSubmit} className="crm-form-block">
                    <textarea
                      className="crm-textarea"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        if (errorActual) setErrorActual("");
                      }}
                      placeholder={currentStep.placeholder || "Escribe tu respuesta"}
                      rows={5}
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      className="crm-primary-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Continuar"}
                    </button>
                  </form>
                )}

                {!modoConfirmacionFinal && currentStep?.type === "options" && (
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
                )}

                {!modoConfirmacionFinal && currentStep?.type === "file" && (
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

                    <button
                      type="button"
                      className="crm-secondary-btn"
                      onClick={() => handleAdvance(null)}
                      disabled={isSubmitting}
                    >
                      Continuar sin adjuntar
                    </button>
                  </div>
                )}

                {modoConfirmacionFinal && (
                  <div className="crm-options-grid">
                    <button
                      type="button"
                      className="crm-option-btn"
                      onClick={() => manejarConfirmacionFinal("si")}
                      disabled={isSubmitting}
                    >
                      Sí
                    </button>

                    <button
                      type="button"
                      className="crm-option-btn"
                      onClick={() => manejarConfirmacionFinal("no")}
                      disabled={isSubmitting}
                    >
                      No
                    </button>
                  </div>
                )}

                {errorActual && <p className="crm-error-text">{errorActual}</p>}
              </div>
            </>
          ) : (
            <div className="crm-success">
              <CheckCircle2 size={48} />
              <h3>Solicitud enviada</h3>
              <p>{mensajeFinal}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
