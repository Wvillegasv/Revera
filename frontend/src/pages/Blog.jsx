import { useMemo, useState } from "react"
import { Link } from "react-router-dom"


import "../styles/revera.css"
import "../styles/blog.css"

function Blog() {
  const [busqueda, setBusqueda] = useState("")
  const [categoria, setCategoria] = useState("todos")

  const articulos = [
    {
      id: 1,
      categoria: "registrabilidad",
      titulo: "Cómo validar si una marca puede registrarse",
      resumen: "Aprende los puntos clave para analizar la viabilidad legal de una marca antes de presentar la solicitud."
    },
    {
      id: 2,
      categoria: "registro",
      titulo: "Errores frecuentes al registrar una marca",
      resumen: "Conoce los errores más comunes que retrasan o afectan el proceso de registro marcario."
    },
    {
      id: 3,
      categoria: "asesoria",
      titulo: "Cuándo conviene agendar una asesoría personalizada",
      resumen: "Descubre en qué casos una reunión con especialistas puede ayudarte a tomar mejores decisiones."
    }
  ]

  const articulosFiltrados = useMemo(() => {
    return articulos.filter((articulo) => {
      const coincideBusqueda =
        articulo.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        articulo.resumen.toLowerCase().includes(busqueda.toLowerCase())

      const coincideCategoria =
        categoria === "todos" || articulo.categoria === categoria

      return coincideBusqueda && coincideCategoria
    })
  }, [busqueda, categoria])

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1>Blog</h1>
        <p>
          Encuentra contenido útil sobre estudio de registrabilidad,
          registro de marca y asesoría especializada.
        </p>
      </div>

      <div className="blog-toolbar">
        <div className="blog-search">
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="blog-filters">
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="todos">Todas las categorías</option>
            <option value="registrabilidad">Registrabilidad</option>
            <option value="registro">Registro de marca</option>
            <option value="asesoria">Asesoría</option>
          </select>

          <Link to="/">
            <button type="button">Volver</button>
          </Link>
        </div>
      </div>

      <div className="blog-grid">
        {articulosFiltrados.map((articulo) => (
          <article key={articulo.id} className="blog-card">
            <div className="blog-card-image"></div>

            <div className="blog-card-content">
              <span className="blog-card-tag">{articulo.categoria}</span>
              <h3>{articulo.titulo}</h3>
              <p>{articulo.resumen}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Blog

