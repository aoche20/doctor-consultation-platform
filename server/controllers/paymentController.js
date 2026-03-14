const Stripe = require('stripe');
const prisma = require('../prisma/client');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================
// CRÉER UN PAYMENT INTENT
// ============================================
// @desc    Créer un Payment Intent pour un rendez-vous
// @route   POST /api/payments/create-payment-intent
// @access  Private (Patient only)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    // Récupérer le rendez-vous avec Prisma
    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            consultationFee: true
          }
        },
        patient: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Vérifier que le patient est bien celui qui paie
    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Vérifier que le rendez-vous n'est pas déjà payé
    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Ce rendez-vous est déjà payé'
      });
    }

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(appointment.paymentAmount * 100), // Stripe utilise les centimes
      currency: 'eur',
      metadata: {
        appointmentId: appointment.id.toString(),
        patientId: req.user.id.toString(),
        doctorId: appointment.doctorId.toString()
      },
      receipt_email: appointment.patient.email
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Erreur createPaymentIntent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement'
    });
  }
};

// ============================================
// WEBHOOK STRIPE
// ============================================
// @desc    Confirmer le paiement (appelé par le webhook)
// @route   POST /api/payments/webhook
// @access  Public (Stripe webhook)
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Vérifier la signature du webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Erreur signature webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
      
    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;
      
    default:
      console.log(`Événement non géré: ${event.type}`);
  }

  res.json({ received: true });
};

// ============================================
// FONCTIONS UTILITAIRES POUR LES WEBHOOKS
// ============================================
async function handlePaymentSuccess(paymentIntent) {
  try {
    const { appointmentId } = paymentIntent.metadata;
    
    if (!appointmentId) {
      console.log('❌ Pas d\'appointmentId dans les metadata');
      return;
    }

    // Mettre à jour le rendez-vous avec Prisma
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: {
        paymentStatus: 'paid',
        paymentIntentId: paymentIntent.id,
        status: 'confirmed' // Confirmer automatiquement le rendez-vous
      }
    });

    if (appointment) {
      console.log(`✅ Paiement réussi pour le rendez-vous ${appointmentId}`);
      
      // Ici, vous pourriez envoyer un email de confirmation
      // sendConfirmationEmail(appointment);
    }
  } catch (error) {
    console.error('❌ Erreur handlePaymentSuccess:', error);
  }
}

async function handlePaymentFailure(paymentIntent) {
  try {
    const { appointmentId } = paymentIntent.metadata;
    
    if (!appointmentId) return;
    
    await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: {
        paymentStatus: 'failed'
      }
    });
    
    console.log(`❌ Paiement échoué pour le rendez-vous ${appointmentId}`);
  } catch (error) {
    console.error('❌ Erreur handlePaymentFailure:', error);
  }
}

async function handleRefund(charge) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent);
    const { appointmentId } = paymentIntent.metadata;
    
    if (!appointmentId) return;
    
    await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: {
        paymentStatus: 'refunded'
      }
    });
    
    console.log(`🔄 Remboursement effectué pour le rendez-vous ${appointmentId}`);
  } catch (error) {
    console.error('❌ Erreur handleRefund:', error);
  }
}

// ============================================
// REMBOURSEMENT MANUEL
// ============================================
// @desc    Rembourser un paiement
// @route   POST /api/payments/refund
// @access  Private (Doctor or Admin)
exports.refundPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: { id: parseInt(appointmentId) }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    if (!appointment.paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Aucun paiement associé à ce rendez-vous'
      });
    }

    // Effectuer le remboursement
    const refund = await stripe.refunds.create({
      payment_intent: appointment.paymentIntentId,
      reason: 'requested_by_customer'
    });

    // Mettre à jour le statut avec Prisma
    await prisma.appointment.update({
      where: { id: parseInt(appointmentId) },
      data: {
        paymentStatus: 'refunded'
      }
    });

    res.json({
      success: true,
      refund
    });

  } catch (error) {
    console.error('❌ Erreur refundPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du remboursement'
    });
  }
};

// ============================================
// OBTENIR LES DÉTAILS D'UN PAIEMENT
// ============================================
// @desc    Obtenir les détails d'un paiement
// @route   GET /api/payments/:appointmentId
// @access  Private
exports.getPaymentDetails = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId);

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Vérifier les permissions
    const isPatient = appointment.patientId === req.user.id;
    const isDoctor = appointment.doctorId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Si pas de paiement
    if (!appointment.paymentIntentId) {
      return res.json({
        success: true,
        payment: {
          status: appointment.paymentStatus,
          amount: appointment.paymentAmount,
          method: appointment.paymentMethod
        }
      });
    }

    // Récupérer les détails depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      appointment.paymentIntentId
    );

    // Récupérer les détails de la charge si disponible
    let charge = null;
    if (paymentIntent.latest_charge) {
      charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
    }

    res.json({
      success: true,
      payment: {
        id: paymentIntent.id,
        status: appointment.paymentStatus,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        method: paymentIntent.payment_method_types[0],
        receiptUrl: charge?.receipt_url,
        created: new Date(paymentIntent.created * 1000)
      }
    });

  } catch (error) {
    console.error('❌ Erreur getPaymentDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails'
    });
  }
};

// ============================================
// VÉRIFICATION DES EXPORTS
// ============================================
console.log('✅ paymentController chargé avec les fonctions:', Object.keys(module.exports));