const express = require('express');
const reviewController = require('./../Controllers/reviewController');
const authControllers = require('./../Controllers/authController');

// ALLOWS MERGE PARAMS IN THIS ROUTER
const router = express.Router({ mergeParams: true });

router.use(authControllers.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authControllers.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .delete(
    authControllers.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  )
  .patch(
    authControllers.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .get(reviewController.getReview);

module.exports = router;
