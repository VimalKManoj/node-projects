const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'Booking must have a tour'],
    ref: 'Tour',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'Booking must have a user'],
    ref: 'User',
  },
  paid: {
    type: Boolean,
    default: true,
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name ' });
  next();
});

const Booking = mongoose.model('bookings', bookingSchema);

module.exports = Booking;
