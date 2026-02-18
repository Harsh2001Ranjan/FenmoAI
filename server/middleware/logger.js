const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Stream for accessing log file
const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), { flags: "a" });

// Custom format for performance monitoring
morgan.token("response-time-ms", (req, res) => {
  if (!res._header || !req._startAt) return "";
  const diff = process.hrtime(req._startAt);
  const time = diff[0] * 1e3 + diff[1] * 1e-6;
  return time.toFixed(3);
});

// Middleware factory
const logger = () => {
  return [
    // Console logger (dev friendly)
    morgan("dev"),
    
    // File logger (production ready)
    morgan(":method :url :status :res[content-length] - :response-time-ms ms", { stream: accessLogStream }),
    
    // Performance monitor
    (req, res, next) => {
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        if (duration > 500) {
          console.warn(`[SLOW REQUEST] ${req.method} ${req.originalUrl} took ${duration}ms`);
        }
      });
      next();
    }
  ];
};

module.exports = logger;
