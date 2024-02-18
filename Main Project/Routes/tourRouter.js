const express = require('express');
const tourControllers = require('./../Controllers/tourController');
const authControllers = require('./../Controllers/authController');

const router = express.Router();
// router.param('id', tourControllers.checkID);

router.route('/tour-stats').get(tourControllers.getTourStats);
router.route('/monthly-plan/:year').get(tourControllers.getMonthlyPlans);

router
  .route('/top-5-tours')
  .get(tourControllers.aliasTours, tourControllers.getAllTours);

router
  .route('/')
  .get(authControllers.protect, tourControllers.getAllTours)
  .post(tourControllers.createTour);

// tourControllers.checkBody,

router
  .route('/:id')
  .patch(tourControllers.updateTour)
  .get(tourControllers.getTour)
  .delete(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour,
  );

module.exports = router;
