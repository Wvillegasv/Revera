import "../styles/servicecard.css"

function ServiceCard({ titulo, descripcion, icono, onClick }) {
  return (
    <article className="service-card" onClick={onClick}>
      <div className="service-icon">
        {icono}
      </div>

      <h3>{titulo}</h3>
      <p>{descripcion}</p>
    </article>
  )
}

export default ServiceCard