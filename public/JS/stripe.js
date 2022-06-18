/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51L7rHrSAwnnVpznUMyBaXbZ7tCuTDnpRD121ybxewT2oS2czTOo3xylFhMXHIgP2MZ5vK9XPLBhqgUB6GslFVlW100r3V2uNv3'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });

    // 2) Create checkout form + chanre credit card
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
