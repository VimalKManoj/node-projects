const AppError = require('../utils/appErrors');

// ERROR HANDLING FOR EACH KIND OF ERRORS
const handleCastError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
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

const sendErrDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // RENDERED WEBSITE
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

// ERROR MESSAGE FOR PRODUCTION

const sendErrProd = (err, req, res) => {
  // API
  const url = req.originalUrl || '';
  if (url.startsWith('/api')) {
    // OPERATIONAL
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // UNKNOWN ERROR
    } else {
      console.log('ERROR', err);
      // SEND GENERIC MESSAGE
      return res.json({
        status: 'Fail',
        message: 'Something went wrong!',
      });
    }
  }
  // RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      message: err.message,
    });

    // UNKNOWN ERROR
  } else {
    console.log('ERROR', err);

    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      message: 'Try again later',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = ExpiredError(error);

    sendErrProd(error, req, res);
  }
};
