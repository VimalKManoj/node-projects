const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const tourRouter = require('./Routes/tourRouter');
const userRouter = require('./Routes/userRouter');
const reviewRouter = require('./Routes/reviewRouter');
const viewRouter = require('./Routes/viewRouter');
const bookingRouter = require('./Routes/bookingRouter');
const AppError = require('./utils/appErrors');
const errorController = require('./Controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//GLOBAL MIDDLEWARES

//SERVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// SETTING SPECIAL HEADERS
app.use(helmet());

// DATA SANITIZATION AGAINST NOsql DATA INJECTION
app.use(mongoSanitize());

// SANITIZATION AGAINST XSS REMOVE DANGER JS FROM REQ
app.use(xss());

// REMOVE PARAMETER POLLUTION
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

// BODY PARSER , READIND BODY FROM DATA TO REQ.BODY
app.use(express.json());
app.use(cookieParser());

// LIMIT REQUESTS FROM SAME IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , try again after 1hr!',
});

app.use('/api', limiter);

// LOGGER
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// CREATING OUR OWN MIDDLEWARES
app.use((req, res, next) => {
  console.log('Hello from middleware');
  next();
});

// ROUTERS

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings',bookingRouter),

// HANDLING INVALID ROUTES

app.all('*', (req, res, next) => {
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
