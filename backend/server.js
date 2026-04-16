require("dotenv").config();

const express = require("express");
const cors = require("cors");

const citasRoutes = require("./routes/citasRoutes");
const estudioRegistrabilidadRoutes = require("./routes/estudioRegistrabilidadRoutes");
const registroMarcaRoutes = require("./routes/registroMarcaRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://revera-omega.vercel.app",
  "https://test.revera.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

/* MIDDLEWARES */
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

/* RUTA DE PRUEBA */
app.get("/", (req, res) => {
  res.send("API REVERA funcionando");
});

app.get("/api/test", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Backend conectado",
  });
});

/* ROUTES */
app.use("/api", citasRoutes);
app.use("/api", estudioRegistrabilidadRoutes);
app.use("/api", registroMarcaRoutes);

/* SERVIDOR */
app.listen(PORT, () => {
  console.log(`Servidor puerto ${PORT}`);
});
