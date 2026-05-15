import api from "./api";

export async function obtenerArticulos() {
  const response = await api.get("/articulos");
  return response.data.data;
}

export async function obtenerArticuloPorSlug(slug) {
  const response = await api.get(`/articulos/${slug}`);
  return response.data.data;
}
