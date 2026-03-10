const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Récupérer le profil d'un utilisateur
// @route   GET /api/users/profile/:id
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Supprimer les champs sensibles
    delete updates.password;
    delete updates.role;
    delete updates._id;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { 
        returnDocument: 'after',
        runValidators: true 
      }
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Uploader une photo de profil
// @route   POST /api/users/profile/photo
// @access  Private
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez sélectionner une image'
      });
    }

    console.log('📸 Fichier reçu:', req.file.path);

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'doctor-consultation/profiles',
      width: 300,
      height: 300,
      crop: 'fill'
    });

    console.log('✅ Upload Cloudinary réussi:', result.secure_url);

    // Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: result.secure_url },
      { 
        returnDocument: 'after',
        runValidators: true 
      }
    ).select('-password');

    res.json({
      success: true,
      profilePicture: result.secure_url,
      user
    });
  } catch (error) {
    console.error('❌ Erreur uploadProfilePhoto:', error);
    
    if (error.message.includes('API key')) {
      return res.status(401).json({
        success: false,
        message: 'Erreur de configuration Cloudinary. Vérifiez vos clés API.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload'
    });
  }
};

// ✅ AJOUTEZ CE CODE ICI - Gestion des disponibilités du médecin
// @desc    Ajouter/modifier les disponibilités du médecin
// @route   PUT /api/users/doctor/availability
// @access  Private (Doctor only)
exports.updateAvailability = async (req, res) => {
  try {
    const { availableSlots } = req.body;

    // Vérifier que l'utilisateur est un médecin
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les médecins peuvent gérer leurs disponibilités'
      });
    }

    // Mettre à jour les disponibilités
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { availableSlots },
      { 
        returnDocument: 'after',
        runValidators: true 
      }
    ).select('-password');

    res.json({
      success: true,
      availableSlots: user.availableSlots
    });
  } catch (error) {
    console.error('❌ Erreur updateAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour des disponibilités'
    });
  }
};

// @desc    Ajouter une qualification (pour médecins)
// @route   POST /api/users/doctor/qualifications
// @access  Private (Doctor only)
exports.addQualification = async (req, res) => {
  try {
    const { degree, institution, year, certificate } = req.body;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les médecins peuvent ajouter des qualifications'
      });
    }

    const user = await User.findById(req.user.id);
    user.qualifications.push({ degree, institution, year, certificate });
    await user.save();

    res.json({
      success: true,
      qualifications: user.qualifications
    });
  } catch (error) {
    console.error('❌ Erreur addQualification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};