import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { User, Mail, Phone, Calendar, Clock } from "lucide-react"
import api from "../services/api"
import "../styles/agendaform.css"

const HORARIOS_BASE = ["09:00", "10:00", "11:00", "14:00", "15:00"]

function obtenerFechaHoyLocal() {
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, "0")
  const day = String(hoy.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function AgendaForm() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      ac_codigo_pais: "506",
      ac_hora_cita: ""
    }
  })

  const [campoActivo, setCampoActivo] = useState("")
  const [mensajeExito, setMensajeExito] = useState("")
  const [mensajeError, setMensajeError] = useState("")
  const [horariosOcupados, setHorariosOcupados] = useState([])
  const [cargandoHorarios, setCargandoHorarios] = useState(false)

  const fechaSeleccionada = watch("ac_fecha_cita")

  const activar = (campo) => setCampoActivo(campo)
  const limpiar = () => setCampoActivo("")

  useEffect(() => {
    const cargarHorarios = async () => {
      if (!fechaSeleccionada) {
        setHorariosOcupados([])
        setValue("ac_hora_cita", "")
        return
      }

      const hoy = obtenerFechaHoyLocal()

      if (fechaSeleccionada < hoy) {
        setHorariosOcupados([])
        setValue("ac_hora_cita", "")
        return
      }

      try {
        setCargandoHorarios(true)
        setMensajeError("")

        const response = await api.get("/citas/horarios-disponibles", {
          params: { fecha: fechaSeleccionada }
        })

        const ocupados = response.data.horariosOcupados || []
        setHorariosOcupados(ocupados)
        setValue("ac_hora_cita", "")
      } catch (error) {
        console.error("Error consultando horarios:", error)
        setHorariosOcupados([])
      } finally {
        setCargandoHorarios(false)
      }
    }

    cargarHorarios()
  }, [fechaSeleccionada, setValue])

  const onSubmit = async (data) => {
    const hoy = obtenerFechaHoyLocal()

    if (data.ac_fecha_cita < hoy) {
      setMensajeError("No se puede agendar una cita en una fecha pasada.")
      setMensajeExito("")
      return
    }

    if (horariosOcupados.includes(data.ac_hora_cita)) {
      setMensajeError("La hora seleccionada ya no está disponible. Selecciona otra.")
      setMensajeExito("")
      return
    }

    const cita = {
      ac_nombre: data.ac_nombre,
      ac_identificacion: "N/A",
      ac_correo: data.ac_correo,
      ac_codigo_pais: Number(data.ac_codigo_pais),
      ac_telefono: data.ac_telefono,
      ac_motivo_cita: data.ac_motivo_cita,
      ac_fecha_cita: data.ac_fecha_cita,
      ac_hora_cita: data.ac_hora_cita,
      nombre_marca: "",
      descripcion_producto_servicio: data.ac_motivo_cita,
      adjunto_imagenes: false
    }

    setMensajeExito("")
    setMensajeError("")

    try {
      const response = await api.post("/citas", cita)

      if (response.data.ok) {
        if (response.data.correoEnviado === false) {
          setMensajeExito("Cita registrada correctamente. Sin embargo, hubo un problema al enviar la notificación por correo.")
        } else {
          setMensajeExito("Gracias por contactarnos, nos pondremos en contacto pronto.")
        }

        reset({
          ac_codigo_pais: "506",
          ac_hora_cita: ""
        })

        setCampoActivo("")
        setHorariosOcupados([])

        setTimeout(() => {
          setMensajeExito("")
        }, 5000)
      } else {
        setMensajeError("No fue posible registrar la cita. Inténtalo nuevamente.")
      }
    } catch (error) {
      console.error("Error registrando la cita:", error)

      const mensajeBackend =
        error.response?.data?.mensaje ||
        "No fue posible registrar la cita. Inténtalo nuevamente."

      setMensajeError(mensajeBackend)

      setTimeout(() => {
        setMensajeError("")
      }, 5000)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="agenda-form">
      <label>Nombre Completo</label>
      <div className="input-group">
        <User size={18} />
        <input
          placeholder="Tu nombre"
          {...register("ac_nombre", {
            required: "El nombre es obligatorio",
            minLength: {
              value: 10,
              message: "El nombre debe tener al menos 10 caracteres"
            }
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

      <label>Correo Electrónico</label>
      <div className="input-group">
        <Mail size={18} />
        <input
          placeholder="tu@email.com"
          {...register("ac_correo", {
            required: "El correo es obligatorio",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Correo electrónico inválido"
            }
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

      <label>Teléfono</label>
      <div className="telefono-row">
        <div className="country-code-group">
          <select
            {...register("ac_codigo_pais", {
              required: "Debe seleccionar un código de país"
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
            placeholder="88889999"
            {...register("ac_telefono", {
              required: "El teléfono es obligatorio",
              pattern: {
                value: /^[0-9]+$/,
                message: "El teléfono solo debe contener números"
              },
              minLength: {
                value: 8,
                message: "El teléfono debe tener al menos 8 números"
              }
            })}
            onMouseEnter={() => activar("telefono")}
            onFocus={() => activar("telefono")}
            onMouseLeave={limpiar}
          />
        </div>
      </div>

      {campoActivo === "telefono" && (
        <p className="help-message">
          ¿Cuál es tu teléfono para contactarte?
        </p>
      )}
      {errors.ac_codigo_pais && <p className="error">{errors.ac_codigo_pais.message}</p>}
      {errors.ac_telefono && <p className="error">{errors.ac_telefono.message}</p>}

      <div className="row">
        <div className="field">
          <label>Fecha Preferida</label>
          <div className="input-group">
            <Calendar size={18} />
            <input
              type="date"
              min={obtenerFechaHoyLocal()}
              {...register("ac_fecha_cita", {
                required: "Debe seleccionar una fecha"
              })}
              onMouseEnter={() => activar("fecha")}
              onFocus={() => activar("fecha")}
              onMouseLeave={limpiar}
            />
          </div>

          {campoActivo === "fecha" && (
            <p className="help-message">
              ¿Cuál fecha desea?
            </p>
          )}
          {errors.ac_fecha_cita && <p className="error">{errors.ac_fecha_cita.message}</p>}
        </div>

        <div className="field">
          <label>Hora Preferida</label>
          <div className="input-group">
            <Clock size={18} />
            <select
              {...register("ac_hora_cita", {
                required: "Debe seleccionar una hora"
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
                const ocupado = horariosOcupados.includes(hora)

                return (
                  <option
                    key={hora}
                    value={hora}
                    disabled={ocupado}
                  >
                    {ocupado ? `${hora} - No disponible` : hora}
                  </option>
                )
              })}
            </select>
          </div>

          {campoActivo === "hora" && (
            <p className="help-message">
              ¿Cuál hora desea?
            </p>
          )}
          {fechaSeleccionada && !cargandoHorarios && horariosOcupados.length > 0 && (
            <p className="help-message">
              Horas no disponibles: {horariosOcupados.join(", ")}
            </p>
          )}
          {errors.ac_hora_cita && <p className="error">{errors.ac_hora_cita.message}</p>}
        </div>
      </div>

      <label>Motivo de la Cita</label>
      <textarea
        placeholder="Cuéntanos brevemente el motivo de tu cita..."
        {...register("ac_motivo_cita", {
          required: "Debe indicar el motivo",
          minLength: {
            value: 20,
            message: "El motivo debe tener al menos 20 caracteres"
          }
        })}
        onMouseEnter={() => activar("motivo")}
        onFocus={() => activar("motivo")}
        onMouseLeave={limpiar}
      />

      {campoActivo === "motivo" && (
        <p className="help-message">
          Cuéntanos brevemente en qué podemos ayudarte con tu marca.
        </p>
      )}
      {errors.ac_motivo_cita && <p className="error">{errors.ac_motivo_cita.message}</p>}

      {mensajeExito && (
        <div className="mensaje-exito">
          {mensajeExito}
        </div>
      )}

      {mensajeError && (
        <div className="mensaje-error">
          {mensajeError}
        </div>
      )}

      <button type="submit">
        Agendar Cita
      </button>
    </form>
  )
}

export default AgendaForm