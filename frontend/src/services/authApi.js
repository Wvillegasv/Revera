import api from "./api";

export async function iniciarSesionAdmin({ correo, clave }) {
  const response = await api.post("/auth/login", {
    correo,
    clave,
  });

  return response.data;
}

export async function obtenerSesionAdmin() {
  const response = await api.get("/auth/me");
  return response.data;
}

export async function cerrarSesionAdmin() {
  const response = await api.post("/auth/logout");
  return response.data;
}
