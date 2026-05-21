import api from "./api";

export async function enviarRadiografiaMarca(formData) {
  const response = await api.post("/radiografia-marca", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}