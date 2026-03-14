const prisma = require('../prisma/client');

// ============================================
// CRÉER UN AVIS
// ============================================
// @desc    Créer un avis
// @route   POST /api/reviews
// @access  Private (Patient only)
exports.createReview = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment, tags, isAnonymous } = req.body;

    // Validation de la note
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'La note doit être comprise entre 1 et 5'
      });
    }

    // Vérifier que le rendez-vous existe et appartient au patient
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: {
        patient: true,
        doctor: true
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez évaluer que vos propres rendez-vous'
      });
    }

    if (appointment.doctorId !== parseInt(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Ce rendez-vous ne correspond pas au médecin sélectionné'
      });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez évaluer que des rendez-vous terminés'
      });
    }

    // Vérifier si un avis existe déjà pour ce rendez-vous
    const existingReview = await prisma.review.findUnique({
      where: { appointmentId: parseInt(appointmentId) }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà évalué cette consultation'
      });
    }

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        patientId: req.user.id,
        doctorId: parseInt(doctorId),
        appointmentId: parseInt(appointmentId),
        rating,
        comment,
        tags: tags ? JSON.stringify(tags) : JSON.stringify([]),
        isAnonymous: isAnonymous || false,
        isVerified: true
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      }
    });

    // Mettre à jour la note du médecin (calculer la moyenne)
    await updateDoctorRating(parseInt(doctorId));

    // Parser les tags pour la réponse
    const parsedReview = {
      ...review,
      tags: review.tags ? JSON.parse(review.tags) : []
    };

    res.status(201).json({
      success: true,
      review: parsedReview
    });
  } catch (error) {
    console.error('❌ Erreur createReview:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// OBTENIR LES AVIS D'UN MÉDECIN
// ============================================
// @desc    Obtenir les avis d'un médecin
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
exports.getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let orderBy = {};
    switch (sort) {
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const reviews = await prisma.review.findMany({
      where: { doctorId: parseInt(doctorId) },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            profilePicture: true
          }
        }
      },
      orderBy,
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.review.count({
      where: { doctorId: parseInt(doctorId) }
    });

    // Parser les tags pour chaque avis
    const parsedReviews = reviews.map(review => ({
      ...review,
      tags: review.tags ? JSON.parse(review.tags) : []
    }));

    res.json({
      success: true,
      reviews: parsedReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Erreur getDoctorReviews:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// SIGNALER UN AVIS
// ============================================
// @desc    Signaler un avis
// @route   POST /api/reviews/:id/report
// @access  Private
exports.reportReview = async (req, res) => {
  try {
    const { reason } = req.body;
    const reviewId = parseInt(req.params.id);

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Ici vous pourriez créer un modèle Report ou simplement logger
    console.log(`🚨 Avis signalé: ${reviewId}, Raison: ${reason}, Par: ${req.user.id}`);

    // Pour l'instant, on retourne juste un succès
    res.json({
      success: true,
      message: 'Avis signalé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur reportReview:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// RÉPONDRE À UN AVIS
// ============================================
// @desc    Répondre à un avis (pour le médecin)
// @route   POST /api/reviews/:id/reply
// @access  Private (Doctor only)
exports.replyToReview = async (req, res) => {
  try {
    const { message } = req.body;
    const reviewId = parseInt(req.params.id);

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que le médecin connecté est bien celui concerné
    if (review.doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez répondre qu\'aux avis vous concernant'
      });
    }

    // Récupérer les réponses existantes
    const currentReplies = review.replies ? JSON.parse(review.replies) : [];

    // Ajouter la nouvelle réponse
    const newReply = {
      doctor: req.user.id,
      message,
      date: new Date()
    };

    const updatedReplies = [...currentReplies, newReply];

    // Mettre à jour l'avis
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        replies: JSON.stringify(updatedReplies)
      }
    });

    res.json({
      success: true,
      replies: updatedReplies
    });
  } catch (error) {
    console.error('❌ Erreur replyToReview:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// FONCTION UTILITAIRE POUR METTRE À JOUR LA NOTE DU MÉDECIN
// ============================================
async function updateDoctorRating(doctorId) {
  try {
    // Calculer la moyenne des notes
    const result = await prisma.review.aggregate({
      where: { doctorId },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });

    const averageRating = result._avg.rating || 0;
    const totalReviews = result._count.rating || 0;

    // Mettre à jour le médecin
    await prisma.user.update({
      where: { id: doctorId },
      data: {
        rating: averageRating,
        totalReviews
      }
    });

    console.log(`✅ Note du médecin ${doctorId} mise à jour: ${averageRating.toFixed(1)} (${totalReviews} avis)`);
  } catch (error) {
    console.error('❌ Erreur updateDoctorRating:', error);
  }
}

// ============================================
// VÉRIFICATION DES EXPORTS
// ============================================
console.log('✅ reviewController chargé avec les fonctions:', Object.keys(module.exports));