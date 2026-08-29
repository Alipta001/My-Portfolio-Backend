require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// ======================================================
// CONFIG
// ======================================================

const connectDatabase = require("./src/config/db");

// ======================================================
// ROUTES
// ======================================================

const apiRoutes = require("./src/routes/api");
const adminRoutes = require("./src/routes/admin");

// ======================================================
// ERROR MIDDLEWARE
// ======================================================

const {
  notFound,
  errorHandler,
} = require("./src/middleware/error");

// ======================================================
// ENVIRONMENT VARIABLES
// ======================================================

const PORT = process.env.PORT || 5000;

// ======================================================
// ENVIRONMENT VALIDATION
// ======================================================

const requiredEnvVariables = [
  "MONGODB_URI",
  "FRONTEND_URL",
  "SESSION_SECRET",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    console.warn(`⚠️ Missing environment variable: ${variable}`);
  }
}

// ======================================================
// APP INITIALIZATION
// ======================================================

const app = express();

app.set("trust proxy", 1);
// ======================================================
// VIEW ENGINE
// ======================================================

app.set("view engine", "ejs");

app.set(
  "views",
  path.join(__dirname, "src", "views")
);

// ======================================================
// SECURITY
// ======================================================

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ======================================================
// BODY PARSERS
// ======================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ======================================================
// STATIC FILES
// ======================================================

app.use(
  express.static(
    path.join(__dirname, "src", "public")
  )
);

// ======================================================
// SESSION CONFIGURATION
// ======================================================

const sessionOptions = {
  secret: process.env.SESSION_SECRET,

  resave: false,

  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
  }),

  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8,
  },
};

app.use(session(sessionOptions));

// ======================================================
// MONGODB SESSION STORE
// ======================================================

sessionOptions.store = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  collectionName: "sessions",
});

app.use(session(sessionOptions));

// ======================================================
// GLOBAL EJS VARIABLES
// ======================================================

app.use((req, res, next) => {
  res.locals.admin = req.session?.admin || null;

  next();
});

// ======================================================
// ROUTES
// ======================================================

// API Routes
app.use("/api", apiRoutes);

// EJS Admin Routes
app.use("/admin", adminRoutes);

// ======================================================
// ROOT ROUTE
// ======================================================

// Redirect the main Render URL to the EJS Admin Panel
app.get("/", (_req, res) => {
  res.redirect("/admin");
});

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    data: [],
  });
});

// ======================================================
// ERROR HANDLING
// ======================================================

app.use(notFound);

app.use(errorHandler);

// ======================================================
// CONNECT DATABASE
// ======================================================

connectDatabase()
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((error) => {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
  });

// ======================================================
// START SERVER
// ======================================================

const server = app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  }
);

// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================

function shutdown(signal) {
  console.log(`\n⚠️ ${signal} received. Shutting down gracefully...`);

  server.close(() => {
    console.log("✅ HTTP server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});
