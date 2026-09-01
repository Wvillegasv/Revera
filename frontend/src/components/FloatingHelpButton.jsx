import { useEffect, useRef, useState } from "react";
import { HelpCircle, X } from "lucide-react";

import "../styles/floatinghelpbutton.css";

const idiomas = [
  "English",
  "日本語",
  "Français",
  "Deutsch",
  "Español (España)",
  "Español (Latinoamérica)",
  "한국어",
  "Português (Brasil)",
];

function FloatingHelpButton() {
  const [open, setOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(
    "Español (Latinoamérica)"
  );

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const abrirModalIdioma = () => {
    setOpen(false);
    setLanguageModalOpen(true);
  };

  const cerrarModalIdioma = () => {
    setLanguageModalOpen(false);
  };

  const guardarIdioma = () => {
    localStorage.setItem("revera_idioma", selectedLanguage);
    setLanguageModalOpen(false);
  };

  return (
    <>
      <div className="floating-help-wrapper" ref={menuRef}>
        {open && (
          <div className="floating-help-menu">
            <button className="active">Aprende sobre REVERA</button>
            <button>Centro de ayuda</button>
            <button>Foro de soporte</button>
            <button>Videos de YouTube</button>
            <button>Notas de la versión</button>
            <button>Resumen legal</button>

            <div className="floating-help-divider"></div>

            <button>Preguntar a la comunidad</button>
            <button>Comunicarse con soporte</button>
            <button>Comprobar la configuración de red</button>
            <button>Denunciar abuso</button>

            <div className="floating-help-divider"></div>

            <button>Cambiar la disposición del teclado...</button>

            <button type="button" onClick={abrirModalIdioma}>
              Cambiar idioma...
            </button>
          </div>
        )}

        <button
          type="button"
          className="floating-help-button"
          aria-label="Centro de ayuda"
          onClick={() => setOpen(!open)}
        >
          <HelpCircle size={24} strokeWidth={2.1} />
        </button>
      </div>

      {languageModalOpen && (
        <div className="language-modal-overlay" onClick={cerrarModalIdioma}>
          <section
            className="language-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="language-modal-header">
              <h2>Cambiar idioma</h2>

              <button
                type="button"
                className="language-modal-close"
                onClick={cerrarModalIdioma}
                aria-label="Cerrar"
              >
                <X size={20} strokeWidth={2.1} />
              </button>
            </header>

            <div className="language-modal-body">
              <p>
                Selecciona el idioma que deseas utilizar para la app, el sitio
                web y los correos electrónicos de marketing de REVERA.
              </p>

              <div className="language-options">
                {idiomas.map((idioma) => (
                  <label key={idioma} className="language-option">
                    <input
                      type="radio"
                      name="revera-language"
                      value={idioma}
                      checked={selectedLanguage === idioma}
                      onChange={() => setSelectedLanguage(idioma)}
                    />
                    <span>{idioma}</span>
                  </label>
                ))}
              </div>
            </div>

            <footer className="language-modal-footer">
              <button
                type="button"
                className="language-cancel-button"
                onClick={cerrarModalIdioma}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="language-save-button"
                onClick={guardarIdioma}
              >
                Guardar
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

export default FloatingHelpButton;
