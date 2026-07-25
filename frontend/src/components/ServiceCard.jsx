import "../styles/servicecard.css";

function ServiceCard({ icon, title, subtitle, description }) {
  return (
    <article className="service-card">
      <div className="service-card-icon">{icon}</div>

      <h3 className="service-card-title">{title}</h3>

      {subtitle && <h4 className="service-card-subtitle">{subtitle}</h4>}

      <p className="service-card-description">{description}</p>
    </article>
  );
}

export default ServiceCard;
