const stripe = Stripe(
  'pk_test_51OnzmRSJ6FXGanpbdH8BLRvTuce4SwcWzv3RvVE1i2n77O26cvVUEkZIjrUJf9dIp97hUQL3wPBEoSmcF5kcrx4n00i2cZnMtz',
);

const Bookbtn = document.getElementById('book-tour');

const bookTour = async (tourid) => {
  try {
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourid}`,
    );
    console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
  }
};

if (Bookbtn) {
  Bookbtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing....';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
