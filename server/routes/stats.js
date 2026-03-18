const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getDoctorStats, 
  getPatientStats,
  exportAppointments 
} = require('../controllers/statsController');

router.get('/doctor', protect, getDoctorStats);
router.get('/patient', protect, getPatientStats);
router.get('/export', protect, exportAppointments);

module.exports = router;