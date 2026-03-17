require("dotenv").config()

const express = require("express")
const cors = require("cors")

const citasRoutes = require("./routes/citasRoutes")

const app = express()

/* MIDDLEWARES */

app.use(cors({
  origin: "http://localhost:5173"
}))

app.use(express.json())

/* RUTA DE PRUEBA */

app.get("/", (req, res) => {
  res.send("API REVERA funcionando")
})

/* ROUTES */

app.use("/api", citasRoutes)

/* SERVIDOR */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor puerto ${PORT}`)
})