export const OPCIONES_TIPO_TRAMITE = ["Marca", "Nombre Comercial"];

export const OPCIONES_TIPO_MARCA = [
  "Marca de comercio",
  "Marca de fábrica",
  "Marca de fábrica y comercio",
  "Marca de fábrica y servicios",
  "Marca de servicios",
  "No sé",
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
  ...Array.from({ length: 45 }, (_, index) => `Clase ${index + 1}`),
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
  claseNiza: [],
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
  personaTelefonoCodigoPais: "506",
  personaTelefonoNumero: "",

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
  representanteTelefonoCodigoPais: "506",
  representanteTelefonoNumero: "",
  empresaInformacionAdicional: "",

  nombreCompleto: "",
  telefono: "",
  telefonoCodigoPais: "506",
  telefonoNumero: "",
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
      links: [
        {
          text: "Diferencias entre tipos de marca y nombres comerciales en Costa Rica",
          href: "/guia/diferencias-marca-nombre-comercial-costa-rica",
        },
      ],
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
      links: [
        {
          text: "Diferencias entre tipos de marca y nombres comerciales en Costa Rica",
          href: "/guia/diferencias-marca-nombre-comercial-costa-rica",
        },
      ],
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
      links: [
        {
          text: "Diferencias entre tipos de marca y nombres comerciales en Costa Rica",
          href: "/guia/diferencias-marca-nombre-comercial-costa-rica",
        },
      ],
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
        "Cuéntanos con detalle los productos, servicios o productos y servicios que se venden bajo tu marca.",
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
      type: "multi-options",
      question:
        "Si sabes en cuál Clase de Niza quieres registrar tu marca, selecciónala. Si no sabes, puedes elegir 'No sé'.",
      links: [
        {
          text: "¿Cómo clasificar un producto según Niza?",
          href: "/guia/como-clasificar-un-producto-segun-niza",
        },
      ],
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
      question: "¿Quieres contarnos algo más sobre tu marca?",
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
        "Cuéntanos con detalle los productos, servicios o productos y servicios que se brindan en tu negocio.",
      placeholder: "Describe con detalle",
      validate: (value) =>
        validators.validateTexto(
          value,
          10,
          "Brinda más detalle sobre tu negocio."
        ),
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
        "¿Quieres contarnos algo más sobre tu nombre comercial o tu negocio?",
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
        validators.validateTexto(
          value,
          8,
          "Ingresa el nombre completo del titular."
        ),
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
      question: "Dirección exacta del dueño de la marca",
      placeholder: "Dirección exacta del dueño de la marca",
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
      type: "phone",
      question: "Número de teléfono del titular",
      placeholderCodigoPais: "506",
      placeholderNumero: "88887777",
      phoneKeys: {
        codigoPais: "personaTelefonoCodigoPais",
        numero: "personaTelefonoNumero",
        completo: "personaTelefono",
      },
      validate: validators.validateTelefono,
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
        validators.validateTexto(
          value,
          10,
          "Ingresa el domicilio social de la empresa."
        ),
    },
    {
      key: "representanteNombre",
      type: "text",
      question:
        "Indica el nombre completo del representante legal de la empresa.",
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
      question: "Estado civil del representante",
      options: OPCIONES_ESTADO_CIVIL,
      validate: validators.validateRequiredOption,
    },
    {
      key: "representanteProfesion",
      type: "text",
      question: "Profesión/Ocupación del representante",
      placeholder: "Profesión u ocupación",
      validate: (value) =>
        validators.validateTexto(
          value,
          3,
          "Ingresa la profesión u ocupación del representante."
        ),
    },
    {
      key: "representanteTipoIdentificacion",
      type: "options",
      question: "Tipo de identificación del representante",
      options: OPCIONES_TIPO_IDENTIFICACION,
      validate: validators.validateRequiredOption,
    },
    {
      key: "representanteNumeroIdentificacion",
      type: "text",
      question: "Número de identificación del representante",
      placeholder: "Número de identificación",
      validate: (value) =>
        validators.validateTexto(
          value,
          5,
          "Ingresa un número de identificación válido."
        ),
    },
    {
      key: "representantePaisNacionalidad",
      type: "options",
      question: "País de nacionalidad del representante",
      options: OPCIONES_PAISES,
      validate: validators.validateRequiredOption,
    },
    {
      key: "representantePaisResidencia",
      type: "options",
      question: "País de residencia del representante",
      options: OPCIONES_PAISES,
      validate: validators.validateRequiredOption,
    },
    {
      key: "representanteDireccion",
      type: "textarea",
      question: "Dirección exacta del representante",
      placeholder: "Dirección exacta",
      validate: (value) =>
        validators.validateTexto(
          value,
          10,
          "Ingresa la dirección exacta del representante."
        ),
    },
    {
      key: "representanteTelefono",
      type: "phone",
      question: "Número de teléfono del representante",
      placeholderCodigoPais: "506",
      placeholderNumero: "88887777",
      phoneKeys: {
        codigoPais: "representanteTelefonoCodigoPais",
        numero: "representanteTelefonoNumero",
        completo: "representanteTelefono",
      },
      validate: validators.validateTelefono,
    },
    {
      key: "empresaInformacionAdicional",
      type: "textarea",
      question: "¿Quieres contarnos algo más sobre la empresa dueña de la marca o nombre comercial?",
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
      question: "Finalmente, indícanos tu nombre completo para contactarte.",
      placeholder: "Nombre completo",
      validate: (value) =>
        validators.validateTexto(value, 8, "Ingresa tu nombre completo."),
    },
    {
      key: "telefono",
      type: "phone",
      question: "¿Cuál es tu número de teléfono?",
      placeholderCodigoPais: "506",
      placeholderNumero: "88887777",
      phoneKeys: {
        codigoPais: "telefonoCodigoPais",
        numero: "telefonoNumero",
        completo: "telefono",
      },
      validate: validators.validateTelefono,
    },
  ];
}

function crearPasoOtroPais(baseKey, question, placeholder, validators) {
  return {
    key: `${baseKey}Otro`,
    type: "text",
    question,
    placeholder,
    validate: (value) =>
      validators.validateTexto(value, 2, "Indica el país correspondiente."),
  };
}

export function insertarPasosOtroPais(flujoBase, formData, validators) {
  const resultado = [];

  flujoBase.forEach((step) => {
    resultado.push(step);

    if (step.key === "paisOrigen" && formData.paisOrigen === "Otro") {
      resultado.push(
        crearPasoOtroPais(
          "paisOrigen",
          "Indica el país de origen.",
          "País de origen",
          validators
        )
      );
    }

    if (
      step.key === "personaPaisNacionalidad" &&
      formData.personaPaisNacionalidad === "Otro"
    ) {
      resultado.push(
        crearPasoOtroPais(
          "personaPaisNacionalidad",
          "Indica el país de nacionalidad del titular.",
          "País de nacionalidad",
          validators
        )
      );
    }

    if (
      step.key === "personaPaisResidencia" &&
      formData.personaPaisResidencia === "Otro"
    ) {
      resultado.push(
        crearPasoOtroPais(
          "personaPaisResidencia",
          "Indica el país de residencia del titular.",
          "País de residencia",
          validators
        )
      );
    }

    if (
      step.key === "empresaPaisConstitucion" &&
      formData.empresaPaisConstitucion === "Otro"
    ) {
      resultado.push(
        crearPasoOtroPais(
          "empresaPaisConstitucion",
          "Indica el país de constitución de la empresa.",
          "País de constitución",
          validators
        )
      );
    }

    if (
      step.key === "representantePaisNacionalidad" &&
      formData.representantePaisNacionalidad === "Otro"
    ) {
      resultado.push(
        crearPasoOtroPais(
          "representantePaisNacionalidad",
          "Indica el país de nacionalidad del representante.",
          "País de nacionalidad",
          validators
        )
      );
    }

    if (
      step.key === "representantePaisResidencia" &&
      formData.representantePaisResidencia === "Otro"
    ) {
      resultado.push(
        crearPasoOtroPais(
          "representantePaisResidencia",
          "Indica el país de residencia del representante.",
          "País de residencia",
          validators
        )
      );
    }
  });

  return resultado;
}

