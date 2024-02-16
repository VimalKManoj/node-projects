const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./Routes/tourRouter');
const userRouter = require('./Routes/userRouter');
const AppError = require('./utils/appErrors');
const errorController = require('./Controllers/errorController');

const app = express();

// MIDDLEWARES 

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

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
