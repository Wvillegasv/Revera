import api from "./api";

export async function enviarSolicitudRegistroMarca(formData) {
  const response = await api.post("/registro-marca", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}