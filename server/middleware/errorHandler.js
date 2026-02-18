const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error details
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    body: req.body, // Log request body for debugging (be careful with sensitive data in prod)
  });

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
