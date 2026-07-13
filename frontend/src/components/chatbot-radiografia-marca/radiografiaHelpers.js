export const LIMITES_POR_PASO = {
  nombreMarca: {
    min: 2,
    max: 200,
    mensajeMin: "Escribe el nombre de la marca con al menos 2 caracteres.",
    mensajeMax: "El nombre de la marca permite un máximo de 200 caracteres.",
  },
  tipoProductoServicio: {
    min: 10,
    max: 500,
    mensajeMin:
      "Describe el producto o servicio con al menos 10 caracteres.",
    mensajeMax:
      "La descripción del producto o servicio permite un máximo de 500 caracteres.",
  },
  fraseSimple: {
    min: 10,
    max: 200,
    mensajeMin:
      "Explica qué vendes en una frase de al menos 10 caracteres.",
    mensajeMax: "Esta explicación permite un máximo de 200 caracteres.",
  },
  alcanceUsoOtro: {
    min: 3,
    max: 100,
    mensajeMin: "Indica dónde planeas usar la marca.",
    mensajeMax:
      "La descripción del alcance de uso permite un máximo de 100 caracteres.",
  },
  cualesMarcasSimilares: {
    min: 3,
    max: 250,
    mensajeMin:
      "Indica al menos una marca similar o una referencia que conozcas.",
    mensajeMax:
      "El detalle de marcas similares permite un máximo de 250 caracteres.",
  },
  diferenciador: {
    min: 10,
    max: 250,
    mensajeMin:
      "Explica qué diferencia a tu marca con al menos 10 caracteres.",
    mensajeMax:
      "La explicación del diferenciador permite un máximo de 250 caracteres.",
  },
  desdeCuando: {
    min: 3,
    max: 80,
    mensajeMin: "Indica desde cuándo estás usando la marca.",
    mensajeMax:
      "La fecha o referencia de uso permite un máximo de 80 caracteres.",
  },
  preguntaClave: {
    min: 10,
    max: 200,
    mensajeMin:
      "Escribe tu consulta con al menos 10 caracteres.",
    mensajeMax: "La consulta permite un máximo de 200 caracteres.",
  },
  nombreCompletoContacto: {
    min: 10,
    max: 160,
    mensajeMin:
      "Escribe tu nombre completo, incluyendo nombre y apellidos.",
    mensajeMax:
      "El nombre completo permite un máximo de 160 caracteres.",
  },
  correoContacto: {
    max: 200,
    mensajeMax:
      "El correo electrónico permite un máximo de 200 caracteres.",
  },
};

export function obtenerMaxLengthPaso(pasoId) {
  return LIMITES_POR_PASO[pasoId]?.max;
}

export function obtenerLimitesPaso(pasoId) {
  const limites = LIMITES_POR_PASO[pasoId] || {};

  return {
    min: limites.min ?? null,
    max: limites.max ?? null,
  };
}

export function obtenerPasoPorId(flow, id) {
  return flow.find((paso) => paso.id === id);
}

function limpiarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export function validarEmail(email) {
  const correo = limpiarTexto(email);

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function validarLimitesConfigurados(paso, texto) {
  const regla = LIMITES_POR_PASO[paso.id] || {};

  /*
    Compatibilidad futura:
    si radiografiaFlow.js agrega minLength o maxLength,
    esta función también los respetará.
  */
  const minimo = regla.min ?? paso.minLength;
  const maximo = regla.max ?? paso.maxLength;

  if (minimo && texto.length < minimo) {
    return (
      regla.mensajeMin ||
      `Este campo debe tener al menos ${minimo} caracteres.`
    );
  }

  if (maximo && texto.length > maximo) {
    return (
      regla.mensajeMax ||
      `Este campo permite un máximo de ${maximo} caracteres.`
    );
  }

  return "";
}

export function validarTelefonoSeparado(valor) {
  const codigoPais = String(valor?.codigoPais || "").trim();
  const numero = String(valor?.numero || "").trim();

  /*
    telefonoContacto es opcional en radiografiaFlow.js.
    Se permite continuar si no se digitó número, incluso si el
    componente precarga el código 506.
  */
  if (!numero) {
    return "";
  }

  if (!codigoPais) {
    return "Debe indicar el código de país del teléfono. Ejemplo: 506.";
  }

  if (!/^\d+$/.test(codigoPais)) {
    return "El código de país debe contener solo números. Ejemplo: 506.";
  }

  if (!/^\d+$/.test(numero)) {
    return "El número de teléfono debe contener solo números. Ejemplo: 88887777.";
  }

  if (codigoPais.length < 1 || codigoPais.length > 3) {
    return "El código de país debe tener entre 1 y 3 dígitos. Ejemplo: 506.";
  }

  if (numero.length > 20) {
    return "El número de teléfono permite un máximo de 20 dígitos.";
  }

  if (codigoPais === "506" && numero.length !== 8) {
    return "Para Costa Rica, el número debe tener 8 dígitos. Ejemplo: 88887777.";
  }

  if (numero.length < 6) {
    return "El número de teléfono parece incompleto.";
  }

  return "";
}

function validarArchivoLogo(file) {
  if (!file) {
    return "Debes adjuntar el logo o diseño para continuar.";
  }

  const extensionesPermitidas = [".jpg", ".jpeg", ".png", ".webp"];
  const nombre = String(file.name || "").trim();
  const nombreMinusculas = nombre.toLowerCase();

  if (!nombre) {
    return "No fue posible identificar el nombre del archivo adjunto.";
  }

  if (nombre.length > 255) {
    return "El nombre del archivo permite un máximo de 255 caracteres.";
  }

  const extensionValida = extensionesPermitidas.some((extension) =>
    nombreMinusculas.endsWith(extension)
  );

  if (!extensionValida) {
    return "El archivo debe ser JPG, JPEG, PNG o WebP.";
  }

  const maximoBytes = 50 * 1024 * 1024;

  if (Number(file.size || 0) > maximoBytes) {
    return "El archivo supera el tamaño máximo permitido de 50 MB.";
  }

  return "";
}

/*
  Esta función se ejecuta cuando el usuario presiona “Siguiente”.
  Si devuelve texto, ChatbotRadiografiaMarca.jsx debe mantener al usuario
  en el paso actual y mostrar el mensaje de error.
*/
export function validarRespuesta(paso, valor) {
  if (!paso) {
    return "No fue posible validar esta respuesta. Intenta nuevamente.";
  }

  if (paso.type === "phone") {
    return validarTelefonoSeparado(valor);
  }

  if (paso.type === "file") {
    if (!paso.required && !valor) {
      return "";
    }

    return validarArchivoLogo(valor);
  }

  const texto = limpiarTexto(valor);

  if (paso.required && !texto) {
    return "Esta pregunta es obligatoria.";
  }

  /*
    Los pasos opcionales pueden quedar sin respuesta.
  */
  if (!texto) {
    return "";
  }

  const errorDeLimite = validarLimitesConfigurados(paso, texto);

  if (errorDeLimite) {
    return errorDeLimite;
  }

  if (paso.type === "email" && !validarEmail(texto)) {
    return "Ingresa un correo electrónico válido. Ejemplo: correo@ejemplo.com.";
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


export function validarFlujoCompletoAntesDeEnviar(flow, respuestas) {
  const visitados = new Set();
  let paso = flow?.[0] || null;

  while (paso && paso.id !== "resumen") {
    if (visitados.has(paso.id)) {
      return {
        pasoId: paso.id,
        pregunta: paso.label || "Pregunta actual:",
        mensaje: "No fue posible completar la validación del flujo.",
      };
    }

    visitados.add(paso.id);

    const respuestaGuardada = respuestas?.[paso.id];
    let valorParaValidar = "";

    if (paso.type === "file") {
      valorParaValidar = respuestaGuardada?.archivo || null;
    } else if (paso.type === "phone") {
      valorParaValidar = {
        codigoPais: respuestaGuardada?.telefonoCodigoPais || "",
        numero: respuestaGuardada?.telefonoNumero || "",
      };
    } else {
      valorParaValidar =
        respuestaGuardada?.valor === "No indicado"
          ? ""
          : respuestaGuardada?.valor || "";
    }

    const mensaje = validarRespuesta(paso, valorParaValidar);

    if (mensaje) {
      return {
        pasoId: paso.id,
        pregunta: paso.label || "Pregunta actual:",
        mensaje,
      };
    }

    const siguientePasoId = obtenerSiguientePaso(paso, valorParaValidar);

    if (!siguientePasoId) {
      return {
        pasoId: paso.id,
        pregunta: paso.label || "Pregunta actual:",
        mensaje: "No fue posible determinar el siguiente paso.",
      };
    }

    if (siguientePasoId === "resumen") {
      return null;
    }

    paso = obtenerPasoPorId(flow, siguientePasoId);
  }

  return null;
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

  if (!numero) {
    return "No indicado";
  }

  return `${codigoPais} ${numero}`.trim();
}
