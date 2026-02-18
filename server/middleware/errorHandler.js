/**
 * Centralised Error Handling Middleware.
 * Why? Instead of scattered try/catch blocks that return inconsistent formats, 
 * this middleware ensures every error (400, 404, 500) follows a standard JSON structure.
 * It also protects sensitive engineering data by hiding stack traces in production.
 */
const errorHandler = (err, req, res, next) => {
  // If the status is still 200 but an error reached here, it's an unhandled 500.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Why log the body? For debugging POST/PUT failures, knowing exactly what 
  // the client sent is critical for reproduction. 
  // CAUTION: In a real production apps with PII, sensitive fields should be masked here.
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
    message: err.message,
    // Why the pancake emoji? A visual indicator that we've flattened the error 
    // for production to prevent leaking server internals (Source Code paths, etc).
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    body: req.body, 
  });

  res.status(statusCode).json({
    message: err.message,
    // Client-side debugging is enabled only in development.
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
