const express = require('express');
const cors = require('cors');
const paypal = require('@paypal/payouts-sdk');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
}));
app.use(express.json());

const clientId = process.env.VITE_PAYPAL_CLIENT_ID;
const clientSecret = process.env.VITE_PAYPAL_CLIENT_SECRET;

const client = new paypal.core.PayPalHttpClient(new paypal.core.SandboxEnvironment(clientId, clientSecret));

app.post('/api/withdraw', async (req, res) => {
  const { amount, email } = req.body;

  const payoutRequest = new paypal.payouts.PayoutsPostRequest();
  payoutRequest.requestBody({
    sender_batch_header: {
      sender_batch_id: `payout_${Date.now()}`,
      email_subject: 'You have a payment',
    },
    items: [{
      recipient_type: 'EMAIL',
      amount: {
        value: amount.toString(),
        currency: 'USD',
      },
      receiver: email,
      note: 'Thank you for your business.',
      // You can add additional fields as needed
    }],
  });

  try {
    const response = await client.execute(payoutRequest);
    res.status(200).json({ batchId: response.result.batch_header.payout_batch_id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating payout');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
