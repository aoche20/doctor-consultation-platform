const prisma = require('../prisma/client');

// ============================================
// RECHERCHE DE MÉDECINS
// ============================================
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
      sortBy = 'rating',
      page = 1,
      limit = 10
    } = req.query;

    // Construire le filtre
    const where = { 
      role: 'doctor', 
      isActive: true 
    };
    
    if (specialization) {
      where.specialization = specialization;
    }
    
    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }
    
    if (minFee || maxFee) {
      where.consultationFee = {};
      if (minFee) where.consultationFee.gte = parseInt(minFee);
      if (maxFee) where.consultationFee.lte = parseInt(maxFee);
    }
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm } },
        { specialization: { contains: searchTerm } },
        { bio: { contains: searchTerm } }
      ];
    }

    // Options de tri
    let orderBy = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'fee_asc':
        orderBy = { consultationFee: 'asc' };
        break;
      case 'fee_desc':
        orderBy = { consultationFee: 'desc' };
        break;
      case 'experience':
        orderBy = { experience: 'desc' };
        break;
      case 'reviews':
        orderBy = { totalReviews: 'desc' };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Exécuter la requête
    const doctors = await prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: parseInt(limit),
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        specialization: true,
        consultationFee: true,
        experience: true,
        rating: true,
        totalReviews: true,
        isVerified: true,
        bio: true,
        languages: true,
        availableSlots: true
      }
    });
    
    // Compter le total
    const total = await prisma.user.count({ where });

    // Parser les champs JSON
    const parsedDoctors = doctors.map(doctor => ({
      ...doctor,
      languages: doctor.languages ? JSON.parse(doctor.languages) : ['Français'],
      availableSlots: doctor.availableSlots ? JSON.parse(doctor.availableSlots) : []
    }));

    res.json({
      success: true,
      doctors: parsedDoctors,
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

// ============================================
// DÉTAILS MÉDECIN PAR ID
// ============================================
exports.getDoctorDetails = async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);
    
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      include: {
        reviewsAsDoctor: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    // Statistiques des notes
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: { doctorId },
      _count: {
        rating: true
      }
    });

    // Parser les champs JSON
    const parsedDoctor = {
      ...doctor,
      languages: doctor.languages ? JSON.parse(doctor.languages) : ['Français'],
      education: doctor.education ? JSON.parse(doctor.education) : [],
      workExperience: doctor.workExperience ? JSON.parse(doctor.workExperience) : [],
      insuranceAccepted: doctor.insuranceAccepted ? JSON.parse(doctor.insuranceAccepted) : [],
      availableSlots: doctor.availableSlots ? JSON.parse(doctor.availableSlots) : []
    };

    const parsedReviews = doctor.reviewsAsDoctor.map(review => ({
      ...review,
      tags: review.tags ? JSON.parse(review.tags) : []
    }));

    // Ne pas renvoyer le mot de passe
    const { password, ...doctorWithoutPassword } = parsedDoctor;

    res.json({
      success: true,
      doctor: doctorWithoutPassword,
      reviews: parsedReviews,
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

// ============================================
// DÉTAILS MÉDECIN PAR NOM
// ============================================
// ============================================
// DÉTAILS MÉDECIN PAR NOM (Version corrigée pour MySQL)
// ============================================
// ============================================
// DÉTAILS MÉDECIN PAR NOM (Version SUPER robuste)
// ============================================
exports.getDoctorByName = async (req, res) => {
  try {
    const { name } = req.params;
    
    console.log('📥 Requête reçue - Nom recherché:', name);

    // Nettoyer le nom (enlever les espaces multiples, etc.)
    const cleanName = name.trim().replace(/\s+/g, ' ');
    console.log('📥 Nom nettoyé:', cleanName);

    let doctor = null;

    // STRATÉGIE 1: Recherche exacte (sensible à la casse)
    doctor = await prisma.user.findFirst({
      where: {
        name: cleanName,
        role: 'doctor',
        isActive: true
      }
    });
    if (doctor) console.log('✅ Trouvé par recherche exacte');

    // STRATÉGIE 2: Recherche insensible à la casse avec SQL brut
    if (!doctor) {
      console.log('📥 Recherche SQL insensible à la casse...');
      const doctors = await prisma.$queryRaw`
        SELECT * FROM users 
        WHERE LOWER(name) = LOWER(${cleanName})
        AND role = 'doctor'
        AND isActive = true
        LIMIT 1
      `;
      if (doctors && doctors.length > 0) {
        doctor = doctors[0];
        console.log('✅ Trouvé par SQL insensible');
      }
    }

    // STRATÉGIE 3: Recherche avec contains (pour gérer les titres comme Dr.)
    if (!doctor) {
      console.log('📥 Recherche avec contains...');
      const doctors = await prisma.$queryRaw`
        SELECT * FROM users 
        WHERE LOWER(name) LIKE LOWER(${`%${cleanName}%`})
        AND role = 'doctor'
        AND isActive = true
        LIMIT 1
      `;
      if (doctors && doctors.length > 0) {
        doctor = doctors[0];
        console.log('✅ Trouvé par contains');
      }
    }

    // STRATÉGIE 4: Enlever le titre "Dr" ou "Dr." pour la recherche
    if (!doctor && (cleanName.startsWith('Dr ') || cleanName.startsWith('Dr.'))) {
      let withoutTitle = cleanName.replace(/^Dr\.?\s+/, '');
      console.log('📥 Recherche sans titre:', withoutTitle);
      
      const doctors = await prisma.$queryRaw`
        SELECT * FROM users 
        WHERE LOWER(name) LIKE LOWER(${`%${withoutTitle}%`})
        AND role = 'doctor'
        AND isActive = true
        LIMIT 1
      `;
      if (doctors && doctors.length > 0) {
        doctor = doctors[0];
        console.log('✅ Trouvé sans titre');
      }
    }

    // STRATÉGIE 5: Recherche par nom de famille seulement
    if (!doctor && cleanName.includes(' ')) {
      const nameParts = cleanName.split(' ');
      const lastName = nameParts[nameParts.length - 1];
      console.log('📥 Recherche par nom de famille:', lastName);
      
      const doctors = await prisma.$queryRaw`
        SELECT * FROM users 
        WHERE LOWER(name) LIKE LOWER(${`%${lastName}%`})
        AND role = 'doctor'
        AND isActive = true
        LIMIT 1
      `;
      if (doctors && doctors.length > 0) {
        doctor = doctors[0];
        console.log('✅ Trouvé par nom de famille');
      }
    }

    console.log('📥 Médecin trouvé?', doctor ? `Oui - ${doctor.name}` : 'Non');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    // Récupérer les détails complets avec Prisma (en utilisant l'ID)
    const fullDoctor = await prisma.user.findUnique({
      where: { id: doctor.id },
      include: {
        reviewsAsDoctor: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                profilePicture: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    });

    // Statistiques des notes
    const ratingStats = await prisma.review.groupBy({
      by: ['rating'],
      where: { doctorId: doctor.id },
      _count: {
        rating: true
      }
    });

    // Parser les champs JSON
    const parsedDoctor = {
      ...fullDoctor,
      languages: fullDoctor.languages ? JSON.parse(fullDoctor.languages) : ['Français'],
      education: fullDoctor.education ? JSON.parse(fullDoctor.education) : [],
      workExperience: fullDoctor.workExperience ? JSON.parse(fullDoctor.workExperience) : [],
      insuranceAccepted: fullDoctor.insuranceAccepted ? JSON.parse(fullDoctor.insuranceAccepted) : [],
      availableSlots: fullDoctor.availableSlots ? JSON.parse(fullDoctor.availableSlots) : []
    };

    const parsedReviews = fullDoctor.reviewsAsDoctor.map(review => ({
      ...review,
      tags: review.tags ? JSON.parse(review.tags) : []
    }));

    // Ne pas renvoyer le mot de passe
    const { password, ...doctorWithoutPassword } = parsedDoctor;

    res.json({
      success: true,
      doctor: doctorWithoutPassword,
      reviews: parsedReviews,
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
// ============================================
// DISPONIBILITÉS MÉDECIN
// ============================================
exports.getDoctorAvailability = async (req, res) => {
  try {
    const doctor = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        availableSlots: true,
        consultationFee: true
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    res.json({
      success: true,
      availableSlots: doctor.availableSlots ? JSON.parse(doctor.availableSlots) : [],
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

// Vérification des exports
console.log('✅ doctorController chargé avec les fonctions:', Object.keys(module.exports));