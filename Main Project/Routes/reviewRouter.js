const express = require('express');
const reviewController = require('./../Controllers/reviewController');
const authControllers = require('./../Controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authControllers.protect,
    authControllers.restrictTo('user'),
    reviewController.createReview,
  );

module.exports = router;
