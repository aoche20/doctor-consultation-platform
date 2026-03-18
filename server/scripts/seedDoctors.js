const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const doctors = [
  {
    name: 'Dr. Sophie Martin',
    email: 'sophie.martin@doctor.com',
    password: 'password123',
    role: 'doctor',
    specialization: 'Cardiologue',
    consultationFee: 80,
    experience: 12,
    bio: 'Cardiologue avec 12 ans d\'expérience, spécialisée en prévention cardiovasculaire.',
    languages: ['Français', 'English'],
    education: [
      {
        degree: 'Doctorat en Médecine',
        institution: 'Université Paris Descartes',
        year: 2010
      },
      {
        degree: 'Spécialisation en Cardiologie',
        institution: 'Hôpital Pitié-Salpêtrière',
        year: 2015
      }
    ],
    availableSlots: [
      { day: 'Monday', startTime: '09:00', endTime: '12:00', isAvailable: true },
      { day: 'Monday', startTime: '14:00', endTime: '17:00', isAvailable: true },
      { day: 'Wednesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
      { day: 'Friday', startTime: '09:00', endTime: '12:00', isAvailable: true }
    ],
    rating: 4.8,
    totalReviews: 24,
    isVerified: true
  },
  {
    name: 'Dr. Thomas Dubois',
    email: 'thomas.dubois@doctor.com',
    password: 'password123',
    role: 'doctor',
    specialization: 'Dermatologue',
    consultationFee: 65,
    experience: 8,
    bio: 'Dermatologue passionné par les nouvelles technologies et traitements innovants.',
    languages: ['Français', 'English', 'Spanish'],
    education: [
      {
        degree: 'Doctorat en Médecine',
        institution: 'Université Lyon 1',
        year: 2014
      },
      {
        degree: 'Spécialisation en Dermatologie',
        institution: 'Hôpital Saint-Louis, Paris',
        year: 2018
      }
    ],
    availableSlots: [
      { day: 'Tuesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
      { day: 'Tuesday', startTime: '14:00', endTime: '18:00', isAvailable: true },
      { day: 'Thursday', startTime: '09:00', endTime: '12:00', isAvailable: true },
      { day: 'Thursday', startTime: '14:00', endTime: '17:00', isAvailable: true }
    ],
    rating: 4.5,
    totalReviews: 17,
    isVerified: true
  },
  {
    name: 'Dr. Marie Lambert',
    email: 'marie.lambert@doctor.com',
    password: 'password123',
    role: 'doctor',
    specialization: 'Généraliste',
    consultationFee: 50,
    experience: 15,
    bio: 'Médecin généraliste à l\'écoute, avec une approche holistique de la santé.',
    languages: ['Français', 'English', 'Arabic'],
    education: [
      {
        degree: 'Doctorat en Médecine Générale',
        institution: 'Université de Bordeaux',
        year: 2008
      }
    ],
    availableSlots: [
      { day: 'Monday', startTime: '14:00', endTime: '19:00', isAvailable: true },
      { day: 'Wednesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
      { day: 'Wednesday', startTime: '14:00', endTime: '17:00', isAvailable: true },
      { day: 'Friday', startTime: '09:00', endTime: '12:00', isAvailable: true },
      { day: 'Friday', startTime: '14:00', endTime: '16:00', isAvailable: true }
    ],
    rating: 4.9,
    totalReviews: 43,
    isVerified: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Supprimer les anciens médecins (optionnel)
    await User.deleteMany({ role: 'doctor', email: { $in: doctors.map(d => d.email) } });
    console.log('🗑️ Anciens médecins supprimés');

    // Créer les nouveaux médecins
    for (const doctorData of doctors) {
      const doctor = new User(doctorData);
      await doctor.save();
      console.log(`✅ Médecin créé: ${doctor.name} - ID: ${doctor._id}`);
    }

    console.log('🎉 Base de données initialisée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

seedDatabase();