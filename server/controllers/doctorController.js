const User = require('../models/User');
const Review = require('../models/Review');

// @desc    Rechercher des médecins avec filtres
// @route   GET /api/doctors/search
// @access  Public
exports.searchDoctors = async (req, res) => {
  try {
    const {
      specialization,
      minRating,
      maxFee,
      minFee,
      searchTerm,
      availableDay,
      language,
      insurance,
      sortBy = 'rating',
      page = 1,
      limit = 10
    } = req.query;

    // Construire le filtre
    const filter = { role: 'doctor', isActive: true };
    
    if (specialization) {
      filter.specialization = specialization;
    }
    
    if (searchTerm) {
      filter.$text = { $search: searchTerm };
    }
    
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }
    
    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = parseInt(minFee);
      if (maxFee) filter.consultationFee.$lte = parseInt(maxFee);
    }
    
    if (language) {
      filter.languages = language;
    }
    
    if (insurance) {
      filter.insuranceAccepted = insurance;
    }
    
    if (availableDay) {
      filter['availableSlots'] = {
        $elemMatch: {
          day: availableDay,
          isAvailable: true
        }
      };
    }

    // Options de tri
    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { rating: -1, totalReviews: -1 };
        break;
      case 'fee_asc':
        sortOptions = { consultationFee: 1 };
        break;
      case 'fee_desc':
        sortOptions = { consultationFee: -1 };
        break;
      case 'experience':
        sortOptions = { experience: -1 };
        break;
      case 'reviews':
        sortOptions = { totalReviews: -1 };
        break;
      default:
        sortOptions = { rating: -1 };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Exécuter la requête
    const doctors = await User.find(filter)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Compter le total
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Erreur searchDoctors:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ✅ NOUVELLE FONCTION AJOUTÉE
// @desc    Obtenir les détails d'un médecin par ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorDetails = async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      isActive: true
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    // Récupérer les avis du médecin
    const reviews = await Review.find({ doctor: doctor._id })
      .populate('patient', 'name profilePicture')
      .sort('-createdAt')
      .limit(10);

    // Statistiques des notes
    const ratingStats = await Review.aggregate([
      { $match: { doctor: doctor._id } },
      { $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }},
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      doctor,
      reviews,
      ratingStats
    });
  } catch (error) {
    console.error('❌ Erreur getDoctorDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir les détails d'un médecin par son nom
// @route   GET /api/doctors/by-name/:name
// @access  Public
exports.getDoctorByName = async (req, res) => {
  try {
    const { name } = req.params;
    
    console.log('📥 Requête reçue - Nom recherché:', name);
    
    // Décoder le nom (remplacer les tirets par des espaces)
    let searchName = name;
    
    // Si le nom contient des tirets, les remplacer par des espaces
    if (name.includes('-')) {
      searchName = name.replace(/-/g, ' ');
    }
    
    console.log('📥 Nom après traitement:', searchName);
    
    // RECHERCHE FLEXIBLE - Plusieurs stratégies
    
    // Stratégie 1: Recherche exacte insensible à la casse
    let doctor = await User.findOne({
      name: { $regex: new RegExp(`^${searchName}$`, 'i') },
      role: 'doctor',
      isActive: true
    }).select('-password');
    
    // Stratégie 2: Si pas trouvé, enlever le "Dr" ou "Dr."
    if (!doctor && searchName.startsWith('Dr ')) {
      const withoutTitle = searchName.replace(/^Dr\s+/, '');
      console.log('📥 Recherche sans titre:', withoutTitle);
      
      doctor = await User.findOne({
        name: { $regex: new RegExp(withoutTitle, 'i') },
        role: 'doctor',
        isActive: true
      }).select('-password');
    }
    
    // Stratégie 3: Si pas trouvé, chercher avec "Dr." (point)
    if (!doctor && !searchName.includes('.')) {
      const withDot = searchName.replace('Dr ', 'Dr. ');
      console.log('📥 Recherche avec point:', withDot);
      
      doctor = await User.findOne({
        name: { $regex: new RegExp(`^${withDot}$`, 'i') },
        role: 'doctor',
        isActive: true
      }).select('-password');
    }
    
    // Stratégie 4: Recherche partielle (contient le nom)
    if (!doctor) {
      const nameParts = searchName.replace('Dr ', '').split(' ');
      const lastName = nameParts[nameParts.length - 1];
      
      console.log('📥 Recherche partielle par nom de famille:', lastName);
      
      doctor = await User.findOne({
        name: { $regex: new RegExp(lastName, 'i') },
        role: 'doctor',
        isActive: true
      }).select('-password');
    }

    console.log('📥 Médecin trouvé?', doctor ? 'Oui - ' + doctor.name : 'Non');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    // Récupérer les avis du médecin
    const reviews = await Review.find({ doctor: doctor._id })
      .populate('patient', 'name profilePicture')
      .sort('-createdAt')
      .limit(10);

    // Statistiques des notes
    const ratingStats = await Review.aggregate([
      { $match: { doctor: doctor._id } },
      { $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }},
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      doctor,
      reviews,
      ratingStats
    });
  } catch (error) {
    console.error('❌ Erreur getDoctorByName:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir les disponibilités d'un médecin
// @route   GET /api/doctors/:id/availability
// @access  Public
exports.getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id)
      .select('availableSlots consultationFee');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    res.json({
      success: true,
      availableSlots: doctor.availableSlots,
      consultationFee: doctor.consultationFee
    });
  } catch (error) {
    console.error('❌ Erreur getDoctorAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};