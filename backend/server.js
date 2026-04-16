require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const winston = require("winston");
const db = require("./database/db");
const { router: authRoutes } = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const borrowRoutes = require("./routes/borrow");
const booksRoutes = require("./routes/books");
const forgotRoutes = require("./routes/forgotPassword");

const app = express();
const port = process.env.PORT || 3001;

// ================= CRÉATION DU DOSSIER LOGS =================
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
  console.log("✅ Dossier logs créé");
}

// ================= CONFIGURATION WINSTON =================
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Ajout de la console en développement
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// ================= MIDDLEWARE DE LOG HTTP =================
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);
  });
  next();
});

// ================= CORS =================
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ================= RATE LIMITING =================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, try again later" },
});
app.use("/auth/", limiter);
app.use("/admin/", limiter);

// ================= PARSER JSON =================
app.use(express.json());

// ================= ROUTES =================
app.use("/auth", authRoutes);
app.use("/auth", forgotRoutes);
app.use("/books", booksRoutes);
app.use("/borrow", borrowRoutes);
app.use("/admin", adminRoutes);

// ================= FICHIERS STATIQUES =================
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// ================= ROUTES SIMPLES =================
app.get("/", (req, res) => {
  res.send("Backend is running securely!");
});

app.get("/users", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM users");
    res.json(results);
  } catch (err) {
    logger.error("Erreur GET /users : " + err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.get("/borrowed", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT borrow.id, users.name AS user_name, books.title AS book_title, borrow.borrow_date, borrow.return_date
      FROM borrow
      JOIN users ON borrow.user_id = users.id
      JOIN books ON borrow.book_id = books.id
    `);
    res.json(results);
  } catch (err) {
    logger.error("Erreur GET /borrowed : " + err.message);
    res.status(500).json({ error: "Failed to fetch borrowed books" });
  }
});

// ================= CRON JOB (alertes retards) =================
try {
  require("./cron/checkOverdue");
  logger.info("✅ Cron job démarré");
} catch (err) {
  logger.warn("Cron job non configuré : " + err.message);
}

// ================= DÉMARRAGE DU SERVEUR =================
app.listen(port, () => {
  logger.info(`Serveur démarré sur http://localhost:${port}`);
  console.log(`Server running on http://localhost:${port}`);
});