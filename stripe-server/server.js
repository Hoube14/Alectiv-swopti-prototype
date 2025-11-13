const express = require('express');
const stripe = require('stripe')('sk_test_51SSJ3YGVk3fe3BesCGH3TSClgmjKNauwYdNT27XPneurncSW03BKmoIyXCsa9ravqzGnQSlrQJ47q7uNDkMmxksH00XzPCwBwd');
const cors = require('cors');

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