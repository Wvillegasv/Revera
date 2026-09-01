import api from "./api";

export async function enviarRadiografiaMarca(formData) {
  try {
    const response = await api.post(
      "/radiografia-marca",
      formData,
      {
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error enviando Radiografía de Marca:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      timeout: error.config?.timeout,
    });

    throw error;
  }
}