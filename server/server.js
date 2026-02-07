const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");

// Import custom modules

// Import routes
console.log("Importing nasaRoutes...");
const nasaRoutes = require("./routes/nasaRoutes");
console.log("✓ nasaRoutes imported");

console.log("Importing interventionRoutes...");
const interventionRoutes = require("./routes/interventionRoutes");
console.log("✓ interventionRoutes imported");

console.log("Importing cityRoutes...");
const cityRoutes = require("./routes/cityRoutes");
console.log("✓ cityRoutes imported");

console.log("Importing analysisRoutes...");
const analysisRoutes = require("./routes/analysisRoutes"); //needed for current situation analysis
console.log("✓ analysisRoutes imported");

console.log("✓ All modules imported successfully");

const airQualityRoutes = require('./routes/airQualityRoutes');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
console.log("✓ Express app created");

// Security middleware
console.log("Setting up security middleware...");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          "https://api.nasa.gov",
          "https://gpm.nasa.gov",
          "https://lpdaac.usgs.gov",
        ],
      },
    },
  })
);
console.log("✓ Security middleware configured");

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// NASA API specific rate limiting (stricter)
const nasaLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 NASA API requests per minute
  message: {
    error:
      "NASA API rate limit exceeded. Please wait before making more requests.",
  },
});
app.use("/api/nasa/", nasaLimiter);

// Middleware
app.use(compression());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["http://localhost:3000", "https://urbanome-xi.vercel.app"]
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "https://urbanome-xi.vercel.app"
          ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "NASA Healthy Cities Server is running",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()),
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "NASA Healthy Cities API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      nasa: {
        temperature: "GET /api/nasa/temperature",
        precipitation: "GET /api/nasa/precipitation",
        vegetation: "GET /api/nasa/vegetation",
        elevation: "GET /api/nasa/elevation",
        airQuality: "GET /api/nasa/air-quality",
        riskIndices: "GET /api/nasa/risk-indices",
      },
      cities: {
        list: "GET /api/cities",
        details: "GET /api/cities/:id",
        search: "GET /api/cities/search",
      },
      interventions: {
        types: "GET /api/interventions/types",
        calculate: "POST /api/interventions/calculate",
        optimize: "POST /api/interventions/optimize",
      },
      analysis: {
        costBenefit: "POST /api/analysis/cost-benefit",
        riskAssessment: "POST /api/analysis/risk-assessment",
        policyBrief: "POST /api/analysis/policy-brief",
      },
    },
    documentation: "/api/docs",
  });
});

// API Routes
app.use("/api/nasa", nasaRoutes);
app.use("/api/interventions", interventionRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/analysis", analysisRoutes);

app.use('/api/air', airQualityRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The requested route ${req.originalUrl} was not found on this server.`,
    availableEndpoints: "/api",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 NASA Healthy Cities Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("🌍 Ready to serve NASA Earth observation data!");
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
});

module.exports = app;
// 1. Import the HRI Route (Place this with your other imports)
console.log("Importing hriRoutes...");
const hriRoutes = require("./routes/hriRoutes.js"); 
console.log("✓ hriRoutes imported");

// ... (keep all your existing middleware, helmet, cors, etc.)

// 2. Update the API Documentation endpoint (Optional but recommended)
app.get("/api", (req, res) => {
  res.json({
    message: "Aheadly: Smart Public Health API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      hri: {
        wardRisk: "GET /api/hri/ward-risk/:id", // New HRI endpoint
        cityOverview: "GET /api/hri/overview",
      },
      // ... (keep existing documentation entries)
    }
  });
});

// 3. Register the HRI API Route (Place this with app.use("/api/nasa", ...))
app.use("/api/hri", hriRoutes); // Unified path for all Health Risk Index data

// ... (keep the rest of your file: static files, 404 handler, and server start logic)