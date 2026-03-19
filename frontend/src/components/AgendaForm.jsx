import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MessageSquare,
  MapPin,
} from "lucide-react";
import api from "../services/api";
import "../styles/agendaform.css";

const HORARIOS_BASE = ["09:00", "10:00", "11:00", "14:00", "15:00"];

const OPCIONES_CONSULTA = [
  "Registro de marca",
  "Estudio de registrabilidad",
  "Uso indebido de marca",
  "Renovación de marca",
  "Otra consulta",
];

function obtenerFechaHoyLocal() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function AgendaForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ac_nombre: "",
      ac_correo: "",
      ac_codigo_pais: "506",
      ac_telefono: "",
      ac_fecha_cita: "",
      ac_hora_cita: "",
      ac_asunto_consulta: "",
      ac_descripcion_consulta: "",
    },
  });

  const [campoActivo, setCampoActivo] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  const fechaSeleccionada = watch("ac_fecha_cita");

  const activar = (campo) => setCampoActivo(campo);
  const limpiar = () => setCampoActivo("");

  useEffect(() => {
    const cargarHorarios = async () => {
      if (!fechaSeleccionada) {
        setHorariosOcupados([]);
        setValue("ac_hora_cita", "");
        return;
      }

      const hoy = obtenerFechaHoyLocal();

      if (fechaSeleccionada < hoy) {
        setHorariosOcupados([]);
        setValue("ac_hora_cita", "");
        return;
      }

      try {
        setCargandoHorarios(true);
        setMensajeError("");

        const response = await api.get("/citas/horarios-disponibles", {
          params: { fecha: fechaSeleccionada },
        });

        const ocupados = response.data.horariosOcupados || [];
        setHorariosOcupados(ocupados);
        setValue("ac_hora_cita", "");
      } catch (error) {
        console.error("Error consultando horarios:", error);
        setHorariosOcupados([]);
      } finally {
        setCargandoHorarios(false);
      }
    };

    cargarHorarios();
  }, [fechaSeleccionada, setValue]);

  const construirMotivoCita = (data) => {
    const partes = [];

    if (data.ac_asunto_consulta) {
      partes.push(`Asunto: ${data.ac_asunto_consulta}`);
    }

    if (data.ac_descripcion_consulta?.trim()) {
      partes.push(`Descripción: ${data.ac_descripcion_consulta.trim()}`);
    }

    return partes.join(" | ");
  };

  const limpiarFormulario = () => {
    reset({
      ac_nombre: "",
      ac_correo: "",
      ac_codigo_pais: "506",
      ac_telefono: "",
      ac_fecha_cita: "",
      ac_hora_cita: "",
      ac_asunto_consulta: "",
      ac_descripcion_consulta: "",
    });

    setCampoActivo("");
    setHorariosOcupados([]);
  };

  const onSubmit = async (data) => {
    const hoy = obtenerFechaHoyLocal();

    if (data.ac_fecha_cita < hoy) {
      setMensajeError("No se puede agendar una cita en una fecha pasada.");
      setMensajeExito("");
      return;
    }

    if (horariosOcupados.includes(data.ac_hora_cita)) {
      setMensajeError("La hora seleccionada ya no está disponible. Selecciona otra.");
      setMensajeExito("");
      return;
    }

    const motivoCompleto = construirMotivoCita(data);

    const cita = {
      ac_nombre: data.ac_nombre,
      ac_identificacion: "N/A",
      ac_correo: data.ac_correo,
      ac_codigo_pais: Number(data.ac_codigo_pais),
      ac_telefono: data.ac_telefono,
      ac_fecha_cita: data.ac_fecha_cita,
      ac_hora_cita: data.ac_hora_cita,
      ac_asunto_consulta: data.ac_asunto_consulta,
      ac_otro_motivo: "",
      ac_descripcion_consulta: data.ac_descripcion_consulta,
      ac_motivo_cita: motivoCompleto,
      nombre_marca: "",
      descripcion_producto_servicio: data.ac_descripcion_consulta,
      adjunto_imagenes: false,
    };

    setMensajeExito("");
    setMensajeError("");

    try {
      const response = await api.post("/citas", cita);

      if (response.data.ok) {
        limpiarFormulario();

        if (response.data.correoEnviado === false) {
          setMensajeExito(
            "Cita registrada correctamente. Sin embargo, hubo un problema al enviar la notificación por correo."
          );

          setTimeout(() => {
            setMensajeExito("");
            if (onSuccess) onSuccess();
          }, 5000);
        } else {
          setMensajeExito("Gracias por contactarnos, nos pondremos en contacto pronto.");

          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 3000);
        }
      } else {
        setMensajeError("No fue posible registrar la cita. Inténtalo nuevamente.");

        setTimeout(() => {
          setMensajeError("");
        }, 5000);
      }
    } catch (error) {
      console.error("Error registrando la cita:", error);

      const erroresBackend = error.response?.data?.errores || [];
      const mensajeBackend =
        erroresBackend.length > 0
          ? erroresBackend.join(" | ")
          : error.response?.data?.mensaje ||
            error.response?.data?.message ||
            "No fue posible registrar la cita. Inténtalo nuevamente.";

      setMensajeError(mensajeBackend);

      setTimeout(() => {
        setMensajeError("");
      }, 5000);
    }
  };

  return (
    <section className="agenda-section">
      <div className="agenda-form-shell">
        <div className="agenda-form-decoration"></div>

        <div className="agenda-layout-card">
          <aside className="agenda-contact-info">
            <h3>Información de Contacto</h3>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <Mail size={20} />
              </div>
              <div>
                <h4>Correo electrónico</h4>
                <p>info@revera.cr</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <Phone size={20} />
              </div>
              <div>
                <h4>Teléfono</h4>
                <p>+506 0000-0000</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <Clock size={20} />
              </div>
              <div>
                <h4>Horario de atención</h4>
                <p>Lunes a Viernes</p>
                <p>9:00 a.m. - 5:00 p.m.</p>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <MapPin size={20} />
              </div>
              <div>
                <h4>Ubicación</h4>
                <p>Costa Rica</p>
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit(onSubmit)} className="agenda-form-card">
            <div className="agenda-form-group">
              <label htmlFor="ac_nombre">
                <User size={18} />
                <span>Nombre Completo</span>
              </label>

              <div className="input-group">
                <User size={18} />
                <input
                  id="ac_nombre"
                  type="text"
                  placeholder="Tu nombre"
                  {...register("ac_nombre", {
                    required: "El nombre es obligatorio",
                    minLength: {
                      value: 10,
                      message: "El nombre debe tener al menos 10 caracteres",
                    },
                  })}
                  onMouseEnter={() => activar("nombre")}
                  onFocus={() => activar("nombre")}
                  onMouseLeave={limpiar}
                />
              </div>

              {campoActivo === "nombre" && (
                <p className="help-message">
                  ¡Hola! Para agendar una consultoría, ¿cuál es tu nombre completo?
                </p>
              )}
              {errors.ac_nombre && <p className="error">{errors.ac_nombre.message}</p>}
            </div>

            <div className="agenda-form-group">
              <label htmlFor="ac_correo">
                <Mail size={18} />
                <span>Correo Electrónico</span>
              </label>

              <div className="input-group">
                <Mail size={18} />
                <input
                  id="ac_correo"
                  type="email"
                  placeholder="tu@email.com"
                  {...register("ac_correo", {
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Correo electrónico inválido",
                    },
                  })}
                  onMouseEnter={() => activar("correo")}
                  onFocus={() => activar("correo")}
                  onMouseLeave={limpiar}
                />
              </div>

              {campoActivo === "correo" && (
                <p className="help-message">
                  Gracias. ¿Cuál es tu correo electrónico para contactarte?
                </p>
              )}
              {errors.ac_correo && <p className="error">{errors.ac_correo.message}</p>}
            </div>

            <div className="agenda-form-group">
              <label>
                <Phone size={18} />
                <span>Teléfono</span>
              </label>

              <div className="telefono-row">
                <div className="country-code-group">
                  <select
                    {...register("ac_codigo_pais", {
                      required: "Debe seleccionar un código de país",
                    })}
                    onMouseEnter={() => activar("telefono")}
                    onFocus={() => activar("telefono")}
                    onMouseLeave={limpiar}
                  >
                    <option value="506">Costa Rica (+506)</option>
                    <option value="1">Estados Unidos (+1)</option>
                    <option value="52">México (+52)</option>
                    <option value="34">España (+34)</option>
                    <option value="44">Reino Unido (+44)</option>
                    <option value="55">Brasil (+55)</option>
                    <option value="57">Colombia (+57)</option>
                    <option value="54">Argentina (+54)</option>
                    <option value="56">Chile (+56)</option>
                    <option value="51">Perú (+51)</option>
                    <option value="593">Ecuador (+593)</option>
                    <option value="591">Bolivia (+591)</option>
                    <option value="595">Paraguay (+595)</option>
                    <option value="598">Uruguay (+598)</option>
                    <option value="507">Panamá (+507)</option>
                    <option value="502">Guatemala (+502)</option>
                    <option value="503">El Salvador (+503)</option>
                    <option value="504">Honduras (+504)</option>
                    <option value="505">Nicaragua (+505)</option>
                  </select>
                </div>

                <div className="input-group phone-input-group">
                  <Phone size={18} />
                  <input
                    type="text"
                    placeholder="88889999"
                    {...register("ac_telefono", {
                      required: "El teléfono es obligatorio",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "El teléfono solo debe contener números",
                      },
                      minLength: {
                        value: 8,
                        message: "El teléfono debe tener al menos 8 números",
                      },
                    })}
                    onMouseEnter={() => activar("telefono")}
                    onFocus={() => activar("telefono")}
                    onMouseLeave={limpiar}
                  />
                </div>
              </div>

              {campoActivo === "telefono" && (
                <p className="help-message">¿Cuál es tu teléfono para contactarte?</p>
              )}
              {errors.ac_codigo_pais && (
                <p className="error">{errors.ac_codigo_pais.message}</p>
              )}
              {errors.ac_telefono && <p className="error">{errors.ac_telefono.message}</p>}
            </div>

            <div className="agenda-form-row">
              <div className="agenda-form-group">
                <label htmlFor="ac_fecha_cita">
                  <Calendar size={18} />
                  <span>Fecha Preferida</span>
                </label>

                <div className="input-group">
                  <Calendar size={18} />
                  <input
                    id="ac_fecha_cita"
                    type="date"
                    min={obtenerFechaHoyLocal()}
                    {...register("ac_fecha_cita", {
                      required: "Debe seleccionar una fecha",
                    })}
                    onMouseEnter={() => activar("fecha")}
                    onFocus={() => activar("fecha")}
                    onMouseLeave={limpiar}
                  />
                </div>

                {campoActivo === "fecha" && (
                  <p className="help-message">¿Cuál fecha desea?</p>
                )}
                {errors.ac_fecha_cita && (
                  <p className="error">{errors.ac_fecha_cita.message}</p>
                )}
              </div>

              <div className="agenda-form-group">
                <label htmlFor="ac_hora_cita">
                  <Clock size={18} />
                  <span>Hora Preferida</span>
                </label>

                <div className="input-group">
                  <Clock size={18} />
                  <select
                    id="ac_hora_cita"
                    {...register("ac_hora_cita", {
                      required: "Debe seleccionar una hora",
                    })}
                    onMouseEnter={() => activar("hora")}
                    onFocus={() => activar("hora")}
                    onMouseLeave={limpiar}
                    disabled={!fechaSeleccionada || cargandoHorarios}
                  >
                    <option value="">
                      {cargandoHorarios ? "Cargando horarios..." : "Seleccione una hora"}
                    </option>

                    {HORARIOS_BASE.map((hora) => {
                      const ocupado = horariosOcupados.includes(hora);

                      return (
                        <option key={hora} value={hora} disabled={ocupado}>
                          {ocupado ? `${hora} - No disponible` : hora}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {campoActivo === "hora" && (
                  <p className="help-message">¿Cuál hora desea?</p>
                )}
                {fechaSeleccionada && !cargandoHorarios && horariosOcupados.length > 0 && (
                  <p className="help-message">
                    Horas no disponibles: {horariosOcupados.join(", ")}
                  </p>
                )}
                {errors.ac_hora_cita && (
                  <p className="error">{errors.ac_hora_cita.message}</p>
                )}
              </div>
            </div>

            <div className="agenda-form-group">
              <label htmlFor="ac_asunto_consulta">
                <MessageSquare size={18} />
                <span>¿Cuál es el motivo principal de tu consulta?</span>
              </label>

              <div className="input-group">
                <MessageSquare size={18} />
                <select
                  id="ac_asunto_consulta"
                  {...register("ac_asunto_consulta", {
                    required: "Debe seleccionar el motivo principal de la consulta",
                  })}
                  onMouseEnter={() => activar("asunto")}
                  onFocus={() => activar("asunto")}
                  onMouseLeave={limpiar}
                >
                  <option value="">Seleccione una opción</option>
                  {OPCIONES_CONSULTA.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              {campoActivo === "asunto" && (
                <p className="help-message">
                  Selecciona el motivo principal de tu consulta.
                </p>
              )}
              {errors.ac_asunto_consulta && (
                <p className="error">{errors.ac_asunto_consulta.message}</p>
              )}
            </div>

            <div className="agenda-form-group">
              <label htmlFor="ac_descripcion_consulta">
                <MessageSquare size={18} />
                <span>Descripción del mensaje</span>
              </label>

              <textarea
                id="ac_descripcion_consulta"
                placeholder="Perfecto. Ahora cuéntanos brevemente los detalles de tu consulta para que el abogado pueda revisarla."
                {...register("ac_descripcion_consulta", {
                  required: "Debe indicar los detalles de la consulta",
                  minLength: {
                    value: 20,
                    message: "La descripción debe tener al menos 20 caracteres",
                  },
                })}
                onMouseEnter={() => activar("descripcion")}
                onFocus={() => activar("descripcion")}
                onMouseLeave={limpiar}
              />

              {campoActivo === "descripcion" && (
                <p className="help-message">
                  Describe brevemente los detalles de tu consulta para que el abogado pueda revisarla.
                </p>
              )}
              {errors.ac_descripcion_consulta && (
                <p className="error">{errors.ac_descripcion_consulta.message}</p>
              )}
            </div>

            {mensajeExito && <div className="mensaje-exito">{mensajeExito}</div>}
            {mensajeError && <div className="mensaje-error">{mensajeError}</div>}

            <button type="submit" className="agenda-submit-btn">
              Agendar Cita
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AgendaForm;
