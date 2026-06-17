import { useEffect, useMemo, useState } from "react";
import {
  listarArticulosAdmin,
  obtenerArticuloAdminPorId,
  crearArticuloAdmin,
  actualizarArticuloAdmin,
  cambiarEstadoArticuloAdmin,
  crearBloqueAdmin,
  actualizarBloqueAdmin,
  eliminarBloqueAdmin,
  subirImagenArticuloAdmin,
  crearRelacionadoAdmin,
  eliminarRelacionadoAdmin,
} from "../../services/articulosAdminApi";
import "../../styles/adminArticulos.css";

const FORM_INICIAL = {
  id: null,
  titulo: "",
  subtitulo: "",
  slug: "",
  categoria: "",
  extracto: "",
  imagenPortada: "",
  tiempoLectura: "5 min",
  fechaPublicacion: "",
  destacado: "N",
  estado: "A",
  orden: 0,
};

const BLOQUE_INICIAL = {
  id: null,
  orden: 1,
  tipo: "parrafo",
  contenido: "",
  imagenUrl: "",
  altText: "",
  caption: "",
  estado: "A",
};

const RELACIONADO_INICIAL = {
  relacionadoId: "",
  orden: 1,
};

const TIPOS_BLOQUE = [
  { value: "titulo", label: "Título de sección / FAQ" },
  { value: "subtitulo", label: "Subtítulo / pregunta" },
  { value: "parrafo", label: "Párrafo" },
  { value: "lista", label: "Lista" },
  { value: "cta", label: "CTA / Destacado" },
  { value: "imagen", label: "Imagen" },
];

function generarSlug(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function convertirFechaParaMostrar(fecha = "") {
  if (!fecha) return "";

  const soloFecha = String(fecha).slice(0, 10);
  const partes = soloFecha.split("-");

  if (partes.length !== 3) return fecha;

  const [year, month, day] = partes;

  return `${day}-${month}-${year}`;
}

function convertirFechaParaGuardar(fecha = "") {
  if (!fecha) return "";

  const valor = String(fecha).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(valor)) {
    const [day, month, year] = valor.split("-");
    return `${year}-${month}-${day}`;
  }

  return valor;
}

function obtenerFechaHoyDDMMYYYY() {
  const hoy = new Date();
  const day = String(hoy.getDate()).padStart(2, "0");
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const year = hoy.getFullYear();

  return `${day}-${month}-${year}`;
}

function obtenerEtiquetaTipo(tipo) {
  return TIPOS_BLOQUE.find((item) => item.value === tipo)?.label || tipo;
}

function obtenerResumenBloque(bloque) {
  if (bloque.tipo === "imagen") {
    return bloque.imagenUrl || bloque.contenido || "Imagen sin ruta";
  }

  return bloque.contenido || "Bloque sin contenido";
}

function esFechaDDMMYYYYValida(fecha = "") {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
    return false;
  }

  const [day, month, year] = fecha.split("-").map(Number);
  const fechaObj = new Date(year, month - 1, day);

  return (
    fechaObj.getFullYear() === year &&
    fechaObj.getMonth() === month - 1 &&
    fechaObj.getDate() === day
  );
}

function esSlugValido(slug = "") {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function esNumeroValido(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0;
}

function AdminArticulos() {
  const [articulos, setArticulos] = useState([]);
  const [bloques, setBloques] = useState([]);
  const [relacionados, setRelacionados] = useState([]);

  const [form, setForm] = useState(FORM_INICIAL);
  const [bloqueForm, setBloqueForm] = useState(BLOQUE_INICIAL);
  const [relacionadoForm, setRelacionadoForm] = useState(RELACIONADO_INICIAL);

  const [imagenArchivo, setImagenArchivo] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardandoBloque, setGuardandoBloque] = useState(false);
  const [guardandoRelacionado, setGuardandoRelacionado] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const articulosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return articulos;
    }

    return articulos.filter((articulo) => {
      return (
        articulo.titulo?.toLowerCase().includes(texto) ||
        articulo.slug?.toLowerCase().includes(texto) ||
        articulo.categoria?.toLowerCase().includes(texto)
      );
    });
  }, [articulos, busqueda]);

  const bloquesOrdenados = useMemo(() => {
    return [...bloques].sort((a, b) => {
      const ordenA = Number(a.orden || 0);
      const ordenB = Number(b.orden || 0);

      if (ordenA !== ordenB) return ordenA - ordenB;

      return Number(a.id || 0) - Number(b.id || 0);
    });
  }, [bloques]);

  const relacionadosOrdenados = useMemo(() => {
    return [...relacionados].sort((a, b) => {
      const ordenA = Number(a.orden || 0);
      const ordenB = Number(b.orden || 0);

      if (ordenA !== ordenB) return ordenA - ordenB;

      return Number(a.relacionadoId || 0) - Number(b.relacionadoId || 0);
    });
  }, [relacionados]);

  const articulosDisponiblesParaRelacionar = useMemo(() => {
    const idsRelacionados = relacionados
      .filter((relacionado) => relacionado.estado === "A")
      .map((relacionado) => Number(relacionado.relacionadoId));

    return articulos.filter((articulo) => {
      return (
        Number(articulo.id) !== Number(form.id) &&
        articulo.estado === "A" &&
        !idsRelacionados.includes(Number(articulo.id))
      );
    });
  }, [articulos, relacionados, form.id]);

  async function cargarArticulos() {
    try {
      setCargando(true);
      setError("");

      const data = await listarArticulosAdmin();
      setArticulos(data);
    } catch (err) {
      console.error("Error cargando artículos admin:", err);
      setError("No fue posible cargar los artículos.");
    } finally {
      setCargando(false);
    }
  }

  async function recargarArticuloSeleccionado(id = form.id) {
    if (!id) return;

    const articulo = await obtenerArticuloAdminPorId(id);

    setForm({
      id: articulo.id,
      titulo: articulo.titulo || "",
      subtitulo: articulo.subtitulo || "",
      slug: articulo.slug || "",
      categoria: articulo.categoria || "",
      extracto: articulo.extracto || "",
      imagenPortada: articulo.imagenPortada || "",
      tiempoLectura: articulo.tiempoLectura || "5 min",
      fechaPublicacion: convertirFechaParaMostrar(
        articulo.fechaPublicacion || ""
      ),
      destacado: articulo.destacado || "N",
      estado: articulo.estado || "A",
      orden: articulo.orden || 0,
    });

    setBloques(Array.isArray(articulo.bloques) ? articulo.bloques : []);
    setRelacionados(
      Array.isArray(articulo.relacionados) ? articulo.relacionados : []
    );
  }

  async function seleccionarArticulo(id) {
    try {
      setError("");
      setMensaje("");
      setBloqueForm(BLOQUE_INICIAL);
      setRelacionadoForm(RELACIONADO_INICIAL);
      setImagenArchivo(null);

      await recargarArticuloSeleccionado(id);
    } catch (err) {
      console.error("Error obteniendo artículo:", err);
      setError("No fue posible cargar el artículo seleccionado.");
    }
  }

  function nuevoArticulo() {
    setForm({
      ...FORM_INICIAL,
      fechaPublicacion: obtenerFechaHoyDDMMYYYY(),
    });

    setBloques([]);
    setRelacionados([]);
    setBloqueForm(BLOQUE_INICIAL);
    setRelacionadoForm(RELACIONADO_INICIAL);
    setImagenArchivo(null);
    setMensaje("");
    setError("");
  }

  function actualizarCampo(event) {
    const { name, value } = event.target;

    setForm((prev) => {
      const siguiente = {
        ...prev,
        [name]: value,
      };

      if (name === "titulo" && !prev.id) {
        siguiente.slug = generarSlug(value);
      }

      return siguiente;
    });
  }

  function actualizarCampoBloque(event) {
    const { name, value } = event.target;

    setBloqueForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function actualizarCampoRelacionado(event) {
    const { name, value } = event.target;

    setRelacionadoForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function prepararNuevoBloque(tipo = "parrafo") {
    const siguienteOrden =
      bloquesOrdenados.length > 0
        ? Math.max(
            ...bloquesOrdenados.map((bloque) => Number(bloque.orden || 0))
          ) + 1
        : 1;

    setBloqueForm({
      ...BLOQUE_INICIAL,
      tipo,
      orden: siguienteOrden,
    });

    setMensaje("");
    setError("");
  }

  function editarBloque(bloque) {
    setBloqueForm({
      id: bloque.id,
      orden: bloque.orden || 1,
      tipo: bloque.tipo || "parrafo",
      contenido: bloque.contenido || "",
      imagenUrl: bloque.imagenUrl || "",
      altText: bloque.altText || "",
      caption: bloque.caption || "",
      estado: bloque.estado || "A",
    });

    setMensaje("");
    setError("");
  }

  function limpiarBloque() {
    setBloqueForm(BLOQUE_INICIAL);
    setImagenArchivo(null);
    setMensaje("");
    setError("");
  }

  async function guardarArticulo(event) {
    event.preventDefault();


  if (!form.titulo.trim()) {
    setError("El título es obligatorio.");
    return;
  }

  if (!form.slug.trim()) {
    setError("El slug es obligatorio.");
    return;
  }

  if (!esSlugValido(form.slug.trim())) {
    setError(
      "El slug solo puede contener letras minúsculas, números y guiones. Ejemplo: articulo-de-prueba"
    );
    return;
  }

  if (!form.categoria.trim()) {
    setError("La categoría es obligatoria.");
    return;
  }

  if (!form.fechaPublicacion.trim()) {
    setError("La fecha de publicación es obligatoria.");
    return;
  }

  if (!esFechaDDMMYYYYValida(form.fechaPublicacion.trim())) {
    setError("La fecha debe ser válida y tener el formato dd-mm-yyyy.");
    return;
  }

  if (!esNumeroValido(form.orden)) {
    setError("El orden del artículo debe ser un número válido mayor o igual a cero.");
    return;
  }


    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const payload = {
        titulo: form.titulo.trim(),
        subtitulo: form.subtitulo?.trim() || null,
        slug: form.slug?.trim() || generarSlug(form.titulo),
        categoria: form.categoria?.trim() || "General",
        extracto: form.extracto?.trim() || "",
        imagenPortada: form.imagenPortada?.trim() || null,
        tiempoLectura: form.tiempoLectura?.trim() || "5 min",
        fechaPublicacion:
          convertirFechaParaGuardar(form.fechaPublicacion) ||
          convertirFechaParaGuardar(obtenerFechaHoyDDMMYYYY()),
        destacado: form.destacado,
        estado: form.estado,
        orden: Number(form.orden || 0),
      };

      if (form.id) {
        await actualizarArticuloAdmin(form.id, payload);
        setMensaje("Artículo actualizado correctamente.");
      } else {
        const nuevo = await crearArticuloAdmin(payload);

        setForm((prev) => ({
          ...prev,
          id: nuevo.id,
          slug: nuevo.slug,
        }));

        setMensaje("Artículo creado correctamente.");
      }

      await cargarArticulos();

      if (form.id) {
        await recargarArticuloSeleccionado(form.id);
      }
    } catch (err) {
      console.error("Error guardando artículo:", err);
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "No fue posible guardar el artículo."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function alternarEstado() {
    if (!form.id) {
      setError("Primero seleccione o cree un artículo.");
      return;
    }

    const nuevoEstado = form.estado === "A" ? "I" : "A";

    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      await cambiarEstadoArticuloAdmin(form.id, nuevoEstado);

      setForm((prev) => ({
        ...prev,
        estado: nuevoEstado,
      }));

      await cargarArticulos();

      setMensaje(
        nuevoEstado === "A"
          ? "Artículo activado correctamente."
          : "Artículo inactivado correctamente."
      );
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setError("No fue posible cambiar el estado del artículo.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarBloque(event) {
    event.preventDefault();

    if (!form.id) {
      setError("Primero seleccione o cree un artículo.");
      return;
    }

    if (!bloqueForm.tipo) {
      setError("Debe seleccionar el tipo de bloque.");
      return;
    }

    if (!esNumeroValido(bloqueForm.orden)) {
      setError("El orden del bloque debe ser un número válido mayor o igual a cero.");
      return;
    }

    if (bloqueForm.tipo !== "imagen" && !bloqueForm.contenido.trim()) {
      setError("El contenido del bloque es obligatorio.");
      return;
    }

    if (bloqueForm.tipo === "imagen" && !bloqueForm.imagenUrl.trim()) {
      setError("Para bloques de imagen debe indicar la ruta de la imagen.");
      return;
    }

    try {
      setGuardandoBloque(true);
      setError("");
      setMensaje("");

      const payload = {
        orden: Number(bloqueForm.orden || 0),
        tipo: bloqueForm.tipo,
        contenido: bloqueForm.contenido?.trim() || "",
        imagenUrl: bloqueForm.imagenUrl?.trim() || null,
        altText: bloqueForm.altText?.trim() || null,
        caption: bloqueForm.caption?.trim() || null,
        estado: bloqueForm.estado,
      };

      if (bloqueForm.id) {
        await actualizarBloqueAdmin(bloqueForm.id, payload);
        setMensaje("Bloque actualizado correctamente.");
      } else {
        await crearBloqueAdmin(form.id, payload);
        setMensaje("Bloque creado correctamente.");
      }

      setBloqueForm(BLOQUE_INICIAL);
      await recargarArticuloSeleccionado(form.id);
    } catch (err) {
      console.error("Error guardando bloque:", err);
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "No fue posible guardar el bloque."
      );
    } finally {
      setGuardandoBloque(false);
    }
  }

  async function inactivarBloque(bloqueId) {
    if (!bloqueId) return;

    const confirmar = window.confirm("¿Desea inactivar este bloque?");

    if (!confirmar) return;

    try {
      setGuardandoBloque(true);
      setError("");
      setMensaje("");

      await eliminarBloqueAdmin(bloqueId);

      setMensaje("Bloque inactivado correctamente.");
      await recargarArticuloSeleccionado(form.id);
    } catch (err) {
      console.error("Error inactivando bloque:", err);
      setError("No fue posible inactivar el bloque.");
    } finally {
      setGuardandoBloque(false);
    }
  }

  async function subirImagen(event) {
    event.preventDefault();

    if (!form.id) {
      setError("Primero seleccione o cree un artículo.");
      return;
    }

    if (!imagenArchivo) {
      setError("Debe seleccionar una imagen.");
      return;
    }

    try {
      setSubiendoImagen(true);
      setError("");
      setMensaje("");

      const formData = new FormData();
      formData.append("imagen", imagenArchivo);
      formData.append("altText", bloqueForm.altText || imagenArchivo.name);
      formData.append("caption", bloqueForm.caption || "");
      formData.append("contenido", bloqueForm.contenido || imagenArchivo.name);

      await subirImagenArticuloAdmin(form.id, formData);

      setImagenArchivo(null);
      setBloqueForm(BLOQUE_INICIAL);

      setMensaje("Imagen subida y bloque creado correctamente.");
      await recargarArticuloSeleccionado(form.id);
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "No fue posible subir la imagen."
      );
    } finally {
      setSubiendoImagen(false);
    }
  }

  async function agregarRelacionado(event) {
    event.preventDefault();

    if (!form.id) {
      setError("Primero seleccione o cree un artículo.");
      return;
    }

    if (!relacionadoForm.relacionadoId) {
      setError("Debe seleccionar un artículo relacionado.");
      return;
    }

    if (Number(relacionadoForm.relacionadoId) === Number(form.id)) {
      setError("Un artículo no puede relacionarse consigo mismo.");
      return;
    }

    if (!esNumeroValido(relacionadoForm.orden)) {
      setError("El orden del relacionado debe ser un número válido mayor o igual a cero.");
      return;
    }

    try {
      setGuardandoRelacionado(true);
      setError("");
      setMensaje("");

      await crearRelacionadoAdmin(form.id, {
        relacionadoId: Number(relacionadoForm.relacionadoId),
        orden: Number(relacionadoForm.orden || 1),
      });

      setRelacionadoForm(RELACIONADO_INICIAL);
      setMensaje("Artículo relacionado agregado correctamente.");
      await recargarArticuloSeleccionado(form.id);
    } catch (err) {
      console.error("Error agregando relacionado:", err);
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.error ||
          "No fue posible agregar el artículo relacionado."
      );
    } finally {
      setGuardandoRelacionado(false);
    }
  }

  async function quitarRelacionado(relacionadoId) {
    if (!form.id || !relacionadoId) return;

    const confirmar = window.confirm(
      "¿Desea quitar este artículo relacionado?"
    );

    if (!confirmar) return;

    try {
      setGuardandoRelacionado(true);
      setError("");
      setMensaje("");

      await eliminarRelacionadoAdmin(form.id, relacionadoId);

      setMensaje("Artículo relacionado quitado correctamente.");
      await recargarArticuloSeleccionado(form.id);
    } catch (err) {
      console.error("Error quitando relacionado:", err);
      setError("No fue posible quitar el artículo relacionado.");
    } finally {
      setGuardandoRelacionado(false);
    }
  }

  useEffect(() => {
    cargarArticulos();
  }, []);

  return (
    <div className="admin-articulos-page">
      <header className="admin-articulos-header">
        <div>
          <p className="admin-eyebrow">REVERA CMS</p>
          <h1>Gestión de artículos de Guía</h1>
          <p>
            Administre artículos, categorías, extractos, bloques de contenido,
            relacionados y estado de publicación.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-btn secondary"
            onClick={nuevoArticulo}
          >
            Nuevo artículo
          </button>

          <button
            type="button"
            className="admin-btn ghost"
            onClick={cargarArticulos}
            disabled={cargando}
          >
            Recargar
          </button>
        </div>
      </header>

      {mensaje && <div className="admin-alert success">{mensaje}</div>}
      {error && <div className="admin-alert error">{error}</div>}

      <main className="admin-articulos-layout">
        <aside className="admin-articulos-list-card">

          <div className="admin-card-title-row">
            <h2>Artículos</h2>
            <span>{articulos.length}</span>
          </div>

          <input
            type="text"
            className="admin-search"
            placeholder="Buscar por título, slug o categoría..."
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />

          <div className="admin-list">
            {cargando && <p className="admin-muted">Cargando artículos...</p>}

            {!cargando &&
              articulosFiltrados.map((articulo) => (
                <button
                  type="button"
                  key={articulo.id}
                  className={`admin-list-item ${
                    form.id === articulo.id ? "active" : ""
                  }`}
                  onClick={() => seleccionarArticulo(articulo.id)}
                >
                  <strong>{articulo.titulo}</strong>
                  <span>{articulo.categoria || "Sin categoría"}</span>

                  <div className="admin-list-date">
                    Fecha:{" "}
                    {convertirFechaParaMostrar(articulo.fechaPublicacion)}
                  </div>

                  <div className="admin-list-meta">
                    <small>{articulo.slug}</small>
                    <em
                      className={
                        articulo.estado === "A" ? "active" : "inactive"
                      }
                    >
                      {articulo.estado === "A" ? "Activo" : "Inactivo"}
                    </em>
                  </div>
                </button>
              ))}

            {!cargando && articulosFiltrados.length === 0 && (
              <p className="admin-muted">No se encontraron artículos.</p>
            )}
          </div>
        </aside>

        <section className="admin-articulos-editor-card">

            <div className="admin-card-title-row">
            <h2>{form.id ? "Editar artículo" : "Nuevo artículo"}</h2>

            <div className="admin-title-actions">
                {form.id && form.slug && (
                <a
                    href={`/guia/${form.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn ghost small admin-link-button"
                >
                    Ver artículo
                </a>
                )}

                {form.id && (
                <span
                    className={
                    form.estado === "A"
                        ? "admin-status active"
                        : "admin-status inactive"
                    }
                >
                    {form.estado === "A" ? "Activo" : "Inactivo"}
                </span>
                )}
            </div>
            </div>


          <form onSubmit={guardarArticulo} className="admin-form">
            <div className="admin-form-grid">
              <label className="admin-field full">
                <span>Título</span>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={actualizarCampo}
                  placeholder="Título del artículo"
                />
              </label>

              <label className="admin-field full">
                <span>Subtítulo</span>
                <input
                  name="subtitulo"
                  value={form.subtitulo}
                  onChange={actualizarCampo}
                  placeholder="Subtítulo opcional"
                />
              </label>

              <label className="admin-field">
                <span>Slug</span>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={actualizarCampo}
                  placeholder="url-amigable"
                />
              </label>

              <label className="admin-field">
                <span>Categoría</span>
                <input
                  name="categoria"
                  value={form.categoria}
                  onChange={actualizarCampo}
                  placeholder="Ej. Tecnología"
                />
              </label>

              <label className="admin-field full">
                <span>Extracto</span>
                <textarea
                  name="extracto"
                  value={form.extracto}
                  onChange={actualizarCampo}
                  rows={4}
                  placeholder="Resumen corto del artículo"
                />
              </label>

              <label className="admin-field">
                <span>Tiempo de lectura</span>
                <input
                  name="tiempoLectura"
                  value={form.tiempoLectura}
                  onChange={actualizarCampo}
                  placeholder="5 min"
                />
              </label>

              <label className="admin-field">
                <span>Fecha publicación</span>
                <input
                  type="text"
                  name="fechaPublicacion"
                  value={form.fechaPublicacion}
                  onChange={actualizarCampo}
                  placeholder="dd-mm-yyyy"
                  maxLength={10}
                />
              </label>

              <label className="admin-field">
                <span>Destacado</span>
                <select
                  name="destacado"
                  value={form.destacado}
                  onChange={actualizarCampo}
                >
                  <option value="N">No</option>
                  <option value="S">Sí</option>
                </select>
              </label>

              <label className="admin-field">
                <span>Estado</span>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={actualizarCampo}
                >
                  <option value="A">Activo</option>
                  <option value="I">Inactivo</option>
                </select>
              </label>

              <label className="admin-field">
                <span>Orden</span>
                <input
                  type="number"
                  name="orden"
                  value={form.orden}
                  onChange={actualizarCampo}
                />
              </label>

              <label className="admin-field full">
                <span>Imagen portada</span>
                <input
                  name="imagenPortada"
                  value={form.imagenPortada}
                  onChange={actualizarCampo}
                  placeholder="/uploads/guia/imagen.webp"
                />
              </label>
            </div>

            <div className="admin-form-actions">
              <button
                type="submit"
                className="admin-btn primary"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>

              {form.id && (
                <button
                  type="button"
                  className="admin-btn danger"
                  onClick={alternarEstado}
                  disabled={guardando}
                >
                  {form.estado === "A" ? "Inactivar" : "Activar"}
                </button>
              )}
            </div>
          </form>

          <section className="admin-bloques-section">
            <div className="admin-card-title-row">
              <div>
                <h2>Bloques de contenido</h2>
                <p className="admin-muted">
                  Administre el contenido interno del artículo seleccionado.
                </p>
              </div>

              <span>{bloques.length}</span>
            </div>

            {!form.id && (
              <div className="admin-empty-box">
                Seleccione o cree un artículo para administrar sus bloques.
              </div>
            )}

            {form.id && (
              <>
                <div className="admin-block-buttons">
                  {TIPOS_BLOQUE.map((tipo) => (
                    <button
                      type="button"
                      key={tipo.value}
                      className="admin-btn ghost small"
                      onClick={() => prepararNuevoBloque(tipo.value)}
                    >
                      + {tipo.label}
                    </button>
                  ))}
                </div>

                <form className="admin-block-form" onSubmit={guardarBloque}>
                  <div className="admin-form-grid">
                    <label className="admin-field">
                      <span>Tipo</span>
                      <select
                        name="tipo"
                        value={bloqueForm.tipo}
                        onChange={actualizarCampoBloque}
                      >
                        {TIPOS_BLOQUE.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>Orden</span>
                      <input
                        type="number"
                        name="orden"
                        value={bloqueForm.orden}
                        onChange={actualizarCampoBloque}
                      />
                    </label>

                    <label className="admin-field">
                      <span>Estado</span>
                      <select
                        name="estado"
                        value={bloqueForm.estado}
                        onChange={actualizarCampoBloque}
                      >
                        <option value="A">Activo</option>
                        <option value="I">Inactivo</option>
                      </select>
                    </label>

                    <label className="admin-field full">
                      <span>Contenido</span>
                      <textarea
                        name="contenido"
                        value={bloqueForm.contenido}
                        onChange={actualizarCampoBloque}
                        rows={5}
                        placeholder={
                          bloqueForm.tipo === "lista"
                            ? "Digite cada punto en una línea diferente"
                            : "Contenido del bloque"
                        }
                      />
                    </label>

                    {bloqueForm.tipo === "imagen" && (
                      <>
                        <label className="admin-field full">
                          <span>URL de imagen</span>
                          <input
                            name="imagenUrl"
                            value={bloqueForm.imagenUrl}
                            onChange={actualizarCampoBloque}
                            placeholder="/uploads/guia/imagen.webp"
                          />
                        </label>

                        <label className="admin-field">
                          <span>Texto alternativo</span>
                          <input
                            name="altText"
                            value={bloqueForm.altText}
                            onChange={actualizarCampoBloque}
                            placeholder="Descripción de la imagen"
                          />
                        </label>

                        <label className="admin-field">
                          <span>Caption</span>
                          <input
                            name="caption"
                            value={bloqueForm.caption}
                            onChange={actualizarCampoBloque}
                            placeholder="Texto bajo la imagen"
                          />
                        </label>
                      </>
                    )}
                  </div>

                  <div className="admin-form-actions">
                    <button
                      type="submit"
                      className="admin-btn primary"
                      disabled={guardandoBloque}
                    >
                      {guardandoBloque
                        ? "Guardando bloque..."
                        : bloqueForm.id
                          ? "Actualizar bloque"
                          : "Crear bloque"}
                    </button>

                    <button
                      type="button"
                      className="admin-btn ghost"
                      onClick={limpiarBloque}
                      disabled={guardandoBloque}
                    >
                      Limpiar
                    </button>
                  </div>
                </form>

                <form className="admin-upload-form" onSubmit={subirImagen}>
                  <div className="admin-card-title-row">
                    <div>
                      <h2>Subir imagen</h2>
                      <p className="admin-muted">
                        Cargue una imagen JPG, PNG o WebP. Se creará
                        automáticamente un bloque tipo imagen.
                      </p>
                    </div>
                  </div>

                  <div className="admin-form-grid">
                    <label className="admin-field full">
                      <span>Archivo de imagen</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          setImagenArchivo(event.target.files?.[0] || null);
                        }}
                      />
                    </label>

                    <label className="admin-field">
                      <span>Texto alternativo</span>
                      <input
                        name="altText"
                        value={bloqueForm.altText}
                        onChange={actualizarCampoBloque}
                        placeholder="Descripción de la imagen"
                      />
                    </label>

                    <label className="admin-field">
                      <span>Caption</span>
                      <input
                        name="caption"
                        value={bloqueForm.caption}
                        onChange={actualizarCampoBloque}
                        placeholder="Texto bajo la imagen"
                      />
                    </label>

                    <label className="admin-field full">
                      <span>Descripción interna</span>
                      <input
                        name="contenido"
                        value={bloqueForm.contenido}
                        onChange={actualizarCampoBloque}
                        placeholder="Nombre o descripción breve de la imagen"
                      />
                    </label>
                  </div>

                  <div className="admin-form-actions">
                    <button
                      type="submit"
                      className="admin-btn secondary"
                      disabled={subiendoImagen}
                    >
                      {subiendoImagen ? "Subiendo imagen..." : "Subir imagen"}
                    </button>
                  </div>
                </form>

                <div className="admin-block-list">
                  {bloquesOrdenados.length === 0 && (
                    <p className="admin-muted">
                      Este artículo no tiene bloques.
                    </p>
                  )}

                  {bloquesOrdenados.map((bloque) => (
                    <article
                      key={bloque.id}
                      className={`admin-block-item ${
                        bloque.estado === "A" ? "active" : "inactive"
                      }`}
                    >
                      <div className="admin-block-item-header">
                        <div>
                          <strong>
                            Bloque {bloque.orden} |{" "}
                            {obtenerEtiquetaTipo(bloque.tipo)}
                          </strong>

                          <span
                            className={
                              bloque.estado === "A"
                                ? "admin-status active"
                                : "admin-status inactive"
                            }
                          >
                            {bloque.estado === "A" ? "Activo" : "Inactivo"}
                          </span>
                        </div>

                        <div className="admin-block-actions">
                          <button
                            type="button"
                            className="admin-btn ghost small"
                            onClick={() => editarBloque(bloque)}
                          >
                            Editar
                          </button>

                          {bloque.estado === "A" && (
                            <button
                              type="button"
                              className="admin-btn danger small"
                              onClick={() => inactivarBloque(bloque.id)}
                            >
                              Inactivar
                            </button>
                          )}
                        </div>
                      </div>

                      <p>{obtenerResumenBloque(bloque)}</p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="admin-relacionados-section">
            <div className="admin-card-title-row">
              <div>
                <h2>Artículos relacionados</h2>
                <p className="admin-muted">
                  Defina los artículos que aparecerán al final del detalle.
                </p>
              </div>

              <span>{relacionados.length}</span>
            </div>

            {!form.id && (
              <div className="admin-empty-box">
                Seleccione o cree un artículo para administrar relacionados.
              </div>
            )}

            {form.id && (
              <>
                <form
                  className="admin-related-form"
                  onSubmit={agregarRelacionado}
                >
                  <div className="admin-form-grid">
                    <label className="admin-field full">
                      <span>Artículo relacionado</span>
                      <select
                        name="relacionadoId"
                        value={relacionadoForm.relacionadoId}
                        onChange={actualizarCampoRelacionado}
                      >
                        <option value="">Seleccione un artículo</option>

                        {articulosDisponiblesParaRelacionar.map((articulo) => (
                          <option key={articulo.id} value={articulo.id}>
                            {articulo.titulo}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-field">
                      <span>Orden</span>
                      <input
                        type="number"
                        name="orden"
                        value={relacionadoForm.orden}
                        onChange={actualizarCampoRelacionado}
                      />
                    </label>
                  </div>

                  <div className="admin-form-actions">
                    <button
                      type="submit"
                      className="admin-btn primary"
                      disabled={guardandoRelacionado}
                    >
                      {guardandoRelacionado
                        ? "Agregando..."
                        : "Agregar relacionado"}
                    </button>
                  </div>
                </form>

                <div className="admin-related-list">
                  {relacionadosOrdenados.length === 0 && (
                    <p className="admin-muted">
                      Este artículo no tiene relacionados.
                    </p>
                  )}

                  {relacionadosOrdenados.map((relacionado) => (
                    <article
                      key={`${relacionado.relacionadoId}-${relacionado.orden}`}
                      className={`admin-related-item ${
                        relacionado.estado === "A" ? "active" : "inactive"
                      }`}
                    >
                      <div>
                        <strong>{relacionado.titulo}</strong>
                        <span>{relacionado.categoria || "Sin categoría"}</span>
                        <small>
                          Orden {relacionado.orden} · {relacionado.slug}
                        </small>
                      </div>

                      <div className="admin-block-actions">
                        <span
                          className={
                            relacionado.estado === "A"
                              ? "admin-status active"
                              : "admin-status inactive"
                          }
                        >
                          {relacionado.estado === "A" ? "Activo" : "Inactivo"}
                        </span>

                        {relacionado.estado === "A" && (
                          <button
                            type="button"
                            className="admin-btn danger small"
                            onClick={() =>
                              quitarRelacionado(relacionado.relacionadoId)
                            }
                            disabled={guardandoRelacionado}
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default AdminArticulos;