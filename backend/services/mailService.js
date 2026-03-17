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
    nombre_marca,
    descripcion_producto_servicio,
    adjunto_imagenes,
    correosDestino
  } = data

  if (!Array.isArray(correosDestino) || correosDestino.length === 0) {
    throw new Error("No se recibieron correos de destino para enviar la notificación")
  }

  const asunto = `Solicitud de Estudio de Registrabilidad ${ac_nombre || ""}`

  const cuerpo = `
Solicitud de Estudio de Registrabilidad

Nombre completo: ${ac_nombre || ""}
Correo electrónico: ${ac_correo || ""}
Teléfono: ${ac_telefono || ""}
Nombre de la marca: ${nombre_marca || ""}
Descripción del producto/servicio: ${descripcion_producto_servicio || ""}
Adjuntó imágenes: ${adjunto_imagenes ? "Sí" : "No"}
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