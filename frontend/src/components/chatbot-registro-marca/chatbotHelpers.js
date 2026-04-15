export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function isValidPhone(value) {
  return /^[0-9+\-\s()]{8,30}$/.test(String(value || "").trim());
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
  if (!hasMinLength(value, 8)) return "El teléfono es obligatorio.";
  if (!isValidPhone(value)) return "Ingresa un número de teléfono válido.";
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

function agregarLinea(lineas, etiqueta, valor) {
  const limpio = String(valor ?? "").trim();
  if (!limpio) return;
  lineas.push(`${etiqueta}: ${limpio}`);
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
    agregarLinea(lineas, "Teléfono titular", data.personaTelefono);
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
    agregarLinea(lineas, "Teléfono representante", data.representanteTelefono);
    agregarLinea(lineas, "Información adicional empresa", data.empresaInformacionAdicional);
  }

  agregarLinea(lineas, "Solicitante", data.nombreCompleto);
  agregarLinea(lineas, "Teléfono solicitante", data.telefono);

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

  function agregarItem(etiqueta, valor) {
    const limpio = String(valor ?? "").trim();
    if (!limpio) return;
    items.push({ etiqueta, valor: limpio });
  }

  agregarItem("Correo", data.correo);
  agregarItem("Marca o nombre comercial", data.nombreMarca);
  agregarItem("Tipo de trámite", data.tipoTramite);

  if (data.tipoTramite === "Marca") {
    agregarItem("Tipo de marca", data.tipoMarca);
    agregarItem("Qué desea registrar", data.queDeseaRegistrar);
    agregarItem("Productos/servicios", data.productosServiciosTipo);
    agregarItem("Detalle", data.detalleProductosServicios);
    agregarItem("Clase Niza", data.claseNiza);
    agregarItem(
      "País de origen",
      resolverValorPais(data.paisOrigen, data.paisOrigenOtro)
    );
    agregarItem("Dirección", data.direccionEstablecimiento);
    agregarItem("Registro previo en otro país", data.registroPrevioOtroPais);
    agregarItem("Información adicional", data.informacionAdicional);
  }

  if (data.tipoTramite === "Nombre Comercial") {
    agregarItem("Giro o actividad", data.giroActividad);
    agregarItem("Qué desea registrar", data.queDeseaRegistrar);
    agregarItem("Productos/servicios", data.productosServiciosTipo);
    agregarItem("Detalle", data.detalleProductosServicios);
    agregarItem(
      "País de origen",
      resolverValorPais(data.paisOrigen, data.paisOrigenOtro)
    );
    agregarItem("Dirección", data.direccionEstablecimiento);
    agregarItem("Registro previo en otro país", data.registroPrevioOtroPais);
    agregarItem("Información adicional", data.informacionAdicional);
  }

  agregarItem("Titular", data.tipoTitular);

  if (data.tipoTitular === "Persona") {
    agregarItem("Nombre titular", data.personaNombre);
    agregarItem("Estado civil titular", data.personaEstadoCivil);
    agregarItem("Profesión titular", data.personaProfesion);
    agregarItem("Tipo identificación titular", data.personaTipoIdentificacion);
    agregarItem("Número identificación titular", data.personaNumeroIdentificacion);
    agregarItem("Dirección titular", data.personaDireccion);
    agregarItem(
      "País nacionalidad titular",
      resolverValorPais(
        data.personaPaisNacionalidad,
        data.personaPaisNacionalidadOtro
      )
    );
    agregarItem(
      "País residencia titular",
      resolverValorPais(
        data.personaPaisResidencia,
        data.personaPaisResidenciaOtro
      )
    );
    agregarItem("Teléfono titular", data.personaTelefono);
    agregarItem("Información adicional titular", data.personaInformacionAdicional);
  }

  if (data.tipoTitular === "Empresa") {
    agregarItem("Empresa", data.empresaNombre);
    agregarItem("Identificación empresa", data.empresaIdentificacion);
    agregarItem(
      "País constitución empresa",
      resolverValorPais(
        data.empresaPaisConstitucion,
        data.empresaPaisConstitucionOtro
      )
    );
    agregarItem("Domicilio social", data.empresaDomicilioSocial);
    agregarItem("Representante", data.representanteNombre);
    agregarItem("Estado civil representante", data.representanteEstadoCivil);
    agregarItem("Profesión representante", data.representanteProfesion);
    agregarItem(
      "Tipo identificación representante",
      data.representanteTipoIdentificacion
    );
    agregarItem(
      "Número identificación representante",
      data.representanteNumeroIdentificacion
    );
    agregarItem(
      "País nacionalidad representante",
      resolverValorPais(
        data.representantePaisNacionalidad,
        data.representantePaisNacionalidadOtro
      )
    );
    agregarItem(
      "País residencia representante",
      resolverValorPais(
        data.representantePaisResidencia,
        data.representantePaisResidenciaOtro
      )
    );
    agregarItem("Dirección representante", data.representanteDireccion);
    agregarItem("Teléfono representante", data.representanteTelefono);
    agregarItem("Información adicional empresa", data.empresaInformacionAdicional);
  }

  agregarItem("Solicitante", data.nombreCompleto);
  agregarItem("Teléfono solicitante", data.telefono);

  if (data.logoArchivo?.name) {
    agregarItem("Logo adjunto", data.logoArchivo.name);
  }

  return items;
}