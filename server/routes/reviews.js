const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isPatient, isDoctor } = require('../middleware/roleCheck');
const {
  createReview,
  getDoctorReviews,
  reportReview,
  replyToReview
} = require('../controllers/reviewController');

// Routes publiques
router.get('/doctor/:doctorId', getDoctorReviews);

// Routes protégées
router.post('/', protect, isPatient, createReview);
router.post('/:id/report', protect, reportReview);
router.post('/:id/reply', protect, isDoctor, replyToReview);

module.exports = router;