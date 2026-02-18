const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const expenseRoutes = require("./routes/expenseRoutes");
const { globalLimiter, writeLimiter } = require("./middleware/rateLimiter");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger()); // Application logging + Performance monitoring
app.use(globalLimiter);

// Routes
app.use("/api/expenses", writeLimiter, expenseRoutes);

app.get("/api/health", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];

  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    db: dbStates[mongoose.connection.readyState] || "unknown",
    memoryUsage: {
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
    },
    version: process.version,
  });
});

// Production: Serve static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
  });
}

// Global Error Handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

module.exports = app;
