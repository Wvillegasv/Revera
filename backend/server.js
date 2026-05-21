require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const citasRoutes = require("./routes/citasRoutes");
const estudioRegistrabilidadRoutes = require("./routes/estudioRegistrabilidadRoutes");
const registroMarcaRoutes = require("./routes/registroMarcaRoutes");
const articulosRoutes = require("./routes/articulosRoutes");
const articulosAdminRoutes = require("./routes/articulosAdminRoutes");
const radiografiaMarcaRoutes = require("./routes/radiografiaMarcaRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://revera-omega.vercel.app",
  "https://test.revera.com",
];

/* =========================================
   CORS MANUAL
========================================= */

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, ngrok-skip-browser-warning"
  );

  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* =========================================
   CORS EXPRESS
========================================= */

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "ngrok-skip-browser-warning",
  ],
  credentials: true,
}));

/* =========================================
   JSON
========================================= */

app.use(express.json());

/* =========================================
   STATIC FILES
========================================= */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* =========================================
   TEST
========================================= */

app.get("/", (req, res) => {
  res.send("API REVERA funcionando");
});

app.get("/api/test", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Backend conectado",
  });
});

/* =========================================
   ROUTES
========================================= */

app.use("/api", citasRoutes);
app.use("/api", estudioRegistrabilidadRoutes);
app.use("/api", registroMarcaRoutes);
app.use("/api", articulosRoutes);
app.use("/api", articulosAdminRoutes);
app.use("/api", radiografiaMarcaRoutes);

/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {
  console.log(`Servidor puerto ${PORT}`);
});
