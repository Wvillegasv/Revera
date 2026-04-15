const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function enviarCorreo({ to, subject, html, attachments = [] }) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
    attachments,
  });
}

/* =======================================================
   HELPERS
======================================================= */
function limpiarPayloadCorreo(payload) {
  const limpio = {};

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (typeof value === "string" && value.trim() === "") return;
    limpio[key] = value;
  });

  return limpio;
}

function resolverValorPais(payload, keyBase) {
  const valor = payload[keyBase];
  const valorOtro = payload[`${keyBase}Otro`];

  if (valor === "Otro") {
    return valorOtro || "";
  }

  return valor || "";
}

function construirHtmlRegistroMarca(payload) {
  const limpio = limpiarPayloadCorreo(payload);
  const bloques = [];

  function agregarLinea(etiqueta, valor) {
    const limpioValor = String(valor ?? "").trim();
    if (!limpioValor) return;
    bloques.push(`<p><strong>${etiqueta}:</strong> ${limpioValor}</p>`);
  }

  agregarLinea("Correo", limpio.correo);
  agregarLinea("Marca o nombre comercial", limpio.nombreMarca);
  agregarLinea("Tipo de trámite", limpio.tipoTramite);

  if (limpio.tipoTramite === "Marca") {
    agregarLinea("Tipo de marca", limpio.tipoMarca);
    agregarLinea("Qué desea registrar", limpio.queDeseaRegistrar);
    agregarLinea("Productos/servicios", limpio.productosServiciosTipo);
    agregarLinea("Detalle", limpio.detalleProductosServicios);
    agregarLinea("Clase Niza", limpio.claseNiza);
    agregarLinea("País de origen", resolverValorPais(limpio, "paisOrigen"));
    agregarLinea("Dirección del establecimiento", limpio.direccionEstablecimiento);
    agregarLinea("Información adicional", limpio.informacionAdicional);
    agregarLinea("Registro previo en otro país", limpio.registroPrevioOtroPais);
  }

  if (limpio.tipoTramite === "Nombre Comercial") {
    agregarLinea("Giro o actividad", limpio.giroActividad);
    agregarLinea("Qué desea registrar", limpio.queDeseaRegistrar);
    agregarLinea("Productos/servicios", limpio.productosServiciosTipo);
    agregarLinea("Detalle", limpio.detalleProductosServicios);
    agregarLinea("País de origen", resolverValorPais(limpio, "paisOrigen"));
    agregarLinea("Dirección del establecimiento", limpio.direccionEstablecimiento);
    agregarLinea("Información adicional", limpio.informacionAdicional);
    agregarLinea("Registro previo en otro país", limpio.registroPrevioOtroPais);
  }

  agregarLinea("Titular", limpio.tipoTitular);

  if (limpio.tipoTitular === "Persona") {
    agregarLinea("Nombre titular", limpio.personaNombre);
    agregarLinea("Estado civil titular", limpio.personaEstadoCivil);
    agregarLinea("Profesión titular", limpio.personaProfesion);
    agregarLinea("Tipo identificación titular", limpio.personaTipoIdentificacion);
    agregarLinea("Número identificación titular", limpio.personaNumeroIdentificacion);
    agregarLinea("Dirección titular", limpio.personaDireccion);
    agregarLinea(
      "País nacionalidad titular",
      resolverValorPais(limpio, "personaPaisNacionalidad")
    );
    agregarLinea(
      "País residencia titular",
      resolverValorPais(limpio, "personaPaisResidencia")
    );
    agregarLinea("Teléfono titular", limpio.personaTelefono);
    agregarLinea("Información adicional titular", limpio.personaInformacionAdicional);
  }

  if (limpio.tipoTitular === "Empresa") {
    agregarLinea("Empresa", limpio.empresaNombre);
    agregarLinea("Identificación empresa", limpio.empresaIdentificacion);
    agregarLinea(
      "País constitución empresa",
      resolverValorPais(limpio, "empresaPaisConstitucion")
    );
    agregarLinea("Domicilio social", limpio.empresaDomicilioSocial);
    agregarLinea("Representante", limpio.representanteNombre);
    agregarLinea("Estado civil representante", limpio.representanteEstadoCivil);
    agregarLinea("Profesión representante", limpio.representanteProfesion);
    agregarLinea(
      "Tipo identificación representante",
      limpio.representanteTipoIdentificacion
    );
    agregarLinea(
      "Número identificación representante",
      limpio.representanteNumeroIdentificacion
    );
    agregarLinea(
      "País nacionalidad representante",
      resolverValorPais(limpio, "representantePaisNacionalidad")
    );
    agregarLinea(
      "País residencia representante",
      resolverValorPais(limpio, "representantePaisResidencia")
    );
    agregarLinea("Dirección representante", limpio.representanteDireccion);
    agregarLinea("Teléfono representante", limpio.representanteTelefono);
    agregarLinea("Información adicional empresa", limpio.empresaInformacionAdicional);
  }

  agregarLinea("Solicitante", limpio.nombreCompleto);
  agregarLinea("Teléfono solicitante", limpio.telefono);

  const indicoAdjunto = payload?.logoArchivo || payload?.tieneLogo || false;
  /*agregarLinea("Adjuntó logo", indicoAdjunto ? "Sí" : filesLengthFromPayload(payload) ? "Sí" : ""); */

  return `
    <h2>Solicitud de Registro de Marca</h2>
    ${bloques.join("")}
  `;
}

function filesLengthFromPayload(payload) {
  if (!payload) return 0;
  if (Array.isArray(payload.files)) return payload.files.length;
  return 0;
}

/* =======================================================
   1. AGENDA CITA - CORREO INTERNO
======================================================= */
async function enviarAgendaCitaInterna({ destinatarios, data }) {
  const html = `
    <h2>Nueva cita agendada</h2>
    <p><strong>Nombre:</strong> ${data.ac_nombre}</p>
    <p><strong>Correo:</strong> ${data.ac_correo}</p>
    <p><strong>Teléfono:</strong> ${data.ac_telefono}</p>
    <p><strong>Fecha:</strong> ${data.ac_fecha_cita}</p>
    <p><strong>Hora:</strong> ${data.ac_hora_cita}</p>
    <p><strong>Motivo:</strong> ${data.ac_motivo_cita}</p>
  `;

  return enviarCorreo({
    to: Array.isArray(destinatarios) ? destinatarios.join(",") : destinatarios,
    subject: `Nueva cita - ${data.ac_nombre}`,
    html,
  });
}

/* =======================================================
   2. AGENDA CITA - CONFIRMACIÓN USUARIO
======================================================= */
async function enviarConfirmacionAgendaUsuario({
  correoUsuario,
  nombreCompleto,
  fechaCita,
  horaCita,
  asuntoConsulta,
}) {
  const html = `
    <h2>Hemos recibido tu solicitud de cita</h2>
    <p>Hola ${nombreCompleto},</p>
    <p>Tu solicitud de cita fue registrada correctamente.</p>
    <p><strong>Fecha:</strong> ${fechaCita}</p>
    <p><strong>Hora:</strong> ${horaCita}</p>
    <p><strong>Asunto:</strong> ${asuntoConsulta}</p>
    <p>Nos pondremos en contacto contigo pronto.</p>
    <br/>
    <p>Saludos,<br/>REVERA</p>
  `;

  return enviarCorreo({
    to: correoUsuario,
    subject: `Confirmación de cita – ${fechaCita} ${horaCita}`,
    html,
  });
}

/* =======================================================
   3. ESTUDIO DE REGISTRABILIDAD
======================================================= */
async function enviarEstudioRegistrabilidad({
  destinatarios,
  nombreCompleto,
  correo,
  telefono,
  nombreMarca,
  descripcionProductoServicio,
  sectorClase,
  files = [],
}) {
  const html = `
    <h2>Solicitud de Estudio de Registrabilidad</h2>
    <p><strong>Nombre completo:</strong> ${nombreCompleto}</p>
    <p><strong>Correo electrónico:</strong> ${correo}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
    <p><strong>Nombre de la marca:</strong> ${nombreMarca}</p>
    <p><strong>Descripción del producto o servicio:</strong> ${descripcionProductoServicio}</p>
    <p><strong>Sector o clase:</strong> ${sectorClase || "No indicado"}</p>
    <p><strong>Adjuntó imágenes:</strong> ${files.length > 0 ? "Sí" : "No"}</p>
  `;

  const attachments = files.map((file) => ({
    filename: file.originalname,
    path: file.path,
    contentType: file.mimetype,
  }));

  return enviarCorreo({
    to: Array.isArray(destinatarios) ? destinatarios.join(",") : destinatarios,
    subject: `Solicitud de Estudio de Registrabilidad – ${nombreCompleto}`,
    html,
    attachments,
  });
}

/* =======================================================
   4. REGISTRO DE MARCA - CORREO INTERNO
======================================================= */
async function enviarSolicitudRegistroMarca({ destinatarios, payload, files = [] }) {
  const html = construirHtmlRegistroMarca(payload);

  const attachments = files.map((file) => ({
    filename: file.originalname,
    path: file.path,
    contentType: file.mimetype,
  }));

  return enviarCorreo({
    to: Array.isArray(destinatarios) ? destinatarios.join(",") : destinatarios,
    subject: `Solicitud de Registro de Marca – ${payload.nombreCompleto || "Solicitante"}`,
    html,
    attachments,
  });
}

/* =======================================================
   5. REGISTRO DE MARCA - CONFIRMACIÓN USUARIO
======================================================= */
async function enviarConfirmacionRegistroMarcaUsuario({
  correoUsuario,
  nombreCompleto,
  nombreMarca,
}) {
  const html = `
    <h2>Hemos recibido tu solicitud</h2>
    <p>Hola ${nombreCompleto},</p>
    <p>Tu solicitud de registro de marca para <strong>${nombreMarca}</strong> fue recibida correctamente.</p>
    <p>Revisaremos la información y nos pondremos en contacto contigo pronto.</p>
    <br/>
    <p>Saludos,<br/>REVERA</p>
  `;

  return enviarCorreo({
    to: correoUsuario,
    subject: `Confirmación de solicitud de Registro de Marca – ${nombreMarca}`,
    html,
  });
}

module.exports = {
  enviarAgendaCitaInterna,
  enviarConfirmacionAgendaUsuario,
  enviarEstudioRegistrabilidad,
  enviarSolicitudRegistroMarca,
  enviarConfirmacionRegistroMarcaUsuario,
};