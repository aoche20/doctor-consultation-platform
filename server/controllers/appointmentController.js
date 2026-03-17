const prisma = require('../prisma/client');

// ============================================
// CRÉER UN RENDEZ-VOUS
// ============================================
// @desc    Créer un nouveau rendez-vous
// @route   POST /api/appointments
// @access  Private (Patient only)
exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, type, symptoms } = req.body;

    // Vérifier que le médecin existe
    const doctor = await prisma.user.findUnique({
      where: { id: parseInt(doctorId) }
    });

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    // Vérifier que le créneau est disponible
    const appointmentDate = new Date(date);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][appointmentDate.getDay()];
    
    const availableSlots = doctor.availableSlots ? JSON.parse(doctor.availableSlots) : [];
    
    const isSlotAvailable = availableSlots.some(slot => 
      slot.day === dayName && 
      slot.startTime <= timeSlot.start && 
      slot.endTime >= timeSlot.end &&
      slot.isAvailable
    );

    if (!isSlotAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Ce créneau n\'est pas disponible'
      });
    }

    // Vérifier qu'il n'y a pas de rendez-vous conflictuel
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: parseInt(doctorId),
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          notIn: ['cancelled']
        }
      }
    });

    // Vérifier le créneau spécifique
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: parseInt(doctorId),
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          notIn: ['cancelled']
        }
      }
    });

    const isTimeSlotTaken = appointments.some(apt => {
      const aptTimeSlot = typeof apt.timeSlot === 'string' ? JSON.parse(apt.timeSlot) : apt.timeSlot;
      return aptTimeSlot.start === timeSlot.start;
    });

    if (isTimeSlotTaken) {
      return res.status(400).json({
        success: false,
        message: 'Ce créneau est déjà pris'
      });
    }

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId: parseInt(doctorId),
        date: appointmentDate,
        timeSlot: JSON.stringify(timeSlot),
        type: type || 'video',
        symptoms,
        paymentAmount: doctor.consultationFee,
        status: 'pending',
        paymentStatus: 'pending'
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            profilePicture: true,
            consultationFee: true
          }
        }
      }
    });

    // Parser le timeSlot pour la réponse
    const parsedAppointment = {
      ...appointment,
      timeSlot: JSON.parse(appointment.timeSlot)
    };

    res.status(201).json({
      success: true,
      appointment: parsedAppointment
    });

  } catch (error) {
    console.error('❌ Erreur createAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// OBTENIR LES RENDEZ-VOUS D'UN PATIENT
// ============================================
// @desc    Obtenir les rendez-vous d'un patient
// @route   GET /api/appointments/patient
// @access  Private (Patient only)
exports.getPatientAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const where = { patientId: req.user.id };
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            profilePicture: true,
            consultationFee: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.appointment.count({ where });

    // Parser les timeSlots
    const parsedAppointments = appointments.map(apt => ({
      ...apt,
      timeSlot: apt.timeSlot ? JSON.parse(apt.timeSlot) : { start: '', end: '' }
    }));

    res.json({
      success: true,
      appointments: parsedAppointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erreur getPatientAppointments:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// OBTENIR LES RENDEZ-VOUS D'UN MÉDECIN
// ============================================
// @desc    Obtenir les rendez-vous d'un médecin
// @route   GET /api/appointments/doctor
// @access  Private (Doctor only)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    const where = { doctorId: req.user.id };
    if (status) where.status = status;
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      where.date = { gte: startDate, lte: endDate };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            phoneNumber: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.appointment.count({ where });

    // Parser les timeSlots
    const parsedAppointments = appointments.map(apt => ({
      ...apt,
      timeSlot: apt.timeSlot ? JSON.parse(apt.timeSlot) : { start: '', end: '' }
    }));

    res.json({
      success: true,
      appointments: parsedAppointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erreur getDoctorAppointments:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// METTRE À JOUR LE STATUT D'UN RENDEZ-VOUS
// ============================================
// @desc    Mettre à jour le statut d'un rendez-vous
// @route   PUT /api/appointments/:id/status
// @access  Private (Patient or Doctor)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const appointmentId = parseInt(req.params.id);

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

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    let updateData = { status };

    // Logique selon le statut
    switch (status) {
      case 'cancelled':
        updateData.cancellationReason = reason;
        updateData.cancelledBy = req.user.id;
        updateData.cancelledAt = new Date();
        break;
      
      case 'confirmed':
        if (!isDoctor) {
          return res.status(403).json({
            success: false,
            message: 'Seul le médecin peut confirmer le rendez-vous'
          });
        }
        break;
      
      case 'completed':
        if (!isDoctor) {
          return res.status(403).json({
            success: false,
            message: 'Seul le médecin peut marquer le rendez-vous comme terminé'
          });
        }
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Statut invalide'
        });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            profilePicture: true
          }
        }
      }
    });

    // Parser le timeSlot
    const parsedAppointment = {
      ...updatedAppointment,
      timeSlot: updatedAppointment.timeSlot ? JSON.parse(updatedAppointment.timeSlot) : { start: '', end: '' }
    };

    res.json({
      success: true,
      appointment: parsedAppointment
    });

  } catch (error) {
    console.error('❌ Erreur updateAppointmentStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
 
// ============================================
// OBTENIR UN RENDEZ-VOUS PAR ID
// ============================================
// ============================================
// OBTENIR UN RENDEZ-VOUS PAR ID
// ============================================
exports.getAppointmentById = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    
    console.log('🔍 ===== DÉBUT getAppointmentById =====');
    console.log('🔍 ID reçu (brut):', req.params.id);
    console.log('🔍 ID parsé (nombre):', appointmentId);
    console.log('🔍 Utilisateur connecté ID:', req.user.id);
    console.log('🔍 Rôle utilisateur:', req.user.role);

    // ✅ Vérification que l'ID est valide
    if (isNaN(appointmentId)) {
      console.log('❌ ID invalide (NaN)');
      return res.status(400).json({
        success: false,
        message: 'ID de rendez-vous invalide'
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { 
        id: appointmentId  // ✅ Maintenant c'est bien un nombre
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            phoneNumber: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            profilePicture: true,
            consultationFee: true,
            rating: true,
            totalReviews: true
          }
        }
      }
    });

    console.log('🔍 Résultat findUnique:', appointment ? 'Trouvé' : 'Non trouvé');
    
    if (!appointment) {
      console.log('❌ Rendez-vous non trouvé en base');
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Vérifier que l'utilisateur est concerné
    console.log('🔒 Vérification permissions:');
    console.log('   Patient ID (DB):', appointment.patientId);
    console.log('   Doctor ID (DB):', appointment.doctorId);
    console.log('   User ID (req):', req.user.id);
    console.log('   Est patient?', appointment.patientId === req.user.id);
    console.log('   Est docteur?', appointment.doctorId === req.user.id);

    if (appointment.patientId !== req.user.id && appointment.doctorId !== req.user.id) {
      console.log('❌ Non autorisé - utilisateur non concerné');
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    // Parser les champs JSON
    const parsedAppointment = {
      ...appointment,
      timeSlot: appointment.timeSlot ? JSON.parse(appointment.timeSlot) : { start: '', end: '' },
      prescription: appointment.prescription ? JSON.parse(appointment.prescription) : null
    };

    console.log('✅ Rendez-vous trouvé et autorisé, envoi réponse');
    console.log('🔍 ===== FIN getAppointmentById =====\n');

    res.json({
      success: true,
      appointment: parsedAppointment
    });

  } catch (error) {
    console.error('❌ Erreur getAppointmentById:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
// ✅ Vérifiez que la fonction est bien dans les exports
console.log('✅ appointmentController chargé, fonctions disponibles:', Object.keys(module.exports));
// ============================================
// OBTENIR LES CRÉNEAUX DISPONIBLES
// ============================================
// @desc    Obtenir les créneaux disponibles pour une date
// @route   GET /api/appointments/available-slots/:doctorId
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const doctorId = parseInt(req.params.doctorId);

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date requise'
      });
    }

    const doctor = await prisma.user.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Médecin non trouvé'
      });
    }

    const appointmentDate = new Date(date);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][appointmentDate.getDay()];

    // Récupérer les créneaux théoriques du médecin
    const availableSlots = doctor.availableSlots ? JSON.parse(doctor.availableSlots) : [];
    const theoreticalSlots = availableSlots.filter(slot => 
      slot.day === dayName && slot.isAvailable
    );

    // Récupérer les rendez-vous déjà pris
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { notIn: ['cancelled'] }
      }
    });

    // Générer les créneaux de 30 minutes
    const availableTimeSlots = [];
    
    theoreticalSlots.forEach(slot => {
      const startHour = parseInt(slot.startTime.split(':')[0]);
      const startMinute = parseInt(slot.startTime.split(':')[1]);
      const endHour = parseInt(slot.endTime.split(':')[0]);
      const endMinute = parseInt(slot.endTime.split(':')[1]);
      
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        
        // Vérifier si le créneau est déjà réservé
        const isBooked = bookedAppointments.some(apt => {
          const aptTimeSlot = apt.timeSlot ? JSON.parse(apt.timeSlot) : null;
          return aptTimeSlot && aptTimeSlot.start === timeString;
        });
        
        if (!isBooked) {
          availableTimeSlots.push({
            start: timeString,
            end: `${currentHour.toString().padStart(2, '0')}:${(currentMinute + 30).toString().padStart(2, '0')}`,
            available: true
          });
        }
        
        currentMinute += 30;
        if (currentMinute >= 60) {
          currentHour += 1;
          currentMinute = 0;
        }
      }
    });

    res.json({
      success: true,
      date,
      day: dayName,
      availableSlots: availableTimeSlots
    });

  } catch (error) {
    console.error('❌ Erreur getAvailableSlots:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
// ============================================
// AJOUTER UNE PRESCRIPTION À UN RENDEZ-VOUS
// ============================================
// @desc    Ajouter une prescription à un rendez-vous
// @route   POST /api/appointments/:id/prescription
// @access  Private (Doctor only)
exports.addPrescription = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    const { medicines, additionalNotes, followUpDate } = req.body;

    // Vérifier que le rendez-vous existe
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
        patient: true
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le médecin du rendez-vous
    if (appointment.doctorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Seul le médecin peut ajouter une prescription'
      });
    }

    // Vérifier que le rendez-vous est terminé ou confirmé
    if (appointment.status !== 'completed' && appointment.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'La prescription ne peut être ajoutée qu\'à un rendez-vous terminé ou confirmé'
      });
    }

    // Créer la prescription
    const prescription = {
      medicines: medicines || [],
      additionalNotes: additionalNotes || '',
      followUpDate: followUpDate || null,
      issuedAt: new Date()
    };

    // Mettre à jour le rendez-vous
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        prescription: JSON.stringify(prescription)
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Prescription ajoutée avec succès',
      prescription,
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('❌ Erreur addPrescription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// RÉCUPÉRER LA PRESCRIPTION D'UN RENDEZ-VOUS
// ============================================
// @desc    Récupérer la prescription d'un rendez-vous
// @route   GET /api/appointments/:id/prescription
// @access  Private (Patient or Doctor)
exports.getPrescription = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true
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

    // Vérifier les permissions
    const isPatient = appointment.patientId === req.user.id;
    const isDoctor = appointment.doctorId === req.user.id;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (!appointment.prescription) {
      return res.status(404).json({
        success: false,
        message: 'Aucune prescription trouvée pour ce rendez-vous'
      });
    }

    const prescription = JSON.parse(appointment.prescription);

    res.json({
      success: true,
      prescription,
      appointment: {
        id: appointment.id,
        date: appointment.date,
        doctor: appointment.doctor,
        patient: appointment.patient
      }
    });

  } catch (error) {
    console.error('❌ Erreur getPrescription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
// ============================================
// VÉRIFICATION DES EXPORTS
// ============================================
console.log('✅ appointmentController chargé avec les fonctions:', Object.keys(module.exports));