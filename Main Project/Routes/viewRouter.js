const express = require('express');
const viewController = require('../Controllers/viewController');
const authController = require('../Controllers/authController');
const bookingController = require('../Controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBooking,
  authController.isLoggedIn,
  viewController.getOverview,
);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/login', authController.isLoggedIn, viewController.login);

router.get('/me', authController.protect, viewController.getAccount);

router.get('/my-tours', authController.protect, viewController.getMyTours);

module.exports = router;
