const express = require('express');
const tourControllers = require('./../Controllers/tourController');

const router = express.Router();
// router.param('id', tourControllers.checkID);

router.route('/tour-stats').get(tourControllers.getTourStats);
router.route('/monthly-plan/:year').get(tourControllers.getMonthlyPlans);

router
  .route('/top-5-tours')
  .get(tourControllers.aliasTours, tourControllers.getAllTours);

router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(tourControllers.createTour);

// tourControllers.checkBody,

router
  .route('/:id')
  .patch(tourControllers.updateTour)
  .get(tourControllers.getTour)
  .delete(tourControllers.deleteTour);

module.exports = router;
