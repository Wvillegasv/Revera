export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function hasMinLength(value, min) {
  return String(value || "").trim().length >= min;
}

export function validateRequiredOption(value) {
  if (!value) return "Selecciona una opción.";
  return "";
}

export function validateCorreo(value) {
  if (!hasMinLength(value, 5)) return "El correo electrónico es obligatorio.";
  if (!isValidEmail(value)) return "Ingresa un correo electrónico válido.";
  return "";
}

export function validateTelefono(value) {
  if (!value) {
    return "Debe indicar el código de país y el número de teléfono.";
  }

  if (typeof value === "string") {
    const limpio = value.trim();

    if (!/^\d+$/.test(limpio)) {
      return "El teléfono debe contener solo números.";
    }

    if (limpio.startsWith("506") && limpio.length === 11) {
      return "";
    }

    return "Use el formato código país + número. Ejemplo: 50688887777";
  }

  const codigoPais = String(value.codigoPais || "").trim();
  const numero = String(value.numero || "").trim();

  if (!codigoPais || !numero) {
    return "Debe indicar el código de país y el número de teléfono.";
  }

  if (!/^\d+$/.test(codigoPais)) {
    return "El código de país debe contener solo números. Ejemplo: 506";
  }

  if (!/^\d+$/.test(numero)) {
    return "El número de teléfono debe contener solo números. Ejemplo: 88887777";
  }

  if (codigoPais.length < 1 || codigoPais.length > 4) {
    return "El código de país debe tener entre 1 y 4 dígitos.";
  }

  if (codigoPais === "506" && numero.length !== 8) {
    return "Para Costa Rica, el número debe tener 8 dígitos. Ejemplo: 88887777";
  }

  if (numero.length < 6) {
    return "El número de teléfono parece incompleto.";
  }

  return "";
}

export function validateTexto(value, min, message) {
  if (!hasMinLength(value, min)) return message;
  return "";
}

export function resolverValorPais(valor, valorOtro) {
  if (valor === "Otro") return valorOtro || "";
  return valor || "";
}

export function formatearTelefonoSeparado(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  const codigoPais = String(value.codigoPais || "").trim();
  const numero = String(value.numero || "").trim();

  if (!codigoPais && !numero) return "";

  return `${codigoPais}${numero}`;
}

export function formatearTelefonoVisual(value) {
  if (!value) return "";

  if (typeof value === "string") {
    if (!value.trim()) return "";

    if (value.startsWith("506") && value.length === 11) {
      return `+506 ${value.substring(3)}`;
    }

    return value;
  }

  const codigoPais = String(value.codigoPais || "").trim();
  const numero = String(value.numero || "").trim();

  if (!codigoPais && !numero) return "";

  return `+${codigoPais} ${numero}`;
}

function agregarLinea(lineas, etiqueta, valor) {
  const limpio = String(valor ?? "").trim();
  if (!limpio) return;
  lineas.push(`${etiqueta}: ${limpio}`);
}

function agregarItemSeguro(items, etiqueta, valor) {
  const limpio = String(valor ?? "").trim();
  if (!limpio) return;
  items.push({ etiqueta, valor: limpio });
}

export function buildResumen(data) {
  const lineas = [];

  agregarLinea(lineas, "Correo", data.correo);
  agregarLinea(lineas, "Marca o nombre comercial", data.nombreMarca);
  agregarLinea(lineas, "Tipo de trámite", data.tipoTramite);

  if (data.tipoTramite === "Marca") {
    agregarLinea(lineas, "Tipo de marca", data.tipoMarca);
    agregarLinea(lineas, "Qué desea registrar", data.queDeseaRegistrar);
    agregarLinea(lineas, "Productos/servicios", data.productosServiciosTipo);
    agregarLinea(lineas, "Detalle", data.detalleProductosServicios);
    agregarLinea(lineas, "Clase Niza", data.claseNiza);
    agregarLinea(
      lineas,
      "País de origen",
      resolverValorPais(data.paisOrigen, data.paisOrigenOtro)
    );
    agregarLinea(lineas, "Dirección", data.direccionEstablecimiento);
    agregarLinea(lineas, "Registro previo en otro país", data.registroPrevioOtroPais);
    agregarLinea(lineas, "Información adicional", data.informacionAdicional);
  }

  if (data.tipoTramite === "Nombre Comercial") {
    agregarLinea(lineas, "Giro o actividad", data.giroActividad);
    agregarLinea(lineas, "Qué desea registrar", data.queDeseaRegistrar);
    agregarLinea(lineas, "Productos/servicios", data.productosServiciosTipo);
    agregarLinea(lineas, "Detalle", data.detalleProductosServicios);
    agregarLinea(
      lineas,
      "País de origen",
      resolverValorPais(data.paisOrigen, data.paisOrigenOtro)
    );
    agregarLinea(lineas, "Dirección", data.direccionEstablecimiento);
    agregarLinea(lineas, "Registro previo en otro país", data.registroPrevioOtroPais);
    agregarLinea(lineas, "Información adicional", data.informacionAdicional);
  }

  agregarLinea(lineas, "Titular", data.tipoTitular);

  if (data.tipoTitular === "Persona") {
    agregarLinea(lineas, "Nombre titular", data.personaNombre);
    agregarLinea(lineas, "Estado civil titular", data.personaEstadoCivil);
    agregarLinea(lineas, "Profesión titular", data.personaProfesion);
    agregarLinea(lineas, "Tipo identificación titular", data.personaTipoIdentificacion);
    agregarLinea(lineas, "Número identificación titular", data.personaNumeroIdentificacion);
    agregarLinea(lineas, "Dirección titular", data.personaDireccion);
    agregarLinea(
      lineas,
      "País nacionalidad titular",
      resolverValorPais(
        data.personaPaisNacionalidad,
        data.personaPaisNacionalidadOtro
      )
    );
    agregarLinea(
      lineas,
      "País residencia titular",
      resolverValorPais(
        data.personaPaisResidencia,
        data.personaPaisResidenciaOtro
      )
    );
    agregarLinea(
      lineas,
      "Teléfono titular",
      data.personaTelefonoCodigoPais && data.personaTelefonoNumero
        ? `+${data.personaTelefonoCodigoPais} ${data.personaTelefonoNumero}`
        : data.personaTelefono
    );
    agregarLinea(lineas, "Información adicional titular", data.personaInformacionAdicional);
  }

  if (data.tipoTitular === "Empresa") {
    agregarLinea(lineas, "Empresa", data.empresaNombre);
    agregarLinea(lineas, "Identificación empresa", data.empresaIdentificacion);
    agregarLinea(
      lineas,
      "País constitución empresa",
      resolverValorPais(
        data.empresaPaisConstitucion,
        data.empresaPaisConstitucionOtro
      )
    );
    agregarLinea(lineas, "Domicilio social", data.empresaDomicilioSocial);
    agregarLinea(lineas, "Representante", data.representanteNombre);
    agregarLinea(lineas, "Estado civil representante", data.representanteEstadoCivil);
    agregarLinea(lineas, "Profesión representante", data.representanteProfesion);
    agregarLinea(
      lineas,
      "Tipo identificación representante",
      data.representanteTipoIdentificacion
    );
    agregarLinea(
      lineas,
      "Número identificación representante",
      data.representanteNumeroIdentificacion
    );
    agregarLinea(
      lineas,
      "País nacionalidad representante",
      resolverValorPais(
        data.representantePaisNacionalidad,
        data.representantePaisNacionalidadOtro
      )
    );
    agregarLinea(
      lineas,
      "País residencia representante",
      resolverValorPais(
        data.representantePaisResidencia,
        data.representantePaisResidenciaOtro
      )
    );
    agregarLinea(lineas, "Dirección representante", data.representanteDireccion);
    agregarLinea(
      lineas,
      "Teléfono representante",
      data.representanteTelefonoCodigoPais && data.representanteTelefonoNumero
        ? `+${data.representanteTelefonoCodigoPais} ${data.representanteTelefonoNumero}`
        : data.representanteTelefono
    );
    agregarLinea(lineas, "Información adicional empresa", data.empresaInformacionAdicional);
  }

  agregarLinea(lineas, "Solicitante", data.nombreCompleto);
  agregarLinea(
    lineas,
    "Teléfono solicitante",
    data.telefonoCodigoPais && data.telefonoNumero
      ? `+${data.telefonoCodigoPais} ${data.telefonoNumero}`
      : data.telefono
  );

  if (data.logoArchivo?.name) {
    lineas.push(`Logo adjunto: ${data.logoArchivo.name}`);
  }

  return lineas.join("\n");
}

export function buildRequestFormData(payload) {
  const form = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;

    if (key === "logoArchivo") {
      if (value) {
        form.append("logoArchivo", value);
      }
      return;
    }

    form.append(key, value);
  });

  return form;
}

export function buildResumenItems(data) {
  const items = [];

  agregarItemSeguro(items, "Correo", data.correo);
  agregarItemSeguro(items, "Marca o nombre comercial", data.nombreMarca);
  agregarItemSeguro(items, "Tipo de trámite", data.tipoTramite);

  if (data.tipoTramite === "Marca") {
    agregarItemSeguro(items, "Tipo de marca", data.tipoMarca);
    agregarItemSeguro(items, "Qué desea registrar", data.queDeseaRegistrar);
    agregarItemSeguro(items, "Productos/servicios", data.productosServiciosTipo);
    agregarItemSeguro(items, "Detalle", data.detalleProductosServicios);
    agregarItemSeguro(items, "Clase Niza", data.claseNiza);
    agregarItemSeguro(
      items,
      "País de origen",
      resolverValorPais(data.paisOrigen, data.paisOrigenOtro)
    );
    agregarItemSeguro(items, "Dirección", data.direccionEstablecimiento);
    agregarItemSeguro(items, "Registro previo en otro país", data.registroPrevioOtroPais);
    agregarItemSeguro(items, "Información adicional", data.informacionAdicional);
  }

  if (data.tipoTramite === "Nombre Comercial") {
    agregarItemSeguro(items, "Giro o actividad", data.giroActividad);
    agregarItemSeguro(items, "Qué desea registrar", data.queDeseaRegistrar);
    agregarItemSeguro(items, "Productos/servicios", data.productosServiciosTipo);
    agregarItemSeguro(items, "Detalle", data.detalleProductosServicios);
    agregarItemSeguro(
      items,
      "País de origen",
      resolverValorPais(data.paisOrigen, data.paisOrigenOtro)
    );
    agregarItemSeguro(items, "Dirección", data.direccionEstablecimiento);
    agregarItemSeguro(items, "Registro previo en otro país", data.registroPrevioOtroPais);
    agregarItemSeguro(items, "Información adicional", data.informacionAdicional);
  }

  agregarItemSeguro(items, "Titular", data.tipoTitular);

  if (data.tipoTitular === "Persona") {
    agregarItemSeguro(items, "Nombre titular", data.personaNombre);
    agregarItemSeguro(items, "Estado civil titular", data.personaEstadoCivil);
    agregarItemSeguro(items, "Profesión titular", data.personaProfesion);
    agregarItemSeguro(items, "Tipo identificación titular", data.personaTipoIdentificacion);
    agregarItemSeguro(items, "Número identificación titular", data.personaNumeroIdentificacion);
    agregarItemSeguro(items, "Dirección titular", data.personaDireccion);
    agregarItemSeguro(
      items,
      "País nacionalidad titular",
      resolverValorPais(
        data.personaPaisNacionalidad,
        data.personaPaisNacionalidadOtro
      )
    );
    agregarItemSeguro(
      items,
      "País residencia titular",
      resolverValorPais(
        data.personaPaisResidencia,
        data.personaPaisResidenciaOtro
      )
    );
    agregarItemSeguro(
      items,
      "Teléfono titular",
      data.personaTelefonoCodigoPais && data.personaTelefonoNumero
        ? `+${data.personaTelefonoCodigoPais} ${data.personaTelefonoNumero}`
        : data.personaTelefono
    );
    agregarItemSeguro(items, "Información adicional titular", data.personaInformacionAdicional);
  }

  if (data.tipoTitular === "Empresa") {
    agregarItemSeguro(items, "Empresa", data.empresaNombre);
    agregarItemSeguro(items, "Identificación empresa", data.empresaIdentificacion);
    agregarItemSeguro(
      items,
      "País constitución empresa",
      resolverValorPais(
        data.empresaPaisConstitucion,
        data.empresaPaisConstitucionOtro
      )
    );
    agregarItemSeguro(items, "Domicilio social", data.empresaDomicilioSocial);
    agregarItemSeguro(items, "Representante", data.representanteNombre);
    agregarItemSeguro(items, "Estado civil representante", data.representanteEstadoCivil);
    agregarItemSeguro(items, "Profesión representante", data.representanteProfesion);
    agregarItemSeguro(
      items,
      "Tipo identificación representante",
      data.representanteTipoIdentificacion
    );
    agregarItemSeguro(
      items,
      "Número identificación representante",
      data.representanteNumeroIdentificacion
    );
    agregarItemSeguro(
      items,
      "País nacionalidad representante",
      resolverValorPais(
        data.representantePaisNacionalidad,
        data.representantePaisNacionalidadOtro
      )
    );
    agregarItemSeguro(
      items,
      "País residencia representante",
      resolverValorPais(
        data.representantePaisResidencia,
        data.representantePaisResidenciaOtro
      )
    );
    agregarItemSeguro(items, "Dirección representante", data.representanteDireccion);
    agregarItemSeguro(
      items,
      "Teléfono representante",
      data.representanteTelefonoCodigoPais && data.representanteTelefonoNumero
        ? `+${data.representanteTelefonoCodigoPais} ${data.representanteTelefonoNumero}`
        : data.representanteTelefono
    );
    agregarItemSeguro(items, "Información adicional empresa", data.empresaInformacionAdicional);
  }

  agregarItemSeguro(items, "Solicitante", data.nombreCompleto);
  agregarItemSeguro(
    items,
    "Teléfono solicitante",
    data.telefonoCodigoPais && data.telefonoNumero
      ? `+${data.telefonoCodigoPais} ${data.telefonoNumero}`
      : data.telefono
  );

  if (data.logoArchivo?.name) {
    items.push({
      etiqueta: "Logo adjunto",
      valor: data.logoArchivo.name,
    });
  }

  return items;
}