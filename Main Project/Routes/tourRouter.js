const express = require('express');

const router = express.Router();

const tourControllers = require('./../Controllers/tourController');

// router.param('id', tourControllers.checkID);

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
