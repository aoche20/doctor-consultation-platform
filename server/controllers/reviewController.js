const Review = require('../models/Review');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Créer un avis
// @route   POST /api/reviews
// @access  Private (Patient only)
exports.createReview = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment, tags, isAnonymous } = req.body;

    // Vérifier que le rendez-vous existe et appartient au patient
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: req.user.id,
      doctor: doctorId,
      status: 'completed'
    });

    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez évaluer que des rendez-vous terminés'
      });
    }

    // Vérifier si un avis existe déjà
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà évalué cette consultation'
      });
    }

    // Créer l'avis
    const review = await Review.create({
      patient: req.user.id,
      doctor: doctorId,
      appointment: appointmentId,
      rating,
      comment,
      tags,
      isAnonymous
    });

    // Mettre à jour la note du médecin
    const doctor = await User.findById(doctorId);
    await doctor.calculateAverageRating();

    // Populer les données patient
    await review.populate('patient', 'name profilePicture');

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('❌ Erreur createReview:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// @desc    Obtenir les avis d'un médecin
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
exports.getDoctorReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let sortOptions = {};
    switch (sort) {
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'highest':
        sortOptions = { rating: -1 };
        break;
      case 'lowest':
        sortOptions = { rating: 1 };
        break;
    }

    const reviews = await Review.find({ doctor: req.params.doctorId })
      .populate('patient', 'name profilePicture')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ doctor: req.params.doctorId });

    res.json({
      success: true,
      reviews,
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

// @desc    Signaler un avis
// @route   POST /api/reviews/:id/report
// @access  Private
exports.reportReview = async (req, res) => {
  try {
    const { reason } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Logique de signalement (à implémenter selon vos besoins)
    // Par exemple, créer un document Report

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

// @desc    Répondre à un avis (pour le médecin)
// @route   POST /api/reviews/:id/reply
// @access  Private (Doctor only)
exports.replyToReview = async (req, res) => {
  try {
    const { message } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que le médecin connecté est bien celui concerné
    if (review.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez répondre qu\'aux avis vous concernant'
      });
    }

    review.replies.push({
      doctor: req.user.id,
      message,
      date: new Date()
    });

    await review.save();

    res.json({
      success: true,
      replies: review.replies
    });
  } catch (error) {
    console.error('❌ Erreur replyToReview:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};