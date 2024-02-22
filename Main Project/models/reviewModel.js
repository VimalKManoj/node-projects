const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// EACH USER CAN ONLY REVIEW A TOUR ONCE
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({ path: 'user', select: 'name photo' }).populate({
  //   path: 'tour',
  //   select: 'name',
  // });

  // POPULATE THE USER FIELDS IN REVIEWS
  this.populate({ path: 'user', select: 'name photo' });

  next();
});

// CALCULATES THE AVERAGE RATING BASED ON REVIEW COUNTS AND RATINGS BY USING STATICS METHOD

// STATICS METHOD HAVE ACCESS TO CURRENT MODEL
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    });
  }
};

// ON CURRENT MODEL AND CURRENT DOCUMENT
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

// findOneAndDelete and findOneAndUpdate doesn't have document middleware like above for save() and create()
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // this.r is current query and this.findOne() gives current document
  this.r = await this.findOne();
  next();
});

// TRICK IS TO ADD A QUERY BEFORE SAVING AND TO MAKE THE CHANGE AFTER SAVING USING THE QUERY SET BEFORE
reviewSchema.post(/^findOneAnd/, async function () {
  this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
