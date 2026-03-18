const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Ancienne connexion Mongoose
const oldUserModel = require('../models/User');
const oldAppointmentModel = require('../models/Appointment');
const oldReviewModel = require('../models/Review');

// Nouveau client Prisma
const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Début de la migration des données...');

  try {
    // Connexion à MongoDB avec Mongoose
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à l\'ancienne base');

    // 1. Migrer les utilisateurs
    console.log('\n📦 Migration des utilisateurs...');
    const oldUsers = await oldUserModel.find({});
    
    for (const oldUser of oldUsers) {
      // Convertir le document Mongoose en objet simple
      const userData = oldUser.toObject();
      
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          id: userData._id.toString(),
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: userData.role,
          profilePicture: userData.profilePicture,
          phoneNumber: userData.phoneNumber,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          address: userData.address,
          specialization: userData.specialization,
          consultationFee: userData.consultationFee,
          isVerified: userData.isVerified || false,
          bio: userData.bio,
          languages: userData.languages || ['Français'],
          experience: userData.experience || 0,
          education: userData.education || [],
          workExperience: userData.workExperience || [],
          insuranceAccepted: userData.insuranceAccepted || [],
          availableSlots: userData.availableSlots || [],
          rating: userData.rating || 0,
          totalReviews: userData.totalReviews || 0,
          totalPatients: userData.totalPatients || 0,
          responseRate: userData.responseRate || 0,
          responseTime: userData.responseTime || 0,
          isActive: userData.isActive !== false,
          lastLogin: userData.lastLogin,
          createdAt: userData.createdAt || new Date(),
          updatedAt: userData.updatedAt || new Date()
        }
      });
      
      process.stdout.write('.');
    }
    console.log(`\n✅ ${oldUsers.length} utilisateurs migrés`);

    // 2. Migrer les rendez-vous
    console.log('\n📦 Migration des rendez-vous...');
    const oldAppointments = await oldAppointmentModel.find({});
    
    for (const oldApp of oldAppointments) {
      const appData = oldApp.toObject();
      
      await prisma.appointment.create({
        data: {
          id: appData._id.toString(),
          patientId: appData.patient.toString(),
          doctorId: appData.doctor.toString(),
          date: appData.date,
          timeSlot: appData.timeSlot,
          status: appData.status,
          type: appData.type,
          symptoms: appData.symptoms,
          notes: appData.notes,
          prescription: appData.prescription,
          paymentStatus: appData.paymentStatus || 'pending',
          paymentAmount: appData.paymentAmount || 0,
          paymentMethod: appData.paymentMethod,
          paymentIntentId: appData.paymentIntentId,
          meetingId: appData.meetingId,
          meetingLink: appData.meetingLink,
          cancellationReason: appData.cancellationReason,
          cancelledBy: appData.cancelledBy?.toString(),
          cancelledAt: appData.cancelledAt,
          createdAt: appData.createdAt || new Date(),
          updatedAt: appData.updatedAt || new Date()
        }
      });
      
      process.stdout.write('.');
    }
    console.log(`\n✅ ${oldAppointments.length} rendez-vous migrés`);

    // 3. Migrer les avis
    console.log('\n📦 Migration des avis...');
    const oldReviews = await oldReviewModel.find({});
    
    for (const oldRev of oldReviews) {
      const revData = oldRev.toObject();
      
      await prisma.review.create({
        data: {
          id: revData._id.toString(),
          patientId: revData.patient.toString(),
          doctorId: revData.doctor.toString(),
          appointmentId: revData.appointment.toString(),
          rating: revData.rating,
          comment: revData.comment,
          tags: revData.tags || [],
          isAnonymous: revData.isAnonymous || false,
          isVerified: revData.isVerified !== false,
          likes: revData.likes?.map(id => id.toString()) || [],
          replies: revData.replies || [],
          createdAt: revData.createdAt || new Date(),
          updatedAt: revData.updatedAt || new Date()
        }
      });
      
      process.stdout.write('.');
    }
    console.log(`\n✅ ${oldReviews.length} avis migrés`);

    console.log('\n🎉 Migration terminée avec succès !');

  } catch (error) {
    console.error('\n❌ Erreur pendant la migration:', error);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

migrate();