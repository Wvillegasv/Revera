const nodemailer = require("nodemailer")
require("dotenv").config()

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

async function verificarCorreo() {
  return transporter.verify()
}

async function enviarSolicitudRegistrabilidad(data) {
  const {
    ac_nombre,
    ac_correo,
    ac_telefono,
    descripcion_producto_servicio,
    correosDestino,
    ac_asunto_consulta,
    ac_fecha_cita,
    ac_hora_cita
  } = data

  if (!Array.isArray(correosDestino) || correosDestino.length === 0) {
    throw new Error("No se recibieron correos de destino para enviar la notificación")
  }

  const asuntoBase = ac_asunto_consulta || "Consulta general"
  const asunto = `${asuntoBase} - ${ac_nombre || ""}`

  const cuerpo = `
Solicitud de consulta

Motivo principal: ${ac_asunto_consulta || ""}

Nombre: ${ac_nombre || ""}
Correo: ${ac_correo || ""}
Teléfono: ${ac_telefono || ""}
Asunto: ${descripcion_producto_servicio || ""}
Fecha de la cita: ${ac_fecha_cita || ""}
Hora de la cita: ${ac_hora_cita || ""}
`

  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: correosDestino.join(","),
    replyTo: ac_correo || process.env.SMTP_FROM,
    subject: asunto,
    text: cuerpo
  })
}

module.exports = {
  enviarSolicitudRegistrabilidad,
  verificarCorreo
}
