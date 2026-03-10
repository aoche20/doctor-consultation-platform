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
    // ⚠️ IMPORTANT: On ne met pas 'select: false' pour l'instant
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
  phoneNumber: String,
  // Champs spécifiques aux médecins
  specialization: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  consultationFee: {
    type: Number,
    default: 50
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ✅ SOLUTION FINALE : Hashing AVANT la validation
userSchema.pre('validate', function(next) {
  // Ne pas utiliser next, juste retourner une Promise
  return (async () => {
    try {
      // Vérifier si le mot de passe est présent et modifié
      if (!this.isModified('password') || !this.password) {
        return;
      }
      
      // Hacher le mot de passe
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

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('❌ Erreur comparePassword:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);