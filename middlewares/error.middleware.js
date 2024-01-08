class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorMiddleware = (err, req, res, next) => {
  const message = err.message || "Internal server errror";
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    result: {},
    success: false,
    message: message,
  });
};

export default ErrorHandler;
export { errorMiddleware };
