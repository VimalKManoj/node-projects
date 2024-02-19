const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./Routes/tourRouter');
const userRouter = require('./Routes/userRouter');
const AppError = require('./utils/appErrors');
const errorController = require('./Controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

//GLOBAL MIDDLEWARES

app.use(helmet());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
    ],
  }),
);

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , try again after 1hr!',
});

app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// CREATING OUR OWN MIDDLEWARES
app.use((req, res, next) => {
  console.log('Hello from middleware');
  next();
});

// ROUTERS

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// HANDLING INVALID ROUTES

app.all('*', (req, res, next) => {
  // const err = new Error(`can't find  ${req.originalUrl} on this server`);
  // err.statusCode = 404;
  // err.status = 'fail';

  next(new AppError(`can't find  ${req.originalUrl} on this server`, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWARE

app.use(errorController);

module.exports = app;

// app.get('/api/v1/tours', getAllTours);

// app.get('/api/v1/tours/:id', getTour);

// app.post('/api/v1/tours', createTour);

// app.patch('/api/v1/tours/:id',updateTour);

// app.delete('/api/v1/tours/:id',deleteTour);
