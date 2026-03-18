const express = require('express');
const router = express.Router();
const {
  searchDoctors,
  getDoctorDetails,      // ✅ Maintenant cette fonction existe
  getDoctorByName,
  getDoctorAvailability
} = require('../controllers/doctorController');

// Routes publiques
router.get('/search', searchDoctors);
router.get('/by-name/:name', getDoctorByName);
router.get('/:id', getDoctorDetails);           // ✅ Cette ligne fonctionne maintenant
router.get('/:id/availability', getDoctorAvailability);

module.exports = router;