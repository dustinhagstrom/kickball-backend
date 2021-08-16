const ErrorMessageHandlerClass = require("./ErrorMessageHandlerClass");

function dispatchErrorDevelopment(error, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: error.stack,
    });
  }
}

function dispatchErrorProduction(error, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack,
      });
    }
    return res.status(error.statusCode).json({
      status: "Error",
      message:
        "Something went Wrong. Please contact support at 111-222-3333 or email us at dd@dmail.com",
    });
  }
}

function handleMongoDBDuplicate(error) {
  let errorMessageDuplicateKey = Object.keys(error.keyValue)[0];

  let errorMessageDuplicateValue = Object.values(error.keyValue)[0];
  let message = `${errorMessageDuplicateKey} - ${errorMessageDuplicateValue} is taken. Please choose another one.`;
  return new ErrorMessageHandlerClass(message, 400);
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  let error = { ...err };
  error.message = err.message;

  if (error.code === 11000 || error.code === 11001) {
    error = handleMongoDBDuplicate(error);
  }

  if (process.env.NODE_ENV === "development") {
    dispatchErrorDevelopment(error, req, res);
  } else {
    dispatchErrorProduction(error, req, res);
  }
};
