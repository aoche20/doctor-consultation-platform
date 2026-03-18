const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isPatient, isDoctor } = require('../middleware/roleCheck');

const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAppointmentById,
  addPrescription,      // ✅ NOUVEAU - Ajouter la prescription
  getPrescription,
  getAvailableSlots
} = require('../controllers/appointmentController');

// Routes publiques
router.get('/available-slots/:doctorId', getAvailableSlots);

// Routes protégées
router.post('/', protect, isPatient, createAppointment);
router.get('/patient', protect, isPatient, getPatientAppointments);
router.get('/doctor', protect, isDoctor, getDoctorAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/status', protect, updateAppointmentStatus);
// Routes pour les prescriptions
router.post('/:id/prescription', protect, isDoctor, addPrescription);
router.get('/:id/prescription', protect, getPrescription);



module.exports = router;