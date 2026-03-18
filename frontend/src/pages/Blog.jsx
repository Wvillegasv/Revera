import Navbar from "../components/Navbar";
import "../styles/blog.css";

function Blog() {
  const articulos = [
    {
      id: 1,
      titulo: "¿Qué es un estudio de registrabilidad?",
      descripcion:
        "Te explicamos por qué este análisis previo puede ayudarte a evitar rechazos al registrar tu marca.",
    },
    {
      id: 2,
      titulo: "Errores comunes al registrar una marca",
      descripcion:
        "Conoce los errores más frecuentes y cómo evitarlos antes de iniciar tu trámite.",
    },
    {
      id: 3,
      titulo: "¿Cuándo renovar una marca?",
      descripcion:
        "Aprende cuándo corresponde renovar tu marca y qué aspectos debes revisar a tiempo.",
    },
  ];

  return (
    <div className="blog-page">
      <Navbar />

      <main className="blog-container">
        <section className="blog-header">
          <h1>Blog REVERA</h1>
          <p>
            Información útil sobre registro de marca, registrabilidad y protección legal.
          </p>
        </section>

        <section className="blog-grid">
          {articulos.map((articulo) => (
            <article className="blog-card" key={articulo.id}>
              <h2>{articulo.titulo}</h2>
              <p>{articulo.descripcion}</p>
              <button type="button">Leer más</button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Blog;

