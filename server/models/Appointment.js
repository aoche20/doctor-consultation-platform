const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['video', 'audio', 'chat', 'in-person'],
    default: 'video'
  },
  symptoms: {
    type: String,
    maxlength: 1000
  },
  notes: {
    type: String,
    maxlength: 2000
  },
  prescription: {
    medicines: [{
      name: String,
      dosage: String,
      duration: String,
      instructions: String
    }],
    additionalNotes: String,
    followUpDate: Date,
    issuedAt: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'wallet', 'insurance']
  },
  paymentIntentId: String,
  meetingId: String,
  meetingLink: String,
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push']
    },
    sentAt: Date,
    status: String
  }]
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ meetingId: 1 }, { sparse: true });
appointmentSchema.index({ date: 1, status: 1 });

// Vérifier qu'un rendez-vous n'est pas déjà pris au même créneau
appointmentSchema.index({ doctor: 1, date: 1, 'timeSlot.start': 1 }, { unique: true });

// Méthode pour annuler un rendez-vous
appointmentSchema.methods.cancel = async function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  await this.save();
};

// Méthode pour confirmer un rendez-vous
appointmentSchema.methods.confirm = async function() {
  this.status = 'confirmed';
  await this.save();
};

// Méthode pour marquer comme terminé
appointmentSchema.methods.complete = async function() {
  this.status = 'completed';
  await this.save();
};

// Méthode pour vérifier si le rendez-vous peut être annulé
appointmentSchema.methods.canBeCancelled = function() {
  const appointmentDate = new Date(this.date);
  const now = new Date();
  const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);
  
  // Peut être annulé jusqu'à 2 heures avant
  return hoursDiff > 2 && ['pending', 'confirmed'].includes(this.status);
};

module.exports = mongoose.model('Appointment', appointmentSchema);