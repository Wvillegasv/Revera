require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const citasRoutes = require("./routes/citasRoutes");
const estudioRegistrabilidadRoutes = require("./routes/estudioRegistrabilidadRoutes");
const registroMarcaRoutes = require("./routes/registroMarcaRoutes");
const articulosRoutes = require("./routes/articulosRoutes");
const articulosAdminRoutes = require("./routes/articulosAdminRoutes");
const radiografiaMarcaRoutes = require("./routes/radiografiaMarcaRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

const appEnv = String(process.env.APP_ENV || "").toLowerCase();
const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
const usaProxySeguro =
  nodeEnv === "production" || appEnv === "production" || appEnv === "staging";

if (usaProxySeguro) {
  app.set("trust proxy", 1);
}

/* =========================================
   ORÍGENES PERMITIDOS
========================================= */

const allowedOrigins = [
  "http://localhost:1573",
  "http://127.0.0.1:1573",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://revera-omega.vercel.app",
  "https://test.revera.com",
  "https://decency-womb-pulsate.ngrok-free.dev",
  process.env.FRONTEND_URL,
].filter(Boolean);

/* =========================================
   CORS
========================================= */

const corsOptions = {
  origin(origin, callback) {
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

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

/* =========================================
   BODY PARSERS Y COOKIES
========================================= */

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

/* =========================================
   STATIC FILES
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
   AUTENTICACIÓN CMS
========================================= */

app.use("/api/auth", authRoutes);

/* =========================================
   RUTAS PÚBLICAS / FUNCIONALES
========================================= */

app.use("/api", citasRoutes);
app.use("/api", estudioRegistrabilidadRoutes);
app.use("/api", registroMarcaRoutes);
app.use("/api", articulosRoutes);
app.use("/api", radiografiaMarcaRoutes);
app.use("/api", articulosAdminRoutes);

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
  console.log("Rutas de autenticación CMS: ACTIVAS");
});
