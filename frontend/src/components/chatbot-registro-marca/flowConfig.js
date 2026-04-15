export const OPCIONES_TIPO_TRAMITE = ["Marca", "Nombre Comercial"];

export const OPCIONES_TIPO_MARCA = [
  "Marca de comercio",
  "Marca de fábrica",
  "Marca de fábrica y comercio",
  "Marca de fábrica y servicios",
  "Marca de servicios",
];

export const OPCIONES_QUE_REGISTRA = ["Nombre", "Logo", "Nombre + Logo"];

export const OPCIONES_PRODUCTO_SERVICIO = [
  "Productos",
  "Servicios",
  "Productos y servicios",
];

export const OPCIONES_PAISES = [
  "Costa Rica",
  "Estados Unidos",
  "México",
  "Colombia",
  "Argentina",
  "Brasil",
  "Canadá",
  "El Salvador",
  "Guatemala",
  "Honduras",
  "Nicaragua",
  "Panamá",
  "Otro",
];

export const OPCIONES_TITULAR = ["Persona", "Empresa"];

export const OPCIONES_ESTADO_CIVIL = [
  "Casado/Casada",
  "Soltero/Soltera",
  "Divorciado/Divorciada",
  "Viudo/Viuda",
];

export const OPCIONES_TIPO_IDENTIFICACION = [
  "Cédula física",
  "Cédula de residencia",
  "Pasaporte",
  "Carné de refugiado",
];

export const OPCIONES_CLASES_NIZA = [
  ...Array.from({ length: 45 }, (_, i) => `Clase ${i + 1}`),
  "No sé",
];

export const INITIAL_FORM = {
  correo: "",
  nombreMarca: "",
  tipoTramite: "",

  tipoMarca: "",
  queDeseaRegistrar: "",
  logoArchivo: null,
  productosServiciosTipo: "",
  detalleProductosServicios: "",
  claseNiza: "",
  paisOrigen: "",
  paisOrigenOtro: "",
  direccionEstablecimiento: "",
  informacionAdicional: "",
  registroPrevioOtroPais: "",

  giroActividad: "",

  tipoTitular: "",

  personaNombre: "",
  personaEstadoCivil: "",
  personaProfesion: "",
  personaTipoIdentificacion: "",
  personaNumeroIdentificacion: "",
  personaDireccion: "",
  personaPaisNacionalidad: "",
  personaPaisNacionalidadOtro: "",
  personaPaisResidencia: "",
  personaPaisResidenciaOtro: "",
  personaTelefono: "",
  personaInformacionAdicional: "",

  empresaNombre: "",
  empresaIdentificacion: "",
  empresaPaisConstitucion: "",
  empresaPaisConstitucionOtro: "",
  empresaDomicilioSocial: "",
  representanteNombre: "",
  representanteEstadoCivil: "",
  representanteProfesion: "",
  representanteTipoIdentificacion: "",
  representanteNumeroIdentificacion: "",
  representantePaisNacionalidad: "",
  representantePaisNacionalidadOtro: "",
  representantePaisResidencia: "",
  representantePaisResidenciaOtro: "",
  representanteDireccion: "",
  representanteTelefono: "",
  empresaInformacionAdicional: "",

  nombreCompleto: "",
  telefono: "",
};

export function buildBaseSteps(validators) {
  return [
    {
      key: "correo",
      type: "text",
      question:
        "¡Hola! ¡Te damos la bienvenida a Revera! Ayúdanos con esta información para inscribir tu marca o nombre comercial. Primero, indícanos tu correo electrónico.",
      placeholder: "Escribe tu correo electrónico",
      validate: validators.validateCorreo,
    },
    {
      key: "nombreMarca",
      type: "text",
      question:
        "Necesitamos conocer los detalles de tu marca o nombre comercial. ¿Cuál es tu marca o nombre comercial?",
      placeholder: "Escribe tu marca o nombre comercial",
      validate: (value) =>
        validators.validateTexto(
          value,
          2,
          "Debes indicar tu marca o nombre comercial."
        ),
    },
    {
      key: "tipoTramite",
      type: "options",
      question: "¿Qué tipo de signo quieres registrar?",
      options: OPCIONES_TIPO_TRAMITE,
      validate: validators.validateRequiredOption,
    },
  ];
}

export function buildMarcaSteps(validators) {
  return [
    {
      key: "tipoMarca",
      type: "options",
      question:
        "¿Qué tipo de marca quieres registrar? Si no sabes la respuesta, no pasa nada, nosotros lo definimos.",
      options: OPCIONES_TIPO_MARCA,
      validate: validators.validateRequiredOption,
    },
    {
      key: "queDeseaRegistrar",
      type: "options",
      question: "¿Qué quieres registrar?",
      options: OPCIONES_QUE_REGISTRA,
      validate: validators.validateRequiredOption,
    },
    {
      key: "logoArchivo",
      type: "file",
      question:
        "Si quieres registrar un logo adjúntalo aquí. El archivo puede ser JPG, JPEG, BMP, PNG, WEBP o PDF. Si no deseas adjuntar, puedes continuar.",
      accept: ".jpg,.jpeg,.bmp,.png,.webp,.pdf",
      validate: () => "",
    },
    {
      key: "productosServiciosTipo",
      type: "options",
      question: "¿De qué es tu marca?",
      options: OPCIONES_PRODUCTO_SERVICIO,
      validate: validators.validateRequiredOption,
    },
    {
      key: "detalleProductosServicios",
      type: "textarea",
      question:
        "Cuéntanos con detalle los productos, servicios o productos y servicios que se venden bajo tu marca. No te guardes nada.",
      placeholder: "Describe con detalle",
      validate: (value) =>
        validators.validateTexto(
          value,
          10,
          "Brinda más detalle sobre los productos o servicios."
        ),
    },
    {
      key: "claseNiza",
      type: "options",
      question:
        "Si sabes en cuál Clase de Niza quieres registrar tu marca, selecciónala. Si no sabes, puedes elegir 'No sé'.",
      options: OPCIONES_CLASES_NIZA,
      validate: validators.validateRequiredOption,
    },
    {
      key: "paisOrigen",
      type: "options",
      question: "¿Cuál es el país de origen de tu marca?",
      options: OPCIONES_PAISES,
      validate: validators.validateRequiredOption,
    },
    {
      key: "direccionEstablecimiento",
      type: "textarea",
      question:
        "Dinos con detalle la dirección del establecimiento comercial donde se brindan los productos y/o servicios bajo tu marca. Si no tienes establecimiento comercial, puedes indicar tu dirección exacta.",
      placeholder: "Dirección exacta",
      validate: (value) =>
        validators.validateTexto(
          value,
          10,
          "Indica la dirección exacta del establecimiento o tu dirección."
        ),
    },
    {
      key: "informacionAdicional",
      type: "textarea",
      question: "¿Quieres contarnos algo más sobre tu marca? El micrófono es tuyo.",
      placeholder: "Información adicional",
      validate: () => "",
    },
    {
      key: "registroPrevioOtroPais",
      type: "options",
      question:
        "¿Has registrado tu marca en otro país durante los seis meses anteriores?",
      options: ["Sí", "No"],
      validate: validators.validateRequiredOption,
    },
    {
      key: "tipoTitular",
      type: "options",
      question: "¿A nombre de quién quieres registrar tu marca?",
      options: OPCIONES_TITULAR,
      validate: validators.validateRequiredOption,
    },
  ];
}

export function buildNombreComercialSteps(validators) {
  return [
    {
      key: "giroActividad",
      type: "text",
      question:
        "¿Cuál es el giro o actividad de tu negocio o establecimiento comercial?",
      placeholder: "Giro o actividad",
      validate: (value) =>
        validators.validateTexto(value, 3, "Indica el giro o actividad."),
    },
    {
      key: "productosServiciosTipo",
      type: "options",
      question: "¿De qué es tu negocio?",
      options: OPCIONES_PRODUCTO_SERVICIO,
      validate: validators.validateRequiredOption,
    },
    {
      key: "detalleProductosServicios",
      type: "textarea",
      question:
        "Cuéntanos con detalle los productos, servicios o productos y servicios que se brindan en tu negocio. No te guardes nada.",
      placeholder: "Describe con detalle",
      validate: (value) =>
        validators.validateTexto(value, 10, "Brinda más detalle sobre tu negocio."),
    },
    {
      key: "queDeseaRegistrar",
      type: "options",
      question: "¿Qué quieres registrar?",
      options: OPCIONES_QUE_REGISTRA,
      validate: validators.validateRequiredOption,
    },
    {
      key: "logoArchivo",
      type: "file",
      question:
        "Si quieres registrar un logo adjúntalo aquí. El archivo puede ser JPG, JPEG, BMP, PNG, WEBP o PDF. Si no deseas adjuntar, puedes continuar.",
      accept: ".jpg,.jpeg,.bmp,.png,.webp,.pdf",
      validate: () => "",
    },
    {
      key: "paisOrigen",
      type: "options",
      question: "¿Cuál es el país de origen de tu nombre comercial?",
      options: OPCIONES_PAISES,
      validate: validators.validateRequiredOption,
    },
    {
      key: "direccionEstablecimiento",
      type: "textarea",
      question:
        "Dinos con detalle la dirección exacta del establecimiento comercial donde se brindan los productos y/o servicios.",
      placeholder: "Dirección exacta",
      validate: (value) =>
        validators.validateTexto(
          value,
          10,
          "Indica la dirección exacta del establecimiento."
        ),
    },
    {
      key: "informacionAdicional",
      type: "textarea",
      question:
        "¿Quieres contarnos algo más sobre tu nombre comercial o tu negocio? El micrófono es tuyo.",
      placeholder: "Información adicional",
      validate: () => "",
    },
    {
      key: "registroPrevioOtroPais",
      type: "options",
      question:
        "¿Has registrado tu nombre comercial en otro país durante los seis meses anteriores?",
      options: ["Sí", "No"],
      validate: validators.validateRequiredOption,
    },
    {
      key: "tipoTitular",
      type: "options",
      question: "¿A nombre de quién quieres registrar tu nombre comercial?",
      options: OPCIONES_TITULAR,
      validate: validators.validateRequiredOption,
    },
  ];
}

export function buildPersonaSteps(validators) {
  return [
    {
      key: "personaNombre",
      type: "text",
      question:
        "¡Ya casi terminamos! Ahora cuéntanos sobre la persona dueña de la marca o nombre comercial. ¿Quién será la persona dueña? Incluye todos los nombres y apellidos.",
      placeholder: "Nombre completo",
      validate: (value) =>
        validators.validateTexto(value, 8, "Ingresa el nombre completo del titular."),
    },
    {
      key: "personaEstadoCivil",
      type: "options",
      question: "Estado civil",
      options: OPCIONES_ESTADO_CIVIL,
      validate: validators.validateRequiredOption,
    },
    {
      key: "personaProfesion",
      type: "text",
      question: "Profesión/Ocupación",
      placeholder: "Profesión u ocupación",
      validate: (value) =>
        validators.validateTexto(value, 3, "Ingresa la profesión u ocupación."),
    },
    {
      key: "personaTipoIdentificacion",
      type: "options",
      question: "Tipo de identificación",
      options: OPCIONES_TIPO_IDENTIFICACION,
      validate: validators.validateRequiredOption,
    },
    {
      key: "personaNumeroIdentificacion",
      type: "text",
      question: "Número de identificación",
      placeholder: "Número de identificación",
      validate: (value) =>
        validators.validateTexto(
          value,
          5,
          "Ingresa un número de identificación válido."
        ),
    },
    {
      key: "personaDireccion",
      type: "textarea",
      question: "Dirección exacta",
      placeholder: "Dirección exacta",
      validate: (value) =>
        validators.validateTexto(
          value,
          10,
          "Ingresa la dirección exacta del titular."
        ),
    },
    {
      key: "personaPaisNacionalidad",
      type: "options",
      question: "País de nacionalidad",
      options: OPCIONES_PAISES,
      validate: validators.validateRequiredOption,
    },
    {
      key: "personaPaisResidencia",
      type: "options",
      question: "País de residencia",
      options: OPCIONES_PAISES,
      validate: validators.validateRequiredOption,
    },
    {
      key: "personaTelefono",
      type: "text",
      question: "Número de teléfono del titular (con código de país)",
      placeholder: "Ejemplo: 506 88887777",
      validate: validators.validateTelefono,
    },
    {
      key: "personaInformacionAdicional",
      type: "textarea",
      question:
        "¿Quieres contarnos algo más sobre la persona dueña de la marca o nombre comercial? El micrófono es tuyo.",
      placeholder: "Información adicional",
      validate: () => "",
    },
  ];
}

export function buildEmpresaSteps(validators) {
  return [
    {
      key: "empresaNombre",
      type: "text",
      question:
        "¡Ya casi terminamos! Ahora cuéntanos sobre la empresa dueña de la marca o nombre comercial. ¿Cuál es el nombre completo de la empresa? Incluye S.A., S.R.L. y cualquier otra terminación.",
      placeholder: "Nombre de la empresa",
      validate: (value) =>
        validators.validateTexto(value, 3, "Ingresa el nombre de la empresa."),
    },
    {
      key: "empresaIdentificacion",
      type: "text",
      question: "¿Cuál es el número de identificación de la empresa?",
      placeholder: "Número de identificación",
      validate: (value) =>
        validators.validateTexto(
          value,
          5,
          "Ingresa la identificación de la empresa."
        ),
    },
    {
      key: "empresaPaisConstitucion",
      type: "options",
      question: "¿En cuál país se constituyó la empresa?",
      options: OPCIONES_PAISES,
      validate: validators.validateRequiredOption,
    },
    {
      key: "empresaDomicilioSocial",
      type: "textarea",
      question: "¿Cuál es la dirección exacta del domicilio social de la empresa?",
      placeholder: "Domicilio social",
      validate: (value) =>
        validators.validateTexto(value, 10, "Ingresa el domicilio social."),
    },
    {
      key: "representanteNombre",
      type: "text",
      question:
        "¿Cuál es el nombre completo del representante legal o apoderado de la empresa? Incluye todos los nombres y apellidos.",
      placeholder: "Nombre completo del representante",
      validate: (value) =>
        validators.validateTexto(
          value,
          8,
          "Ingresa el nombre completo del representante."
        ),
    },
    {
      key: "representanteEstadoCivil",
      type: "options",
      question: "Estado civil del representante legal o apoderado",
      options: OPCIONES_ESTADO_CIVIL,
      validate: validators.validateRequiredOption,
    },
    {
      key: "representanteProfesion",
      type: "text",
      question: "Profesión/Ocupación del representante legal o apoderado",
      placeholder: "Profesión u ocupación",
      validate: (value) =>
        validators.validateTexto(
          value,
          3,
          "Ingresa la profesión u ocupación."
        ),
    },
    {
      key: "representanteTipoIdentificacion",
      type: "options",
      question: "Tipo de identificación del representante legal o apoderado",
      options: OPCIONES_TIPO_IDENTIFICACION,
      validate: validators.validateRequiredOption,
    },
    {
      key: "representanteNumeroIdentificacion",
      type: "text",
      question: "Número de identificación del representante legal o apoderado",
      placeholder: "Número de identificación",
      validate: (value) =>
        validators.validateTexto(
          value,
          5,
          "Ingresa el número de identificación del representante."
        ),
    },
    {
      key: "representantePaisNacionalidad",
      type: "options",
      question: "País de nacionalidad del representante legal o apoderado",
      options: OPCIONES_PAISES,
      validate: validators.validateRequiredOption,
    },
    {
      key: "representantePaisResidencia",
      type: "options",
      question: "País de residencia del representante legal o apoderado",
      options: OPCIONES_PAISES,
      validate: validators.validateRequiredOption,
    },
    {
      key: "representanteDireccion",
      type: "textarea",
      question: "Dirección exacta del representante legal o apoderado",
      placeholder: "Dirección exacta",
      validate: (value) =>
        validators.validateTexto(
          value,
          10,
          "Ingresa la dirección del representante."
        ),
    },
    {
      key: "representanteTelefono",
      type: "text",
      question:
        "Número de teléfono del representante legal o apoderado (con código de país)",
      placeholder: "Ejemplo: 506 88887777",
      validate: validators.validateTelefono,
    },
    {
      key: "empresaInformacionAdicional",
      type: "textarea",
      question:
        "¿Quieres contarnos algo más sobre la empresa dueña de la marca o nombre comercial? El micrófono es tuyo.",
      placeholder: "Información adicional",
      validate: () => "",
    },
  ];
}

export function buildContactoFinalSteps(validators) {
  return [
    {
      key: "nombreCompleto",
      type: "text",
      question:
        "Ahora cuéntanos tus datos para contactarte. ¿Cuál es tu nombre completo?",
      placeholder: "Nombre y apellidos",
      validate: (value) =>
        validators.validateTexto(value, 8, "Ingresa tu nombre completo."),
    },
    {
      key: "telefono",
      type: "text",
      question: "¿Cuál es tu número de teléfono? (Con código de país)",
      placeholder: "Ejemplo: 506 88887777",
      validate: validators.validateTelefono,
    },
    {
      key: "__confirmacion__",
      type: "confirmation",
      question: "Revisemos la información antes de enviarla.",
      validate: () => "",
    },
  ];
}

export function insertarPasosOtroPais(steps, formData, validators) {
  const resultado = [];

  const mapaOtroPais = {
    paisOrigen: {
      extraKey: "paisOrigenOtro",
      question: "Indica el nombre del otro país de origen.",
      placeholder: "Escribe el país",
    },
    personaPaisNacionalidad: {
      extraKey: "personaPaisNacionalidadOtro",
      question: "Indica el otro país de nacionalidad.",
      placeholder: "Escribe el país",
    },
    personaPaisResidencia: {
      extraKey: "personaPaisResidenciaOtro",
      question: "Indica el otro país de residencia.",
      placeholder: "Escribe el país",
    },
    empresaPaisConstitucion: {
      extraKey: "empresaPaisConstitucionOtro",
      question: "Indica el otro país de constitución de la empresa.",
      placeholder: "Escribe el país",
    },
    representantePaisNacionalidad: {
      extraKey: "representantePaisNacionalidadOtro",
      question: "Indica el otro país de nacionalidad del representante.",
      placeholder: "Escribe el país",
    },
    representantePaisResidencia: {
      extraKey: "representantePaisResidenciaOtro",
      question: "Indica el otro país de residencia del representante.",
      placeholder: "Escribe el país",
    },
  };

  steps.forEach((step) => {
    resultado.push(step);

    const config = mapaOtroPais[step.key];
    if (!config) return;

    if (formData[step.key] === "Otro") {
      resultado.push({
        key: config.extraKey,
        type: "text",
        question: config.question,
        placeholder: config.placeholder,
        validate: (value) =>
          validators.validateTexto(value, 2, "Debes indicar el nombre del país."),
      });
    }
  });

  return resultado;
}
