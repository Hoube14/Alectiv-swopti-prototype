const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY. Copy stripe-server/.env.example to .env and add your key.');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cors());

// Define POST endpoint for creating checkout sessions
app.post('/create-checkout', async (req, res) => {
  try {

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'sek',
          product_data: {
            name: 'Glasögon Konfiguration',
          },
          unit_amount: Math.round(req.body.amount * 100), // Convert to öre (cents) and ensure its an integer
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });

    // Return the URL to redirect to
    res.json({ url: session.url });
  } catch (error) {

    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});
app.listen(3001, () => console.log('Server running on port 3001'));