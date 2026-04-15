require("dotenv").config();

const express = require("express");
const cors = require("cors");

const citasRoutes = require("./routes/citasRoutes");
const estudioRegistrabilidadRoutes = require("./routes/estudioRegistrabilidadRoutes");
const registroMarcaRoutes = require("./routes/registroMarcaRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

/* MIDDLEWARES */
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

/* RUTA DE PRUEBA */
app.get("/", (req, res) => {
  res.send("API REVERA funcionando");
});

/* ROUTES */
app.use("/api", citasRoutes);
app.use("/api", estudioRegistrabilidadRoutes);
app.use("/api", registroMarcaRoutes);

/* SERVIDOR */
app.listen(PORT, () => {
  console.log(`Servidor puerto ${PORT}`);
});


