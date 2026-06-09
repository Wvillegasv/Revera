import api from "./api";

const ADMIN_HEADERS = {
  "x-user-rol": "ADMIN",
};

/* =========================================
   ARTÍCULOS
========================================= */

export async function listarArticulosAdmin() {
  const response = await api.get("/admin/articulos", {
    headers: ADMIN_HEADERS,
  });

  return response.data.data;
}

export async function obtenerArticuloAdminPorId(id) {
  const response = await api.get(`/admin/articulos/${id}`, {
    headers: ADMIN_HEADERS,
  });

  return response.data.data;
}

export async function crearArticuloAdmin(data) {
  const response = await api.post("/admin/articulos", data, {
    headers: ADMIN_HEADERS,
  });

  return response.data.data;
}

export async function actualizarArticuloAdmin(id, data) {
  const response = await api.put(`/admin/articulos/${id}`, data, {
    headers: ADMIN_HEADERS,
  });

  return response.data;
}

export async function cambiarEstadoArticuloAdmin(id, estado) {
  const response = await api.patch(
    `/admin/articulos/${id}/estado`,
    { estado },
    {
      headers: ADMIN_HEADERS,
    }
  );

  return response.data;
}

/* =========================================
   BLOQUES
========================================= */

export async function crearBloqueAdmin(articuloId, data) {
  const response = await api.post(
    `/admin/articulos/${articuloId}/bloques`,
    data,
    {
      headers: ADMIN_HEADERS,
    }
  );

  return response.data.data;
}

export async function actualizarBloqueAdmin(bloqueId, data) {
  const response = await api.put(
    `/admin/articulos/bloques/${bloqueId}`,
    data,
    {
      headers: ADMIN_HEADERS,
    }
  );

  return response.data;
}

export async function eliminarBloqueAdmin(bloqueId) {
  const response = await api.delete(`/admin/articulos/bloques/${bloqueId}`, {
    headers: ADMIN_HEADERS,
  });

  return response.data;
}

/* =========================================
   IMÁGENES
========================================= */

export async function subirImagenArticuloAdmin(articuloId, formData) {
  const response = await api.post(
    `/admin/articulos/${articuloId}/imagenes`,
    formData,
    {
      headers: ADMIN_HEADERS,
    }
  );

  return response.data.data;
}

/* =========================================
   RELACIONADOS
========================================= */

export async function crearRelacionadoAdmin(articuloId, data) {
  const response = await api.post(
    `/admin/articulos/${articuloId}/relacionados`,
    data,
    {
      headers: ADMIN_HEADERS,
    }
  );

  return response.data.data;
}

export async function eliminarRelacionadoAdmin(articuloId, relacionadoId) {
  const response = await api.delete(
    `/admin/articulos/${articuloId}/relacionados/${relacionadoId}`,
    {
      headers: ADMIN_HEADERS,
    }
  );

  return response.data;
}