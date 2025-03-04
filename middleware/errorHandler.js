const { constants } = require("../constants");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode);
  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.json({
        title: "Validation Failed",
        message: err.message,
        method: req.method,
        path: req.originalUrl,
        stackTrace:
          process.env.NODE_ENV === "Production" ? "undefined" : err.stack,
      });
      break;
    case constants.NOT_FOUND:
      res.json({
        title: "Not Found",
        message: err.message,
        method: req.method,
        path: req.originalUrl,
        stackTrace:
          process.env.NODE_ENV === "Production" ? "undefined" : err.stack,
      });
      break;
    case constants.UNAUTHOURIZED:
      res.json({
        title: "Unauthorized",
        message: err.message,
        method: req.method,
        path: req.originalUrl,
        stackTrace:
          process.env.NODE_ENV === "Production" ? "undefined" : err.stack,
      });
      break;
    case constants.FORBIDDEN:
      res.json({
        title: "Forbidden",
        message: err.message,
        method: req.method,
        path: req.originalUrl,
        stackTrace:
          process.env.NODE_ENV === "Production" ? "undefined" : err.stack,
      });
      break;
    case constants.SERVER_EERROR:
      res.json({
        title: "Server Error",
        message: err.message,
        method: req.method,
        path: req.originalUrl,
        stackTrace:
          process.env.NODE_ENV === "Production" ? "undefined" : err.stack,
      });
      break;
    default:
      res.json({
        title: "Unknown Error",
        message: err.message,
        method: req.method,
        path: req.originalUrl,
        stackTrace:
          process.env.NODE_ENV !== "production" ? err.stack : undefined,
      });
  }
};

module.exports = errorHandler;
