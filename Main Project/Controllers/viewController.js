const Tour = require('../models/tourModel');
const AppError = require('../utils/appErrors');

exports.getOverview = async (req, res, next) => {
  try {
    const tours = await Tour.find();

    res
      .status(200)
      .set(
        'Content-Security-Policy',
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;",
      )
      .render('overview', {
        title: 'All tours',
        tours,
      });
  } catch (error) {
    next(error);
  }
};

exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.find({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });

    if (tour.length === 0) {
      return next(new AppError('There is no tour with this name', 404));
    }
    res
      .status(200)
      .set(
        'Content-Security-Policy',
        "default-src 'self' https://*.maptiler.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com http://cdn.maptiler.com https://cdn.maptiler.com https://cloud.maptiler.com https://api.maptiler.co 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;",
      )
      .render('tour', {
        title: `${tour[0].name} tour`,
        tour,
      });
  } catch (error) {
    next(error);
  }
};

exports.login = (req, res, next) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;",
    )
    .render('login', {
      title: 'Login',
    });
};

exports.getAccount = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com;",
    )
    .render('account', {
      title: 'Your account',
    });
};
