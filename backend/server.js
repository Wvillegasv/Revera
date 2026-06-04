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

/* =========================================
   ORÍGENES PERMITIDOS
========================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://revera-omega.vercel.app",
  "https://test.revera.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

/* =========================================
   CORS
========================================= */

const corsOptions = {
  origin(origin, callback) {
    /*
      Permitir requests sin origin:
      - Postman
      - navegador directo
      - proxy interno de Vite
      - health checks
    */
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn("CORS bloqueado para origin:", origin);

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "ngrok-skip-browser-warning",
  ],

  credentials: true,

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

/*
  Manejo seguro de preflight OPTIONS.
  Evitamos app.options("*") porque puede fallar en algunas versiones.
*/
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* =========================================
   BODY PARSERS
========================================= */

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* =========================================
   STATIC FILES
   Permite servir imágenes desde:
   /uploads/...
========================================= */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================
   TEST / HEALTH CHECK
========================================= */

app.get("/", (req, res) => {
  res.send("API REVERA funcionando");
});

app.get("/api/test", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Backend conectado",
    entorno: process.env.APP_ENV || process.env.NODE_ENV || "local",
  });
});

/* =========================================
   ROUTES PÚBLICAS / FUNCIONALES
========================================= */

app.use("/api", citasRoutes);
app.use("/api", estudioRegistrabilidadRoutes);
app.use("/api", registroMarcaRoutes);
app.use("/api", articulosRoutes);
app.use("/api", radiografiaMarcaRoutes);
app.use("/api", articulosAdminRoutes);


// app.use("/api", articulosAdminRoutes);

/* =========================================
   404 API
========================================= */

app.use("/api", (req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: "Ruta API no encontrada",
    path: req.originalUrl,
  });
});

/* =========================================
   ERROR HANDLER
========================================= */

app.use((err, req, res, next) => {
  console.error("Error backend REVERA:", err.message);

  if (
    err.message?.includes("CORS") ||
    err.message?.includes("Origen no permitido")
  ) {
    return res.status(403).json({
      ok: false,
      mensaje: err.message,
    });
  }

  return res.status(err.status || 500).json({
    ok: false,
    mensaje: err.message || "Error interno del servidor",
  });
});

/* =========================================
   START SERVER
========================================= */

app.listen(PORT, () => {
  console.log(`Servidor puerto ${PORT}`);
  console.log(
    `Entorno: ${process.env.APP_ENV || process.env.NODE_ENV || "local"}`
  );
  console.log("Origins permitidos:", allowedOrigins);
  console.log("Rutas admin de artículos: DESACTIVADAS TEMPORALMENTE");
});