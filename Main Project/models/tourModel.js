const mongoose = require('mongoose');
const slugify = require('slugify');
const Review = require('./reviewModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [40, 'maximum length should be 40'],
      minlength: [10, 'minimum length should be 10'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either easy ,medium , difficult',
      },
    },
    startLocation: [
      {
        // GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
      },
    ],
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be minimum one'],
      max: [5, 'Rating must be below five'],
      set: (val) => Math.round(val * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Price must be added'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'discount price must be lower than price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// SET INDEX IN DB SO THAT SEARCHING BECOMES FASTER FOR FREQUENTLY ACCESSED QUERY
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// ---------------------------------------------------------------------------------------------------

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// ADDING A VIRTUAL FIELD IN TOUR FOR REVIEWS INORDER TO UNDERSTAND THE REVIEWS ON EACH TOUR
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// ---------------------------------------------------------------------------------------------------

// runs only for save() and create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// EMBEDDING TOUR GUIDES INTO TOUR

// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });

// POPULATE THE GUIDE IN TOUR
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -changedPasswordAt',
  });
  next();
});

// ---------------------------------------------------------------------------------------------------

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// ---------------------------------------------------------------------------------------------------

// RUNS ON AGGREGATE FUNCTIONS

// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

// tourSchema.post('save', function (next) {
//  console.log('I will come after saving....')
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
