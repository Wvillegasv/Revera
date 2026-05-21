export function obtenerPasoPorId(flow, id) {
  return flow.find((paso) => paso.id === id);
}

export function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validarTelefonoSeparado(valor) {
  if (!valor) {
    return "";
  }

  const codigoPais = String(valor.codigoPais || "").trim();
  const numero = String(valor.numero || "").trim();

  if (!codigoPais && !numero) {
    return "";
  }

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
    return "El código de país debe tener entre 1 y 4 dígitos. Ejemplo: 506";
  }

  if (codigoPais === "506" && numero.length !== 8) {
    return "Para Costa Rica, el número debe tener 8 dígitos. Ejemplo: 88887777";
  }

  if (numero.length < 6) {
    return "El número de teléfono parece incompleto.";
  }

  return "";
}

export function validarRespuesta(paso, valor) {
  if (paso.type === "phone") {
    return validarTelefonoSeparado(valor);
  }

  if (!paso.required) {
    return "";
  }

  if (paso.type === "file") {
    if (!valor) {
      return "Este archivo es obligatorio para continuar.";
    }

    return "";
  }

  if (!valor || String(valor).trim() === "") {
    return "Esta pregunta es obligatoria.";
  }

  if (paso.type === "email" && !validarEmail(valor)) {
    return "El correo no parece válido. Por favor revísalo.";
  }

  return "";
}

export function obtenerSiguientePaso(paso, valor) {
  if (paso.type === "options") {
    const opcion = paso.options.find((item) => item.value === valor);

    if (opcion?.next) {
      return opcion.next;
    }
  }

  return paso.next;
}

export function formatearNombreArchivo(file) {
  if (!file) {
    return "";
  }

  return file.name || "Archivo adjunto";
}

export function formatearTelefono(valor) {
  if (!valor) {
    return "No indicado";
  }

  const codigoPais = String(valor.codigoPais || "").trim();
  const numero = String(valor.numero || "").trim();

  if (!codigoPais && !numero) {
    return "No indicado";
  }

  return `${codigoPais} ${numero}`.trim();
}