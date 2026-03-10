const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isDoctor } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  updateAvailability,
  addQualification
} = require('../controllers/profileController');

// Routes protégées
router.get('/profile/:id', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/photo', protect, upload.single('photo'), uploadProfilePhoto);

// Routes spécifiques aux médecins
router.put('/doctor/availability', protect, isDoctor, updateAvailability);
router.post('/doctor/qualifications', protect, isDoctor, addQualification);

module.exports = router;