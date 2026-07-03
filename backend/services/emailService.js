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
    const valorLimpio = String(valor ?? "").trim();

    if (!valorLimpio) return;

    bloques.push(`<p><strong>${etiqueta}:</strong> ${valorLimpio}</p>`);
  }

  agregarLinea("Correo", limpio.correo);
  agregarLinea("Marca o nombre comercial", limpio.nombreMarca);
  agregarLinea("Tipo de trámite", limpio.tipoTramite);

  if (limpio.tipoTramite === "Marca") {
    agregarLinea("Tipo de marca", limpio.tipoMarca);
    agregarLinea("Qué desea registrar", limpio.queDeseaRegistrar);
    agregarLinea("Productos o servicios", limpio.productosServiciosTipo);
    agregarLinea("Detalle", limpio.detalleProductosServicios);
    agregarLinea("Clase Niza", limpio.claseNiza);
    agregarLinea(
      "País de origen",
      resolverValorPais(limpio, "paisOrigen")
    );
    agregarLinea(
      "Dirección del establecimiento",
      limpio.direccionEstablecimiento
    );
    agregarLinea(
      "Información adicional",
      limpio.informacionAdicional
    );
    agregarLinea(
      "Registro previo en otro país",
      limpio.registroPrevioOtroPais
    );
  }

  if (limpio.tipoTramite === "Nombre Comercial") {
    agregarLinea("Giro o actividad", limpio.giroActividad);
    agregarLinea("Qué desea registrar", limpio.queDeseaRegistrar);
    agregarLinea("Productos o servicios", limpio.productosServiciosTipo);
    agregarLinea("Detalle", limpio.detalleProductosServicios);
    agregarLinea(
      "País de origen",
      resolverValorPais(limpio, "paisOrigen")
    );
    agregarLinea(
      "Dirección del establecimiento",
      limpio.direccionEstablecimiento
    );
    agregarLinea(
      "Información adicional",
      limpio.informacionAdicional
    );
    agregarLinea(
      "Registro previo en otro país",
      limpio.registroPrevioOtroPais
    );
  }

  agregarLinea("Titular", limpio.tipoTitular);

  if (limpio.tipoTitular === "Persona") {
    agregarLinea("Nombre titular", limpio.personaNombre);
    agregarLinea(
      "Estado civil titular",
      limpio.personaEstadoCivil
    );
    agregarLinea("Profesión titular", limpio.personaProfesion);
    agregarLinea(
      "Tipo identificación titular",
      limpio.personaTipoIdentificacion
    );
    agregarLinea(
      "Número identificación titular",
      limpio.personaNumeroIdentificacion
    );
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
    agregarLinea(
      "Información adicional titular",
      limpio.personaInformacionAdicional
    );
  }

  if (limpio.tipoTitular === "Empresa") {
    agregarLinea("Empresa", limpio.empresaNombre);
    agregarLinea(
      "Identificación empresa",
      limpio.empresaIdentificacion
    );
    agregarLinea(
      "País constitución empresa",
      resolverValorPais(limpio, "empresaPaisConstitucion")
    );
    agregarLinea(
      "Domicilio social",
      limpio.empresaDomicilioSocial
    );
    agregarLinea(
      "Representante",
      limpio.representanteNombre
    );
    agregarLinea(
      "Estado civil representante",
      limpio.representanteEstadoCivil
    );
    agregarLinea(
      "Profesión representante",
      limpio.representanteProfesion
    );
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
    agregarLinea(
      "Dirección representante",
      limpio.representanteDireccion
    );
    agregarLinea(
      "Teléfono representante",
      limpio.representanteTelefono
    );
    agregarLinea(
      "Información adicional empresa",
      limpio.empresaInformacionAdicional
    );
  }

  agregarLinea("Solicitante", limpio.nombreCompleto);
  agregarLinea("Teléfono solicitante", limpio.telefono);

  return `
    <h2>Solicitud de Registro de Marca</h2>
    ${bloques.join("")}
  `;
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
    to: Array.isArray(destinatarios)
      ? destinatarios.join(",")
      : destinatarios,
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
    <br />
    <p>Saludos,<br />REVERA</p>
  `;

  return enviarCorreo({
    to: correoUsuario,
    subject: `Confirmación de cita – ${fechaCita} ${horaCita}`,
    html,
  });
}

/* =======================================================
   3. RADIOGRAFÍA DE MARCA - CORREO ABOGADOS
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
  const attachments = files.map((file) => ({
    filename: file.originalname,
    path: file.path,
    contentType: file.mimetype,
  }));

  const html = `
    <p><strong>ATENCIÓN! Métase en la vara!</strong></p>

    <p>
      Tenemos una solicitud de Radiografía de Marca y tenemos que entrarle ya mismo.
    </p>

    <p>
      <strong>Seguir Protocolo Atención Radiografía de Marca.</strong>
    </p>

    <p>Muchas gracias.</p>

    <hr />

    <h3>Datos de la solicitud</h3>
    <p><strong>Nombre completo:</strong> ${nombreCompleto}</p>
    <p><strong>Correo electrónico:</strong> ${correo}</p>
    <p><strong>Teléfono:</strong> ${telefono}</p>
    <p><strong>Nombre de la marca:</strong> ${nombreMarca}</p>
    <p>
      <strong>Descripción del producto o servicio:</strong>
      ${descripcionProductoServicio}
    </p>
    <p>
      <strong>Sector o clase:</strong>
      ${sectorClase || "No indicado"}
    </p>
    <p>
      <strong>Adjuntó imágenes:</strong>
      ${files.length > 0 ? "Sí" : "No"}
    </p>
  `;

  return enviarCorreo({
    to: Array.isArray(destinatarios)
      ? destinatarios.join(",")
      : destinatarios,
    subject: "CALLESE LOS OJOS! UNA NUEVA SOLICITUD RADIOGRAFÍA DE MARCA",
    html,
    attachments,
  });
}

/* =======================================================
   4. RADIOGRAFÍA DE MARCA - CONFIRMACIÓN CLIENTE
======================================================= */
async function enviarConfirmacionRadiografiaMarcaUsuario({
  correoUsuario,
}) {
  const html = `
    <p>Hola,</p>

    <p>
      ¡Gracias por completar el formulario de Radiografía de Marca!
    </p>

    <p>
      Ya recibimos tu solicitud y la información inicial sobre tu marca.
      Nuestro equipo estará revisando los datos para poder iniciar el análisis
      correspondiente.
    </p>

    <p>
      La Radiografía de Marca es un servicio diseñado para ayudarte a entender
      mejor el punto de partida de tu marca antes de registrarla. Con este
      análisis revisamos aspectos clave como la categoría o clase aplicable,
      posibles riesgos iniciales y elementos que conviene tomar en cuenta antes
      de avanzar con una solicitud de registro.
    </p>

    <p>
      Para que podamos activar el servicio e iniciar formalmente la revisión,
      es necesario completar el pago correspondiente:
    </p>

    <p>
      <strong>Radiografía de Marca:</strong> ₡50.000 + IVA
    </p>

    <p>
      En breve te estaremos enviando las instrucciones de pago y, una vez
      confirmado, continuaremos con el análisis de tu solicitud.
    </p>

    <p>
      Nuestro objetivo es que tengas mayor claridad antes de tomar decisiones
      sobre tu marca, con un proceso ágil, transparente y acompañado de
      principio a fin.
    </p>

    <p>
      Si tienes alguna duda mientras avanzamos, puedes responder directamente
      a este correo y con gusto te ayudamos.
    </p>

    <p>
      Saludos,<br />
      <strong>Equipo Revera</strong>
    </p>
  `;

  return enviarCorreo({
    to: correoUsuario,
    subject: "Recibimos tu solicitud de Radiografía de Marca",
    html,
  });
}

/* =======================================================
   5. REGISTRO ESTRATÉGICO DE MARCA - CORREO ABOGADOS
======================================================= */
async function enviarSolicitudRegistroMarca({
  destinatarios,
  payload,
  files = [],
}) {
  const attachments = files.map((file) => ({
    filename: file.originalname,
    path: file.path,
    contentType: file.mimetype,
  }));

  const html = `
    <p><strong>ATENCIÓN! Métase en la vara!</strong></p>

    <p>
      Tenemos una solicitud de Registro Estratégico de Marca y tenemos que
      entrarle ya mismo.
    </p>

    <p>
      <strong>Seguir Protocolo Atención Registro Estratégico de Marca.</strong>
    </p>

    <p>Muchas gracias.</p>
  `;

  return enviarCorreo({
    to: Array.isArray(destinatarios)
      ? destinatarios.join(",")
      : destinatarios,
    subject: "NOOOOOO! UN NUEVO Registro Estratégico de Marca",
    html,
    attachments,
  });
}

/* =======================================================
   6. REGISTRO ESTRATÉGICO DE MARCA - CONFIRMACIÓN CLIENTE
======================================================= */
async function enviarConfirmacionRegistroMarcaUsuario({
  correoUsuario,
  nombreCompleto,
}) {
  const html = `
    <p>Hola${nombreCompleto ? ` ${nombreCompleto}` : ""},</p>

    <p>
      ¡Gracias por completar el formulario de Registro Estratégico de Marca!
    </p>

    <p>
      Ya recibimos la información inicial sobre tu marca y estaremos revisando
      los datos para preparar los siguientes pasos del proceso.
    </p>

    <p>
      El Registro Estratégico de Marca es nuestro servicio diseñado para
      acompañarte en la preparación y gestión de la solicitud de registro de tu
      marca. La idea es que el trámite avance de forma clara, ordenada y
      estratégica, cuidando aspectos importantes como la clasificación correcta,
      la descripción de productos o servicios y la presentación adecuada de la
      solicitud ante el Registro.
    </p>

    <p>
      Para activar el servicio e iniciar formalmente la gestión, es necesario
      completar el pago correspondiente:
    </p>

    <p>
      <strong>Registro Estratégico de Marca:</strong> ₡100.000 + IVA<br />
      <strong>Gastos del proceso:</strong> ₡50.000
    </p>

    <p>
      En breve te estaremos enviando las instrucciones de pago. Una vez
      confirmado, continuaremos con la revisión de la información y la
      preparación de la solicitud.
    </p>

    <p>
      Nuestro objetivo es que tengas un proceso ágil, transparente y acompañado,
      con claridad sobre cada etapa y sobre lo que va ocurriendo con tu marca.
    </p>

    <p>
      Si tienes alguna duda mientras avanzamos, puedes responder directamente
      a este correo y con gusto te ayudamos.
    </p>

    <p>
      Saludos,<br />
      <strong>Equipo Revera</strong>
    </p>
  `;

  return enviarCorreo({
    to: correoUsuario,
    subject: "Recibimos tu solicitud de Registro Estratégico de Marca",
    html,
  });
}

module.exports = {
  enviarAgendaCitaInterna,
  enviarConfirmacionAgendaUsuario,
  enviarEstudioRegistrabilidad,
  enviarConfirmacionRadiografiaMarcaUsuario,
  enviarSolicitudRegistroMarca,
  enviarConfirmacionRegistroMarcaUsuario,
};