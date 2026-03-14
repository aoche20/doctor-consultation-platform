const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');
  console.log('========================\n');

  // Hash du mot de passe commun
  const password = await bcrypt.hash('password123', 10);

  // ============================================
  // CRÉATION DES 10 MÉDECINS
  // ============================================
  const doctors = [
    {
      email: 'sophie.martin@doctor.com',
      name: 'Dr. Sophie Martin',
      specialization: 'Cardiologue',
      consultationFee: 80,
      experience: 12,
      bio: 'Cardiologue avec 12 ans d\'expérience, spécialisée en prévention cardiovasculaire et réadaptation cardiaque. Ancienne chef de clinique à l\'hôpital Pitié-Salpêtrière.',
      languages: ['Français', 'English'],
      education: [
        { degree: 'Doctorat en Médecine', institution: 'Université Paris Descartes', year: 2010 },
        { degree: 'Spécialisation en Cardiologie', institution: 'Hôpital Pitié-Salpêtrière', year: 2015 },
        { degree: 'DIU de Cardiologie Interventionnelle', institution: 'Université Paris Cité', year: 2017 }
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
      email: 'thomas.dubois@doctor.com',
      name: 'Dr. Thomas Dubois',
      specialization: 'Dermatologue',
      consultationFee: 65,
      experience: 8,
      bio: 'Dermatologue passionné par les nouvelles technologies. Spécialiste en dermatologie esthétique et laser, formé à l\'hôpital Saint-Louis à Paris.',
      languages: ['Français', 'English', 'Spanish'],
      education: [
        { degree: 'Doctorat en Médecine', institution: 'Université Lyon 1', year: 2014 },
        { degree: 'Spécialisation en Dermatologie', institution: 'Hôpital Saint-Louis, Paris', year: 2018 },
        { degree: 'DIU de Dermatologie Esthétique', institution: 'Université Paris Diderot', year: 2019 }
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
      email: 'marie.lambert@doctor.com',
      name: 'Dr. Marie Lambert',
      specialization: 'Généraliste',
      consultationFee: 50,
      experience: 15,
      bio: 'Médecin généraliste à l\'écoute, avec une approche holistique de la santé. Expérience en médecine de famille et suivi de pathologies chroniques.',
      languages: ['Français', 'English', 'Arabic'],
      education: [
        { degree: 'Doctorat en Médecine Générale', institution: 'Université de Bordeaux', year: 2008 },
        { degree: 'DIU de Gériatrie', institution: 'Université de Bordeaux', year: 2012 },
        { degree: 'Capacité de Médecine d\'Urgence', institution: 'SAMU de Paris', year: 2015 }
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
    },
    {
      email: 'pierre.renaud@doctor.com',
      name: 'Dr. Pierre Renaud',
      specialization: 'Pédiatre',
      consultationFee: 70,
      experience: 10,
      bio: 'Pédiatre dévoué à la santé des enfants de 0 à 18 ans. Spécialisé en néonatologie et développement de l\'enfant. Ancien chef de clinique en pédiatrie.',
      languages: ['Français', 'English'],
      education: [
        { degree: 'Doctorat en Médecine', institution: 'Université de Strasbourg', year: 2012 },
        { degree: 'Spécialisation en Pédiatrie', institution: 'Hôpital Necker-Enfants Malades', year: 2016 },
        { degree: 'DIU de Néonatologie', institution: 'Université Paris Descartes', year: 2018 }
      ],
      availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '12:00', isAvailable: true },
        { day: 'Tuesday', startTime: '14:00', endTime: '18:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '12:00', isAvailable: true },
        { day: 'Friday', startTime: '14:00', endTime: '17:00', isAvailable: true }
      ],
      rating: 4.7,
      totalReviews: 31,
      isVerified: true
    },
    {
      email: 'claire.bernard@doctor.com',
      name: 'Dr. Claire Bernard',
      specialization: 'Gynécologue',
      consultationFee: 75,
      experience: 14,
      bio: 'Gynécologue obstétricienne, spécialisée en suivi de grossesse et fertilité. Accompagnement personnalisé et bienveillant à chaque étape de la vie de la femme.',
      languages: ['Français', 'English', 'Italian'],
      education: [
        { degree: 'Doctorat en Médecine', institution: 'Université de Montpellier', year: 2009 },
        { degree: 'Spécialisation en Gynécologie-Obstétrique', institution: 'CHU de Montpellier', year: 2014 },
        { degree: 'DIU d\'Échographie Gynécologique', institution: 'Université Paris Descartes', year: 2016 }
      ],
      availableSlots: [
        { day: 'Tuesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
        { day: 'Wednesday', startTime: '14:00', endTime: '18:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '12:00', isAvailable: true }
      ],
      rating: 4.6,
      totalReviews: 28,
      isVerified: true
    },
    {
      email: 'nicolas.petit@doctor.com',
      name: 'Dr. Nicolas Petit',
      specialization: 'Ophtalmologue',
      consultationFee: 85,
      experience: 9,
      bio: 'Ophtalmologue spécialisé en chirurgie réfractive et cataracte. Pratique les dernières techniques laser et implants de dernière génération.',
      languages: ['Français', 'English'],
      education: [
        { degree: 'Doctorat en Médecine', institution: 'Université de Lille', year: 2013 },
        { degree: 'Spécialisation en Ophtalmologie', institution: 'CHU de Lille', year: 2017 },
        { degree: 'DIU de Chirurgie Réfractive', institution: 'Université Paris Sud', year: 2019 }
      ],
      availableSlots: [
        { day: 'Monday', startTime: '14:00', endTime: '18:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
        { day: 'Thursday', startTime: '14:00', endTime: '17:00', isAvailable: true }
      ],
      rating: 4.4,
      totalReviews: 19,
      isVerified: true
    },
    {
      email: 'isabelle.moreau@doctor.com',
      name: 'Dr. Isabelle Moreau',
      specialization: 'Psychiatre',
      consultationFee: 90,
      experience: 16,
      bio: 'Psychiatre spécialisée dans les troubles anxieux et la dépression. Thérapies cognitivo-comportementales et pleine conscience. Approche humaine et sans jugement.',
      languages: ['Français', 'English', 'German'],
      education: [
        { degree: 'Doctorat en Médecine', institution: 'Université de Strasbourg', year: 2007 },
        { degree: 'Spécialisation en Psychiatrie', institution: 'Hôpital Sainte-Anne, Paris', year: 2012 },
        { degree: 'DIU de Thérapies Cognitivo-Comportementales', institution: 'Université Paris Cité', year: 2014 }
      ],
      availableSlots: [
        { day: 'Tuesday', startTime: '10:00', endTime: '13:00', isAvailable: true },
        { day: 'Wednesday', startTime: '14:00', endTime: '19:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '12:00', isAvailable: true }
      ],
      rating: 4.8,
      totalReviews: 37,
      isVerified: true
    },
    {
      email: 'jean.dufour@doctor.com',
      name: 'Dr. Jean Dufour',
      specialization: 'Rhumatologue',
      consultationFee: 70,
      experience: 11,
      bio: 'Rhumatologue spécialisé dans les pathologies inflammatoires chroniques et la lombalgie. Pratique des infiltrations écho-guidées et de la mésothérapie.',
      languages: ['Français', 'Spanish'],
      education: [
        { degree: 'Doctorat en Médecine', institution: 'Université de Marseille', year: 2011 },
        { degree: 'Spécialisation en Rhumatologie', institution: 'CHU de Marseille', year: 2016 },
        { degree: 'DIU de Pathologies Rachidiennes', institution: 'Université Lyon 1', year: 2018 }
      ],
      availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '12:00', isAvailable: true },
        { day: 'Thursday', startTime: '14:00', endTime: '18:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '12:00', isAvailable: true }
      ],
      rating: 4.3,
      totalReviews: 22,
      isVerified: true
    },
    {
      email: 'sophie.lefevre@doctor.com',
      name: 'Dr. Sophie Lefèvre',
      specialization: 'ORL',
      consultationFee: 75,
      experience: 7,
      bio: 'Oto-rhino-laryngologiste, spécialiste des troubles de l\'audition et de la voix. Prise en charge des allergies et troubles de l\'équilibre.',
      languages: ['Français', 'English'],
      education: [
        { degree: 'Doctorat en Médecine', institution: 'Université de Nancy', year: 2015 },
        { degree: 'Spécialisation en ORL', institution: 'CHU de Nancy', year: 2019 },
        { degree: 'DIU d\'Audiologie', institution: 'Université Paris Diderot', year: 2020 }
      ],
      availableSlots: [
        { day: 'Tuesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
        { day: 'Wednesday', startTime: '14:00', endTime: '18:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '12:00', isAvailable: true }
      ],
      rating: 4.6,
      totalReviews: 14,
      isVerified: true
    },
    {
      email: 'philippe.robert@doctor.com',
      name: 'Dr. Philippe Robert',
      specialization: 'Neurologue',
      consultationFee: 95,
      experience: 18,
      bio: 'Neurologue spécialisé dans les maladies neurodégénératives (Parkinson, Alzheimer) et les céphalées. Ancien chef de service au CHU de Grenoble.',
      languages: ['Français', 'English', 'Italian'],
      education: [
        { degree: 'Doctorat en Médecine', institution: 'Université de Grenoble', year: 2005 },
        { degree: 'Spécialisation en Neurologie', institution: 'CHU de Grenoble', year: 2010 },
        { degree: 'DIU de Pathologies Neurodégénératives', institution: 'Université Paris VI', year: 2012 },
        { degree: 'Master en Neurosciences', institution: 'Université Claude Bernard Lyon 1', year: 2013 }
      ],
      availableSlots: [
        { day: 'Monday', startTime: '14:00', endTime: '18:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '12:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '12:00', isAvailable: true }
      ],
      rating: 4.7,
      totalReviews: 42,
      isVerified: true
    }
  ];

  // Création des médecins
  console.log('👨‍⚕️ Création des médecins...\n');
  
  for (const doctorData of doctors) {
    try {
      const doctor = await prisma.user.create({
        data: {
          email: doctorData.email,
          password,
          name: doctorData.name,
          role: 'doctor',
          specialization: doctorData.specialization,
          consultationFee: doctorData.consultationFee,
          experience: doctorData.experience,
          bio: doctorData.bio,
          languages: JSON.stringify(doctorData.languages),
          education: JSON.stringify(doctorData.education),
          availableSlots: JSON.stringify(doctorData.availableSlots),
          rating: doctorData.rating,
          totalReviews: doctorData.totalReviews,
          isVerified: doctorData.isVerified
        }
      });
      
      console.log(`   ✅ ${doctor.name} - ${doctor.specialization} (${doctor.consultationFee}€)`);
    } catch (error) {
      console.error(`   ❌ Erreur pour ${doctorData.email}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(40));

  // ============================================
  // CRÉATION D'UN PATIENT DE TEST
  // ============================================
  console.log('\n👤 Création d\'un patient de test...');
  
  try {
    const patient = await prisma.user.create({
      data: {
        email: 'patient@test.com',
        password,
        name: 'Jean Dupont',
        role: 'patient',
        phoneNumber: '0123456789',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        address: JSON.stringify({
          street: '123 Rue de Paris',
          city: 'Paris',
          zipCode: '75001',
          country: 'France'
        })
      }
    });
    console.log(`   ✅ Patient créé: ${patient.name} (${patient.email})`);
  } catch (error) {
    console.error(`   ❌ Erreur création patient:`, error.message);
  }

  console.log('\n' + '='.repeat(40));
  console.log('\n📊 RÉCAPITULATIF:');
  console.log(`   👨‍⚕️ Médecins créés: ${doctors.length}`);
  console.log(`   👤 Patient créé: 1`);
  console.log(`   🔑 Mot de passe commun: password123`);
  
  console.log('\n🎉 Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('\n❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });