const express = require("express")
const {
  crearCita,
  consultarHorariosDisponibles,
  probarBackend
} = require("../controllers/citasController")

const router = express.Router()

router.get("/test", probarBackend)
router.get("/citas/horarios-disponibles", consultarHorariosDisponibles)
router.post("/citas", crearCita)

module.exports = router