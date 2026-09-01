import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import AvisoPrivacidad from "../pages/AvisoPrivacidad";
import "../styles/avisoPrivacidadModal.css";

function AvisoPrivacidadModal({ abierto, onCerrar }) {
  const botonCerrarRef = useRef(null);

  useEffect(() => {
    if (!abierto) {
      return undefined;
    }

    const overflowAnterior = document.body.style.overflow;

    const manejarTeclado = (event) => {
      if (event.key === "Escape") {
        onCerrar();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", manejarTeclado);

    window.requestAnimationFrame(() => {
      botonCerrarRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", manejarTeclado);
    };
  }, [abierto, onCerrar]);

  if (!abierto) {
    return null;
  }

  const cerrarDesdeFondo = (event) => {
    if (event.target === event.currentTarget) {
      onCerrar();
    }
  };

  return (
    <div
      className="aviso-privacidad-overlay"
      onMouseDown={cerrarDesdeFondo}
      role="presentation"
    >
      <section
        className="aviso-privacidad-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aviso-privacidad-titulo"
      >
        <button
          ref={botonCerrarRef}
          type="button"
          className="aviso-privacidad-cerrar"
          onClick={onCerrar}
          aria-label="Cerrar Aviso de Privacidad"
        >
          <X size={24} strokeWidth={2} />
        </button>

        <div className="aviso-privacidad-contenido">
          <AvisoPrivacidad />
        </div>
      </section>
    </div>
  );
}

export default AvisoPrivacidadModal;
