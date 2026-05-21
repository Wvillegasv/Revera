export const RADIOGRAFIA_INTRO = [
  "Vamos a hacer una radiografía de tu marca 🔍",
  "Antes de registrarla o empezar a usarla, es importante saber si tu marca puede darte problemas.",
  "En este análisis revisamos si ya existe algo parecido, si hay riesgo de conflicto y en qué categoría deberías registrarla para protegerla bien.",
  "Te haré unas preguntas rápidas y con eso podremos evaluar qué tan viable es tu marca.",
];

export const RADIOGRAFIA_FLOW = [
  {
    id: "nombreMarca",
    label: "¿Cómo se llama tu marca?",
    type: "text",
    required: true,
    placeholder: "Ejemplo: REVERA",
    next: "estadoUso",
  },
  {
    id: "estadoUso",
    label: "¿Este nombre ya lo estás usando o es solo una idea?",
    type: "options",
    required: true,
    options: [
      {
        label: "Ya la estoy usando",
        value: "Ya la estoy usando",
      },
      {
        label: "Es una idea, aún no la he lanzado",
        value: "Es una idea, aún no la he lanzado",
      },
      {
        label: "Prefiero no contestar",
        value: "Prefiero no contestar",
      },
    ],
    next: "tipoProductoServicio",
  },
  {
    id: "tipoProductoServicio",
    label: "¿Qué tipo de producto o servicio quieres ofrecer con esta marca?",
    type: "textarea",
    required: true,
    placeholder: "Cuéntanos qué producto o servicio representa tu marca.",
    next: "fraseSimple",
  },
  {
    id: "fraseSimple",
    label: "Si tuvieras que explicarlo en una frase simple, ¿qué vendes?",
    type: "textarea",
    required: true,
    placeholder: "Ejemplo: Servicios legales para registrar marcas.",
    next: "alcanceUso",
  },
  {
    id: "alcanceUso",
    label: "¿Dónde planeas usar esta marca?",
    type: "options",
    required: true,
    options: [
      {
        label: "Solo en mi país",
        value: "Solo en mi país",
      },
      {
        label: "En varios países",
        value: "En varios países",
      },
      {
        label: "Online / internacional",
        value: "Online / internacional",
      },
      {
        label: "Otro",
        value: "Otro",
        next: "alcanceUsoOtro",
      },
    ],
    next: "marcasSimilares",
  },
  {
    id: "alcanceUsoOtro",
    label: "Indícanos dónde planeas usar esta marca.",
    type: "text",
    required: true,
    placeholder: "Describe el alcance de uso.",
    next: "marcasSimilares",
  },
  {
    id: "marcasSimilares",
    label: "¿Sabes si existen marcas similares o iguales?",
    type: "options",
    required: true,
    options: [
      {
        label: "No",
        value: "No",
        next: "diferenciador",
      },
      {
        label: "Sí",
        value: "Sí",
        next: "cualesMarcasSimilares",
      },
      {
        label: "No estoy seguro",
        value: "No estoy seguro",
        next: "diferenciador",
      },
    ],
  },
  {
    id: "cualesMarcasSimilares",
    label: "¿Cuáles? Si puedes, compártelas.",
    type: "textarea",
    required: true,
    placeholder: "Escribe los nombres o referencias que conoces.",
    next: "diferenciador",
  },
  {
    id: "diferenciador",
    label: "¿Qué hace diferente a tu marca de otras similares?",
    type: "textarea",
    required: true,
    placeholder: "Cuéntanos qué la hace distinta.",
    next: "tipoMarcaVisual",
  },
  {
    id: "tipoMarcaVisual",
    label: "¿Tu marca es solo el nombre o incluye un logo/diseño?",
    type: "options",
    required: true,
    options: [
      {
        label: "Solo nombre",
        value: "Solo nombre",
        next: "haVendido",
      },
      {
        label: "También logo/diseño",
        value: "También logo/diseño",
        next: "archivoLogo",
      },
      {
        label: "No estoy seguro aún",
        value: "No estoy seguro aún",
        next: "haVendido",
      },
    ],
  },
  {
    id: "archivoLogo",
    label: "Puedes subir aquí el logo o diseño de tu marca.",
    type: "file",
    required: true,
    accept: ".jpg,.jpeg,.png,.webp",
    next: "haVendido",
  },
  {
    id: "haVendido",
    label: "¿Ya has vendido productos o servicios con esta marca?",
    type: "options",
    required: true,
    options: [
      {
        label: "Sí",
        value: "Sí",
        next: "desdeCuando",
      },
      {
        label: "No",
        value: "No",
        next: "preguntaClave",
      },
      {
        label: "Prefiero no contestar",
        value: "Prefiero no contestar",
        next: "preguntaClave",
      },
    ],
  },
  {
    id: "desdeCuando",
    label: "¿Desde cuándo la estás usando?",
    type: "text",
    required: true,
    placeholder: "Ejemplo: 7 de enero del 2019",
    next: "preguntaClave",
  },

    {
    id: "preguntaClave",
    label:
        "Si pudieras tener una respuesta clara sobre tu marca ahora mismo, ¿qué te gustaría saber?",
    type: "textarea",
    required: true,
    placeholder: "Cuéntanos y lo incluiremos en tu radiografía.",
    next: "nombreCompletoContacto",
    },
    {
    id: "nombreCompletoContacto",
    sectionTitle: "Déjanos saber tus datos para contactarte",
    label: "¿Cuál es tu nombre completo?",
    type: "text",
    required: true,
    placeholder: "Escribe tu nombre completo",
    next: "correoContacto",
    },
    {
    id: "correoContacto",
    label: "¿A qué correo electrónico te podemos contactar?",
    type: "email",
    required: true,
    placeholder: "correo@ejemplo.com",
    next: "telefonoContacto",
    },
  {
    id: "telefonoContacto",
    label: "¿A qué número de teléfono te podemos contactar?",
    type: "phone",
    required: false,
    placeholderCodigoPais: "506",
    placeholderNumero: "88887777",
    next: "resumen",
  },

];