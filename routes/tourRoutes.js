const express = require('express');
const toursController = require('./../Controller/toursController');
const authController = require('./../Controller/authController');
const reviewController = require('./../Controller/reviewController');
const route = express.Router();

const reviewRouter = require('./../routes/reviewRoutes');

route.use('/:tourId/reviews', reviewRouter);

//route.param('id', toursController.checkId);

//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

route
  .route('/top-5-cheap')
  .get(toursController.alaisTopTour, toursController.getAllTours);

route.route('/tour-stats').get(toursController.getAllStats);

route
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.getMontlyPlan
  );

route
  .route('/')
  .get(toursController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.createTour
  );
route
  .route('/:id')
  .get(toursController.getTours)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.uploadTourImages,
    toursController.resizeTourImages,
    toursController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    toursController.deleteTour
  );

//

module.exports = route;
