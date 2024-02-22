const express = require('express');
const tourControllers = require('./../Controllers/tourController');
const authControllers = require('./../Controllers/authController');
const reviewRouter = require('./../Routes/reviewRouter');

const router = express.Router();
// router.param('id', tourControllers.checkID);

// IF THIS ROUTE COMES PASSES IT TO REVIEW ROUTER
router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(tourControllers.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide', 'guide'),
    tourControllers.getMonthlyPlans,
  );

router
  .route('/tours-within/:distance/center/:latlong/unit/:unit')
  .get(tourControllers.getToursWithIn);

router
  .route('/distances/:latlong/unit/:unit')
  .get(tourControllers.getDistances);

router
  .route('/top-5-tours')
  .get(tourControllers.aliasTours, tourControllers.getAllTours);

router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.createTour,
  );

// tourControllers.checkBody,

router
  .route('/:id')
  .patch(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.updateTour,
  )
  .get(tourControllers.getTour)
  .delete(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour,
  );

// router
//   .route('/:tourId/reviews')
//   .post(
//     authControllers.protect,
//     authControllers.restrictTo('user'),
//     reviewControllers.createReview,
//   );

module.exports = router;
