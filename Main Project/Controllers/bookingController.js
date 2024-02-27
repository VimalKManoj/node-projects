const AppError = require('../utils/appErrors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const factory = require('./handlerFactory');
const Booking = require('./../models/bookingModel');

exports.getCheckoutSession = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.tourId);
    // console.log(tour);

    const stripeCustomer = await stripe.customers.create({
      name: req.user.name,
      email: req.user.email,
      address: {
        line1: 'Customer Address Line 1',
        city: 'City',
        postal_code: '673611',
        state: 'State',
        country: 'US',
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/`,
      //   customer_email: req.user.email,
      customer: stripeCustomer.id,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            // The currency parameter determines which
            // payment methods are used in the Checkout Session.
            currency: 'inr',
            product_data: {
              name: `${tour.name}`,
              description: tour.summary,
            },
            unit_amount: tour.price,
          },
          quantity: 1,
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (error) {
    next(error);
  }
};

exports.createBooking = async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
};
