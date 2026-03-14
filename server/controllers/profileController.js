const prisma = require('../prisma/client');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Récupérer le profil d'un utilisateur
// @route   GET /api/users/profile/:id
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Ne pas renvoyer le mot de passe
    const { password, ...userWithoutPassword } = user;

    // Parser les champs JSON
    const parsedUser = {
      ...userWithoutPassword,
      address: user.address ? JSON.parse(user.address) : null,
      languages: user.languages ? JSON.parse(user.languages) : ['Français'],
      education: user.education ? JSON.parse(user.education) : [],
      workExperience: user.workExperience ? JSON.parse(user.workExperience) : [],
      insuranceAccepted: user.insuranceAccepted ? JSON.parse(user.insuranceAccepted) : [],
      availableSlots: user.availableSlots ? JSON.parse(user.availableSlots) : []
    };

    res.json({
      success: true,
      user: parsedUser
    });
  } catch (error) {
    console.error('❌ Erreur getProfile:', error);
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
    delete updates.id;

    // Stringifier les champs JSON si présents
    if (updates.address && typeof updates.address === 'object') {
      updates.address = JSON.stringify(updates.address);
    }
    if (updates.languages && Array.isArray(updates.languages)) {
      updates.languages = JSON.stringify(updates.languages);
    }
    if (updates.education && Array.isArray(updates.education)) {
      updates.education = JSON.stringify(updates.education);
    }
    if (updates.workExperience && Array.isArray(updates.workExperience)) {
      updates.workExperience = JSON.stringify(updates.workExperience);
    }
    if (updates.insuranceAccepted && Array.isArray(updates.insuranceAccepted)) {
      updates.insuranceAccepted = JSON.stringify(updates.insuranceAccepted);
    }
    if (updates.availableSlots && Array.isArray(updates.availableSlots)) {
      updates.availableSlots = JSON.stringify(updates.availableSlots);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updates
    });

    // Ne pas renvoyer le mot de passe
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('❌ Erreur updateProfile:', error);
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
      folder: 'doctor-consultation/profiles'
    });

    console.log('✅ Upload Cloudinary réussi:', result.secure_url);

    // Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: result.secure_url }
    });

    res.json({
      success: true,
      profilePicture: result.secure_url,
      user: {
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('❌ Erreur uploadProfilePhoto:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload: ' + error.message
    });
  }
};

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

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        availableSlots: JSON.stringify(availableSlots)
      }
    });

    res.json({
      success: true,
      availableSlots: user.availableSlots ? JSON.parse(user.availableSlots) : []
    });
  } catch (error) {
    console.error('❌ Erreur updateAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ✅ NOUVELLE FONCTION AJOUTÉE
// @desc    Ajouter une qualification (pour médecins)
// @route   POST /api/users/doctor/qualifications
// @access  Private (Doctor only)
exports.addQualification = async (req, res) => {
  try {
    const { degree, institution, year, certificate } = req.body;

    // Validation
    if (!degree || !institution || !year) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir le diplôme, l\'institution et l\'année'
      });
    }

    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les médecins peuvent ajouter des qualifications'
      });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Parser les qualifications existantes ou créer un tableau vide
    const currentEducation = user.education ? JSON.parse(user.education) : [];
    
    // Ajouter la nouvelle qualification
    const newEducation = [
      ...currentEducation,
      { degree, institution, year, certificate }
    ];

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        education: JSON.stringify(newEducation)
      }
    });

    res.json({
      success: true,
      qualifications: newEducation
    });
  } catch (error) {
    console.error('❌ Erreur addQualification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ✅ Vérification des exports
console.log('✅ profileController chargé avec les fonctions:', Object.keys(module.exports));