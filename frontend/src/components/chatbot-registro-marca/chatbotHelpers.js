function limpiarTexto(valor) {
  return String(valor ?? "").trim();
}

function tieneValor(valor) {
  if (Array.isArray(valor)) {
    return valor.length > 0;
  }

  return limpiarTexto(valor) !== "";
}

export const LIMITES_REGISTRO_MARCA = {
  correo: {
    max: 200,
    mensajeMax: "El correo electrónico permite un máximo de 200 caracteres.",
  },
  nombreMarca: {
    min: 2,
    max: 255,
    mensajeMax: "La marca o nombre comercial permite un máximo de 255 caracteres.",
  },
  paisOrigenOtro: {
    min: 2,
    max: 100,
    mensajeMax: "El país de origen permite un máximo de 100 caracteres.",
  },
  giroActividad: {
    min: 3,
    max: 200,
    mensajeMax: "El giro o actividad permite un máximo de 200 caracteres.",
  },
  detalleProductosServicios: {
    min: 10,
    max: 2000,
    mensajeMax: "El detalle de productos o servicios permite un máximo de 2,000 caracteres.",
  },
  direccionEstablecimiento: {
    min: 10,
    max: 200,
    mensajeMax: "La dirección del establecimiento permite un máximo de 200 caracteres.",
  },
  informacionAdicional: {
    max: 1000,
    mensajeMax: "La información adicional permite un máximo de 1,000 caracteres.",
  },
  personaNombre: {
    min: 8,
    max: 160,
    mensajeMax: "El nombre completo del titular permite un máximo de 160 caracteres.",
  },
  personaProfesion: {
    min: 3,
    max: 100,
    mensajeMax: "La profesión u ocupación permite un máximo de 100 caracteres.",
  },
  personaNumeroIdentificacion: {
    min: 5,
    max: 30,
    mensajeMax: "El número de identificación permite un máximo de 30 caracteres.",
  },
  personaDireccion: {
    min: 10,
    max: 200,
    mensajeMax: "La dirección exacta del titular permite un máximo de 200 caracteres.",
  },
  personaPaisNacionalidadOtro: {
    min: 2,
    max: 100,
    mensajeMax: "El país de nacionalidad permite un máximo de 100 caracteres.",
  },
  personaPaisResidenciaOtro: {
    min: 2,
    max: 100,
    mensajeMax: "El país de residencia permite un máximo de 100 caracteres.",
  },
  empresaNombre: {
    min: 3,
    max: 100,
    mensajeMax: "El nombre de la empresa permite un máximo de 100 caracteres.",
  },
  empresaIdentificacion: {
    min: 5,
    max: 30,
    mensajeMax: "La identificación de la empresa permite un máximo de 30 caracteres.",
  },
  empresaPaisConstitucionOtro: {
    min: 2,
    max: 100,
    mensajeMax: "El país de constitución permite un máximo de 100 caracteres.",
  },
  empresaDomicilioSocial: {
    min: 10,
    max: 200,
    mensajeMax: "El domicilio social permite un máximo de 200 caracteres.",
  },
  representanteNombre: {
    min: 8,
    max: 160,
    mensajeMax: "El nombre completo del representante permite un máximo de 160 caracteres.",
  },
  representanteProfesion: {
    min: 3,
    max: 100,
    mensajeMax: "La profesión u ocupación del representante permite un máximo de 100 caracteres.",
  },
  representanteNumeroIdentificacion: {
    min: 5,
    max: 30,
    mensajeMax: "El número de identificación del representante permite un máximo de 30 caracteres.",
  },
  representantePaisNacionalidadOtro: {
    min: 2,
    max: 100,
    mensajeMax: "El país de nacionalidad del representante permite un máximo de 100 caracteres.",
  },
  representantePaisResidenciaOtro: {
    min: 2,
    max: 100,
    mensajeMax: "El país de residencia del representante permite un máximo de 100 caracteres.",
  },
  representanteDireccion: {
    min: 10,
    max: 200,
    mensajeMax: "La dirección exacta del representante permite un máximo de 200 caracteres.",
  },
  empresaInformacionAdicional: {
    max: 1000,
    mensajeMax: "La información adicional de la empresa permite un máximo de 1,000 caracteres.",
  },
  nombreCompleto: {
    min: 8,
    max: 160,
    mensajeMax: "El nombre de contacto permite un máximo de 160 caracteres.",
  },
};

export function obtenerMaxLengthCampo(key) {
  return LIMITES_REGISTRO_MARCA[key]?.max;
}

export function obtenerLimitesCampo(key) {
  const limites = LIMITES_REGISTRO_MARCA[key] || {};

  return {
    min: limites.min ?? null,
    max: limites.max ?? null,
  };
}

export function validateLongitudCampo(key, value) {
  const limite = LIMITES_REGISTRO_MARCA[key];

  if (!limite?.max) {
    return "";
  }

  const texto = limpiarTexto(value);

  if (!texto) {
    return "";
  }

  if (texto.length > limite.max) {
    return (
      limite.mensajeMax ||
      `Este campo permite un máximo de ${limite.max} caracteres.`
    );
  }

  return "";
}

export function validateRequiredOption(value) {
  return tieneValor(value) ? "" : "Selecciona una opción para continuar.";
}

export function validateCorreo(value) {
  const correo = limpiarTexto(value).toLowerCase();
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!correo) {
    return "Ingresa tu correo electrónico.";
  }

  if (correo.length > 200) {
    return "El correo electrónico permite un máximo de 200 caracteres.";
  }

  if (!patron.test(correo)) {
    return "El correo electrónico no parece válido. Revísalo e intenta de nuevo.";
  }

  return "";
}

export function validateTelefono(value) {
  const codigoPais = limpiarTexto(value?.codigoPais).replace(/\D/g, "");
  const numero = limpiarTexto(value?.numero).replace(/\D/g, "");

  if (!codigoPais || !numero) {
    return "Ingresa el código de país y el número de teléfono.";
  }

  if (codigoPais.length > 10) {
    return "El código de país permite un máximo de 10 dígitos.";
  }

  if (numero.length > 20) {
    return "El número de teléfono permite un máximo de 20 dígitos.";
  }

  if (codigoPais === "506" && numero.length !== 8) {
    return "Para Costa Rica, el número de teléfono debe tener 8 dígitos.";
  }

  if (numero.length < 6) {
    return "Ingresa un número de teléfono válido.";
  }

  return "";
}

export function validateTexto(
  value,
  minLength = 1,
  mensaje = "Completa este campo.",
  maxLength,
  mensajeMax
) {
  const texto = limpiarTexto(value);

  if (texto.length < minLength) {
    return mensaje;
  }

  if (maxLength && texto.length > maxLength) {
    return (
      mensajeMax ||
      `Este campo permite un máximo de ${maxLength} caracteres.`
    );
  }

  return "";
}

export function formatearTelefonoVisual({ codigoPais, numero } = {}) {
  const codigo = limpiarTexto(codigoPais);
  const telefono = limpiarTexto(numero);

  if (!codigo && !telefono) {
    return "No indicado";
  }

  if (!codigo) {
    return telefono;
  }

  if (!telefono) {
    return `+${codigo}`;
  }

  return `+${codigo} ${telefono}`;
}

function formatearValorResumen(valor) {
  if (Array.isArray(valor)) {
    return valor.length ? valor.join(", ") : "";
  }

  if (valor instanceof File) {
    return valor.name;
  }

  return limpiarTexto(valor);
}

function agregarResumen(items, key, etiqueta, valor) {
  const texto = formatearValorResumen(valor);

  if (!texto) {
    return;
  }

  items.push({ key, etiqueta, valor: texto });
}

function resolverPais(valor, valorOtro) {
  if (valor === "Otro") {
    return limpiarTexto(valorOtro) || "Otro";
  }

  return limpiarTexto(valor);
}

export function buildResumenItems(formData) {
  const items = [];

  agregarResumen(items, "correo", "Correo electrónico", formData.correo);
  agregarResumen(
    items,
    "nombreMarca",
    "Marca o nombre comercial",
    formData.nombreMarca
  );
  agregarResumen(items, "tipoTramite", "Tipo de trámite", formData.tipoTramite);

  if (formData.tipoTramite === "Marca") {
    agregarResumen(items, "tipoMarca", "Tipo de marca", formData.tipoMarca);
    agregarResumen(
      items,
      "queDeseaRegistrar",
      "Qué desea registrar",
      formData.queDeseaRegistrar
    );
    agregarResumen(
      items,
      "logoArchivo",
      "Archivo de logo",
      formData.logoArchivo?.name || ""
    );
    agregarResumen(
      items,
      "productosServiciosTipo",
      "Productos o servicios",
      formData.productosServiciosTipo
    );
    agregarResumen(
      items,
      "detalleProductosServicios",
      "Detalle de productos o servicios",
      formData.detalleProductosServicios
    );
    agregarResumen(items, "claseNiza", "Clases de Niza", formData.claseNiza);
    agregarResumen(
      items,
      "paisOrigen",
      "País de origen",
      resolverPais(formData.paisOrigen, formData.paisOrigenOtro)
    );
    if (formData.paisOrigen === "Otro") {
      agregarResumen(items, "paisOrigenOtro", "Otro país de origen", formData.paisOrigenOtro);
    }
    agregarResumen(
      items,
      "direccionEstablecimiento",
      "Dirección del establecimiento",
      formData.direccionEstablecimiento
    );
    agregarResumen(
      items,
      "informacionAdicional",
      "Información adicional sobre la marca",
      formData.informacionAdicional
    );
    agregarResumen(
      items,
      "registroPrevioOtroPais",
      "Registro previo en otro país",
      formData.registroPrevioOtroPais
    );
  }

  if (formData.tipoTramite === "Nombre Comercial") {
    agregarResumen(items, "giroActividad", "Giro o actividad", formData.giroActividad);
    agregarResumen(
      items,
      "productosServiciosTipo",
      "Productos o servicios",
      formData.productosServiciosTipo
    );
    agregarResumen(
      items,
      "detalleProductosServicios",
      "Detalle de productos o servicios",
      formData.detalleProductosServicios
    );
    agregarResumen(
      items,
      "queDeseaRegistrar",
      "Qué desea registrar",
      formData.queDeseaRegistrar
    );
    agregarResumen(
      items,
      "logoArchivo",
      "Archivo de logo",
      formData.logoArchivo?.name || ""
    );
    agregarResumen(
      items,
      "paisOrigen",
      "País de origen",
      resolverPais(formData.paisOrigen, formData.paisOrigenOtro)
    );
    if (formData.paisOrigen === "Otro") {
      agregarResumen(items, "paisOrigenOtro", "Otro país de origen", formData.paisOrigenOtro);
    }
    agregarResumen(
      items,
      "direccionEstablecimiento",
      "Dirección del establecimiento",
      formData.direccionEstablecimiento
    );
    agregarResumen(
      items,
      "informacionAdicional",
      "Información adicional sobre el negocio",
      formData.informacionAdicional
    );
    agregarResumen(
      items,
      "registroPrevioOtroPais",
      "Registro previo en otro país",
      formData.registroPrevioOtroPais
    );
  }

  agregarResumen(items, "tipoTitular", "Titular", formData.tipoTitular);

  if (formData.tipoTitular === "Persona") {
    agregarResumen(items, "personaNombre", "Nombre del titular", formData.personaNombre);
    agregarResumen(items, "personaEstadoCivil", "Estado civil", formData.personaEstadoCivil);
    agregarResumen(items, "personaProfesion", "Profesión u ocupación", formData.personaProfesion);
    agregarResumen(
      items,
      "personaTipoIdentificacion",
      "Tipo de identificación",
      formData.personaTipoIdentificacion
    );
    agregarResumen(
      items,
      "personaNumeroIdentificacion",
      "Número de identificación",
      formData.personaNumeroIdentificacion
    );
    agregarResumen(
      items,
      "personaDireccion",
      "Dirección exacta del dueño de la marca",
      formData.personaDireccion
    );
    agregarResumen(
      items,
      "personaPaisNacionalidad",
      "País de nacionalidad",
      resolverPais(
        formData.personaPaisNacionalidad,
        formData.personaPaisNacionalidadOtro
      )
    );
    if (formData.personaPaisNacionalidad === "Otro") {
      agregarResumen(
        items,
        "personaPaisNacionalidadOtro",
        "Otro país de nacionalidad",
        formData.personaPaisNacionalidadOtro
      );
    }
    agregarResumen(
      items,
      "personaPaisResidencia",
      "País de residencia",
      resolverPais(formData.personaPaisResidencia, formData.personaPaisResidenciaOtro)
    );
    if (formData.personaPaisResidencia === "Otro") {
      agregarResumen(
        items,
        "personaPaisResidenciaOtro",
        "Otro país de residencia",
        formData.personaPaisResidenciaOtro
      );
    }
    agregarResumen(
      items,
      "personaTelefono",
      "Teléfono del titular",
      formatearTelefonoVisual({
        codigoPais: formData.personaTelefonoCodigoPais,
        numero: formData.personaTelefonoNumero,
      })
    );
  }

  if (formData.tipoTitular === "Empresa") {
    agregarResumen(items, "empresaNombre", "Nombre de la empresa", formData.empresaNombre);
    agregarResumen(
      items,
      "empresaIdentificacion",
      "Identificación de la empresa",
      formData.empresaIdentificacion
    );
    agregarResumen(
      items,
      "empresaPaisConstitucion",
      "País de constitución",
      resolverPais(
        formData.empresaPaisConstitucion,
        formData.empresaPaisConstitucionOtro
      )
    );
    if (formData.empresaPaisConstitucion === "Otro") {
      agregarResumen(
        items,
        "empresaPaisConstitucionOtro",
        "Otro país de constitución",
        formData.empresaPaisConstitucionOtro
      );
    }
    agregarResumen(
      items,
      "empresaDomicilioSocial",
      "Domicilio social",
      formData.empresaDomicilioSocial
    );
    agregarResumen(
      items,
      "representanteNombre",
      "Nombre del representante",
      formData.representanteNombre
    );
    agregarResumen(
      items,
      "representanteEstadoCivil",
      "Estado civil del representante",
      formData.representanteEstadoCivil
    );
    agregarResumen(
      items,
      "representanteProfesion",
      "Profesión u ocupación del representante",
      formData.representanteProfesion
    );
    agregarResumen(
      items,
      "representanteTipoIdentificacion",
      "Tipo de identificación del representante",
      formData.representanteTipoIdentificacion
    );
    agregarResumen(
      items,
      "representanteNumeroIdentificacion",
      "Número de identificación del representante",
      formData.representanteNumeroIdentificacion
    );
    agregarResumen(
      items,
      "representantePaisNacionalidad",
      "País de nacionalidad del representante",
      resolverPais(
        formData.representantePaisNacionalidad,
        formData.representantePaisNacionalidadOtro
      )
    );
    if (formData.representantePaisNacionalidad === "Otro") {
      agregarResumen(
        items,
        "representantePaisNacionalidadOtro",
        "Otro país de nacionalidad del representante",
        formData.representantePaisNacionalidadOtro
      );
    }
    agregarResumen(
      items,
      "representantePaisResidencia",
      "País de residencia del representante",
      resolverPais(
        formData.representantePaisResidencia,
        formData.representantePaisResidenciaOtro
      )
    );
    if (formData.representantePaisResidencia === "Otro") {
      agregarResumen(
        items,
        "representantePaisResidenciaOtro",
        "Otro país de residencia del representante",
        formData.representantePaisResidenciaOtro
      );
    }
    agregarResumen(
      items,
      "representanteDireccion",
      "Dirección del representante",
      formData.representanteDireccion
    );
    agregarResumen(
      items,
      "representanteTelefono",
      "Teléfono del representante",
      formatearTelefonoVisual({
        codigoPais: formData.representanteTelefonoCodigoPais,
        numero: formData.representanteTelefonoNumero,
      })
    );
    agregarResumen(
      items,
      "empresaInformacionAdicional",
      "Información adicional de la empresa",
      formData.empresaInformacionAdicional
    );
  }

  agregarResumen(items, "nombreCompleto", "Nombre de contacto", formData.nombreCompleto);
  agregarResumen(
    items,
    "telefono",
    "Teléfono de contacto",
    formatearTelefonoVisual({
      codigoPais: formData.telefonoCodigoPais,
      numero: formData.telefonoNumero,
    })
  );

  return items;
}

export function buildRequestFormData(payload) {
  const form = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "logoArchivo" || value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      form.append(key, JSON.stringify(value));
      return;
    }

    form.append(key, String(value));
  });

  if (payload.logoArchivo instanceof File) {
    form.append("logoArchivo", payload.logoArchivo);
  }

  return form;
}
