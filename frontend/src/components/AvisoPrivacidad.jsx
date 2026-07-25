import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/aviso-privacidad.css";

function AvisoPrivacidad() {
  return (
    <div className="aviso-page">
      <Navbar />

      <main className="aviso-container">
        <h1>Aviso de Privacidad</h1>

        <section>
          <h2>Identidad y Domicilio del Responsable</h2>
          <p>
            REVERA, con domicilio en [Dirección completa], es responsable del
            tratamiento de sus datos personales. Nos comprometemos a proteger su
            información y a garantizar su privacidad en todo momento.
          </p>
        </section>

        <section>
          <h2>Datos Personales que Recabamos</h2>
          <p>
            Para las finalidades señaladas en el presente aviso de privacidad,
            podemos recabar sus datos personales de distintas formas:
          </p>

          <ul>
            <li>Cuando nos los proporciona directamente a través de nuestro sitio web</li>
            <li>Cuando solicita información sobre nuestros servicios</li>
            <li>Cuando programa una cita o asesoría</li>
            <li>Durante el proceso de registro de marca</li>
          </ul>

          <p>
            Los datos personales que recabamos incluyen: nombre completo, correo
            electrónico, número telefónico, información de la empresa o marca, y
            cualquier otra información relevante para la prestación de nuestros
            servicios.
          </p>
        </section>

        <section>
          <h2>Finalidades del Tratamiento de Datos</h2>
          <p>
            Los datos personales que recabamos serán utilizados para las
            siguientes finalidades:
          </p>

          <ul>
            <li>Prestar los servicios de registro de marcas solicitados</li>
            <li>Realizar estudios de registrabilidad</li>
            <li>
              Proporcionar asesoría personalizada en materia de propiedad
              intelectual
            </li>
            <li>Contactarlo para agendar citas y dar seguimiento a su solicitud</li>
            <li>
              Enviarle información relevante sobre el proceso de registro de su
              marca
            </li>
            <li>Mejorar nuestros servicios y la experiencia del usuario</li>
          </ul>
        </section>

        <section>
          <h2>Transferencia de Datos Personales</h2>
          <p>
            Sus datos personales no serán transferidos a terceros sin su
            consentimiento, excepto en los casos previstos por la ley o cuando
            sea necesario para la prestación de nuestros servicios, por ejemplo,
            con autoridades competentes en materia de propiedad intelectual.
          </p>
        </section>

        <section>
          <h2>Derechos ARCO</h2>
          <p>
            Usted tiene derecho a conocer qué datos personales tenemos de usted,
            para qué los utilizamos y las condiciones del uso que les damos
            (Acceso). Asimismo, es su derecho solicitar la corrección de su
            información personal en caso de que esté desactualizada, sea inexacta
            o incompleta (Rectificación); que la eliminemos de nuestros registros
            o bases de datos cuando considere que la misma no está siendo
            utilizada conforme a los principios, deberes y obligaciones previstas
            en la normativa (Cancelación); así como oponerse al uso de sus datos
            personales para fines específicos (Oposición).
          </p>

          <p>
            Para ejercer sus derechos ARCO, puede enviar un correo electrónico a
            [correo@revera.com] con el asunto "Derechos ARCO".
          </p>
        </section>

        <section>
          <h2>Modificaciones al Aviso de Privacidad</h2>
          <p>
            Nos reservamos el derecho de efectuar en cualquier momento
            modificaciones o actualizaciones al presente aviso de privacidad.
            Estas modificaciones estarán disponibles en nuestro sitio web y se
            notificarán a través de los medios de contacto que nos haya
            proporcionado.
          </p>
        </section>

        <section>
          <h2>Consentimiento</h2>
          <p>
            Al proporcionar sus datos personales a través de nuestro sitio web o
            cualquier otro medio, usted acepta y consiente que sus datos
            personales sean tratados conforme a los términos y condiciones del
            presente aviso de privacidad.
          </p>
        </section>

        <p className="aviso-last-update">Última actualización: Mayo 2026</p>
      </main>

      <Footer />
    </div>
  );
}

export default AvisoPrivacidad;