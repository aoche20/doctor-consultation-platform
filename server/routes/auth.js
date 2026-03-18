const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation pour l'inscription
const registerValidation = [
  body('name').notEmpty().withMessage('Le nom est requis').trim(),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  body('role').isIn(['patient', 'doctor']).withMessage('Rôle invalide'),
  body('specialization').if(body('role').equals('doctor')).notEmpty().withMessage('La spécialisation est requise pour les médecins')
];

// Validation pour la connexion
const loginValidation = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
];

// Routes publiques
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Routes protégées
router.get('/me', protect, getMe);

module.exports = router;