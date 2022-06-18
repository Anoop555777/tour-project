const express = require('express');
const path = require('path');
const morgan = require('morgan');
const app = express();
const tourRoute = require('./routes/tourRoutes');
const userRoute = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const reviewRoute = require('./routes/reviewRoutes');
const bookingRoute = require('./routes/bookingRoutes');
const appError = require('./utils/appError');
const globalError = require('./Controller/errorController');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//Middleware

app.use(cors());

app.options('*', cors());
//set security http headers
app.use(helmet());

//Developmrnt logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//rate limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'to many request from this IP, please try again in an hour',
});

app.use('/api', limiter);

//body parse req.body
app.use(express.json({ limit: '10kb' }));

app.use(cookieParser());

//data sanitization based on nosql queries
app.use(mongoSanitize());
//data sanitization xss
app.use(xss());
//serving static files

//prevent parameter pollution

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(express.static(`${__dirname}/public`));

// app.get('/', (req, res) => {
//   //res.status(200).send('hello to the server running at port 8000');

//   res.status(200).json({
//     message: 'hello to the server running at port 8000',
//     app: 'Natous ',
//   });
// });

// app.use((req, res, next) => {
//   console.log('its a middleware');
//   next();
// });
app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

//router handling

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTours);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//4 routers
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRoute);

app.use('/api/v1/users', userRoute);

app.use('/api/v1/reviews', reviewRoute);

app.use('/api/v1/bookings', bookingRoute);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message: `cant find any route for ${req.originalUrl} this server`,
  // });
  //2 method
  // const err = new Error(
  //   `cant find any route for ${req.originalUrl} this server`
  // );
  // err.status = 'failed';
  // err.statusCode = 404;
  next(
    new appError(`cant find any route for ${req.originalUrl} this server`, 404)
  );
});

app.use(globalError);

module.exports = app;
