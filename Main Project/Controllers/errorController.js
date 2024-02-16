const AppError = require('../utils/appErrors');

const handleCastError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateError = (err) => {
  const message = `Duplicate field value please check the input`;

  return new AppError(message, 400);
};

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    err: err,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
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

    sendErrProd(error, res);
  }
};
