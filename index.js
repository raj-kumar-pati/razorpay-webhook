// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const crypto = require('crypto');
// const path = require('path');

// const app = express();
// const PORT = process.env.PORT || 3000;
// const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// // Set EJS as view engine
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // Parse JSON normally (for other routes)
// app.use(express.json());

// // Home route
// app.get('/', (req, res) => {
//   res.render('index', { status: 'Webhook listener is running!' });
// });

// // Webhook route - use raw body for signature verification
// app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// app.post('/webhook', (req, res) => {
//   const signature = req.headers['x-razorpay-signature'];

//   const expectedSignature = crypto
//     .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
//     .update(req.body)
//     .digest('hex');

//   if (signature === expectedSignature) {
//     const payload = JSON.parse(req.body.toString());

//     console.log('✅ Webhook verified. Event:', payload.event);
//     // You can handle specific event types here
//     // For example: payment.captured, order.paid, etc.

//     res.status(200).send('Webhook received');
//   } else {
//     console.warn('❌ Invalid webhook signature!');
//     res.status(400).send('Invalid signature');
//   }
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server listening on http://localhost:${PORT}`);
// });

const app = require('express')()
const path = require('path')
const shortid = require('shortid')
const Razorpay = require('razorpay')
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())

const razorpay = new Razorpay({
	key_id: 'rzp_test_uGoq5ABJztRAhk',
	key_secret: 'FySe2f5fie9hij1a5s6clk9B'
})

// app.get('/logo.svg', (req, res) => {
// 	res.sendFile(path.join(__dirname, 'logo.svg'))
// })

app.post('/verification', (req, res) => {
	// do a validation
	const secret = '12345678'

	console.log(req.body)

	const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		// process it
		require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
	} else {
		// pass it
	}
	res.json({ status: 'ok' })
})

app.post('/razorpay', async (req, res) => {
	const payment_capture = 1
	const amount = 499
	const currency = 'INR'

	const options = {
		amount: amount * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		console.log(response)
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})

app.listen(1337, () => {
	console.log('Listening on 1337')
})
