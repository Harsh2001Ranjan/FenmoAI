const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

/**
 * Ensures the logs directory exists on server startup.
 * Why? Writing to a non-existent file path will crash the Node process.
 * We use sync methods here because this is a one-time setup on boot.
 */
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Why a Stream? Standard fs.appendFile is less efficient for high-frequency logs.
// A WriteStream manages the internal buffer and file handle more effectively.
const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), { flags: "a" });

/**
 * Custom Morgan token for precise response time tracking.
 * Why? The default ':response-time' token averages; this custom token 
 * uses process.hrtime for nanosecond precision, helping identify micro-bottlenecks.
 */
morgan.token("response-time-ms", (req, res) => {
  if (!res._header || !req._startAt) return "";
  const diff = process.hrtime(req._startAt);
  const time = diff[0] * 1e3 + diff[1] * 1e-6;
  return time.toFixed(3);
});

/**
 * Centralised Logger Middleware.
 * Why? Morgan handles standard HTTP logging, while our custom middleware 
 * tracks "Slow Requests" (>500ms) to alert developers to performance regressions 
 * during development and production.
 */
const logger = () => {
  return [
    // Dev-friendly console logging (colors + status).
    morgan("dev"),
    
    // Disk-based logging for historical audits and traffic analysis.
    morgan(":method :url :status :res[content-length] - :response-time-ms ms", { stream: accessLogStream }),
    
    // Reactive Performance Monitor.
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
