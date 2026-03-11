const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6
    // select: false sera ajouté après les tests
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    match: [/^[0-9+\-\s()]+$/, 'Numéro de téléphone invalide']
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'France' }
  },
  
  // 🆕 Champs spécifiques aux médecins (pour Jour 3)
  specialization: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  consultationFee: {
    type: Number,
    default: 50,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // 🆕 Nouveaux champs pour les médecins
  bio: {
    type: String,
    maxlength: 2000
  },
  languages: [{
    type: String,
    enum: ['Français', 'English', 'Arabic', 'Spanish', 'German', 'Italian']
  }],
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Formation et diplômes
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  
  // Expérience professionnelle détaillée
  workExperience: [{
    position: {
      type: String,
      required: true
    },
    hospital: {
      type: String,
      required: true
    },
    startYear: {
      type: Number,
      required: true
    },
    endYear: Number,
    current: {
      type: Boolean,
      default: false
    },
    description: String
  }],
  
  // Prix et assurances
  insuranceAccepted: [{
    type: String
  }],
  
  // Disponibilités
  availableSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String,
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  
  // Statistiques
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalPatients: {
    type: Number,
    default: 0
  },
  responseRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  responseTime: {
    type: Number, // en minutes
    default: 0
  },
  
  // Récompenses et distinctions
  awards: [{
    title: String,
    year: Number,
    description: String
  }],
  
  // Statut du compte
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
  
}, {
  timestamps: true
});

// ✅ Index pour la recherche textuelle (important pour le Jour 3)
userSchema.index({ 
  name: 'text', 
  specialization: 'text',
  'education.degree': 'text',
  bio: 'text' 
});

// Index pour les filtres
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ specialization: 1, rating: -1 });
userSchema.index({ consultationFee: 1 });
userSchema.index({ 'availableSlots.day': 1 });

// ✅ Hashing du mot de passe avant la validation
userSchema.pre('validate', function(next) {
  return (async () => {
    try {
      if (!this.isModified('password') || !this.password) {
        return;
      }
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      console.log('✅ Mot de passe hashé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du hashage:', error);
      throw error;
    }
  })();
});

// ✅ Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('❌ Erreur comparePassword:', error);
    return false;
  }
};

// ✅ Méthode pour calculer la note moyenne
userSchema.methods.calculateAverageRating = async function() {
  try {
    const Review = mongoose.model('Review');
    const result = await Review.aggregate([
      { $match: { doctor: this._id } },
      { 
        $group: { 
          _id: null, 
          avgRating: { $avg: '$rating' }, 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    if (result.length > 0) {
      this.rating = Math.round(result[0].avgRating * 10) / 10;
      this.totalReviews = result[0].count;
    } else {
      this.rating = 0;
      this.totalReviews = 0;
    }
    
    await this.save();
    return this.rating;
  } catch (error) {
    console.error('❌ Erreur calculateAverageRating:', error);
    throw error;
  }
};

// ✅ Méthode pour vérifier la disponibilité
userSchema.methods.isAvailableAt = function(date, time) {
  if (!this.availableSlots || this.availableSlots.length === 0) {
    return false;
  }
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];
  
  return this.availableSlots.some(slot => 
    slot.day === dayName && 
    slot.isAvailable && 
    slot.startTime <= time && 
    slot.endTime > time
  );
};

// ✅ Méthode pour incrémenter le compteur de patients
userSchema.methods.incrementPatientCount = async function() {
  this.totalPatients += 1;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);