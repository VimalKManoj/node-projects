const Review = require('./../models/reviewModel');

exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createReview = async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  console.log(req.user.id);
  if (!req.body.user) req.body.user = req.user.id;
  try {
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  } catch (error) {
    next(error);
  }
};
