require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// Set EJS as view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse JSON normally (for other routes)
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.render('index', { status: 'Webhook listener is running!' });
});

// Webhook route - use raw body for signature verification
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  if (signature === expectedSignature) {
    const payload = JSON.parse(req.body.toString());

    console.log('✅ Webhook verified. Event:', payload.event);
    // You can handle specific event types here
    // For example: payment.captured, order.paid, etc.

    res.status(200).send('Webhook received');
  } else {
    console.warn('❌ Invalid webhook signature!');
    res.status(400).send('Invalid signature');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
