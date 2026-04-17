async function registrarCita(pool, DB_USER, data) {
  const {
    ac_nombre,
    ac_identificacion,
    ac_correo,
    ac_codigo_pais,
    ac_telefono,
    ac_motivo_cita,
    ac_fecha_cita,
    ac_hora_cita,
  } = data;

  const ac_estado = "A";
  const ac_usuario_crea = DB_USER;

  const sql = `
    INSERT INTO re_agenda_cita
    (
      ac_nombre,
      ac_identificacion,
      ac_correo,
      ac_codigo_pais,
      ac_telefono,
      ac_motivo_cita,
      ac_estado,
      ac_fecha_cita,
      ac_hora_cita,
      ac_usuario_crea
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    ac_nombre,
    ac_identificacion,
    ac_correo,
    ac_codigo_pais,
    ac_telefono,
    ac_motivo_cita,
    ac_estado,
    ac_fecha_cita,
    ac_hora_cita,
    ac_usuario_crea,
  ];

  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve({
        insertId: result.insertId,
        affectedRows: result.affectedRows,
      });
    });
  });
}

async function obtenerCorreosNotificacion(pool) {
  const query = `
    SELECT DISTINCT ce.co_correo
    FROM re_usuario u
    INNER JOIN re_correo_electronico ce
      ON u.us_persona_id = ce.co_persona_id
    WHERE u.us_estado = 'A'
      AND u.us_atiende_clientes = 'S'
      AND ce.co_principal = 'S'
      AND ce.co_estado = 'A'
      AND ce.co_correo IS NOT NULL
      AND ce.co_correo <> ''
  `;

  return new Promise((resolve, reject) => {
    pool.query(query, (err, rows) => {
      if (err) {
        return reject(err);
      }

      resolve(rows.map((r) => r.co_correo));
    });
  });
}

async function existeCitaActivaEnHorario(pool, ac_fecha_cita, ac_hora_cita) {
  const query = `
    SELECT COUNT(*) AS total
    FROM re_agenda_cita
    WHERE ac_fecha_cita = ?
      AND ac_hora_cita = ?
      AND ac_estado = 'A'
  `;

  return new Promise((resolve, reject) => {
    pool.query(query, [ac_fecha_cita, ac_hora_cita], (err, rows) => {
      if (err) {
        return reject(err);
      }

      resolve(rows[0].total > 0);
    });
  });
}

async function obtenerHorariosOcupadosPorFecha(pool, ac_fecha_cita) {
  const query = `
    SELECT ac_hora_cita
    FROM re_agenda_cita
    WHERE ac_fecha_cita = ?
      AND ac_estado = 'A'
    ORDER BY ac_hora_cita
  `;

  console.log("Entró a obtenerHorariosOcupadosPorFecha");
  console.log("Fecha a consultar:", ac_fecha_cita);

  return new Promise((resolve, reject) => {
    pool.query(query, [ac_fecha_cita], (err, rows) => {
      console.log("Callback de obtenerHorariosOcupadosPorFecha ejecutado");

      if (err) {
        console.log("Error en obtenerHorariosOcupadosPorFecha:", err);
        return reject(err);
      }

      console.log("Rows obtenidas en horarios:", rows);

      resolve(rows.map((r) => r.ac_hora_cita));
    });
  });
}

module.exports = {
  registrarCita,
  obtenerCorreosNotificacion,
  existeCitaActivaEnHorario,
  obtenerHorariosOcupadosPorFecha,
};