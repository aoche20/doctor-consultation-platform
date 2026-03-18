const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isPatient, isDoctor } = require('../middleware/roleCheck');
const {
  createPaymentIntent,
  handleWebhook,
  refundPayment,
  getPaymentDetails
} = require('../controllers/paymentController');

// Route webhook (doit être en raw body, pas de middleware JSON)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Routes protégées
router.post('/create-payment-intent', protect, isPatient, createPaymentIntent);
router.post('/refund', protect, isDoctor, refundPayment);
router.get('/:appointmentId', protect, getPaymentDetails);

module.exports = router;