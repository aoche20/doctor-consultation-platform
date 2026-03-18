const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generatePrescriptionPDF } = require('../controllers/pdfController');

// Route pour générer un PDF de prescription
router.get('/:appointmentId/pdf', protect, generatePrescriptionPDF);

module.exports = router;