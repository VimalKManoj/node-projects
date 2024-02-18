const AppError = require('../utils/appErrors');

// ERROR HANDLING FOR EACH KIND OF ERRORS
const handleCastError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateError = (err) => {
  const message = `Duplicate field value please check the input`;

  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const error = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid data , ${error.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid token , Please login again', 401);

const ExpiredError = () =>
  new AppError('Token Expired please login again', 401);

  // ERROR MESSAGE FOR DEV

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    err: err,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

// ERROR MESSAGE FOR PRODUCTION

const sendErrProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // UNKNOWN ERROR
  } else {
    console.log('ERROR', err);

    res.json({
      status: 'Fail',
      message: 'Something went wrong!',
    });
  }
};



module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    error = { ...err };

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = ExpiredError(error);

    sendErrProd(error, res);
  }
};
