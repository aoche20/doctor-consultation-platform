const prisma = require('../prisma/client');

// ============================================
// STATISTIQUES POUR LE MÉDECIN
// ============================================
// @desc    Obtenir les statistiques du médecin connecté
// @route   GET /api/stats/doctor
// @access  Private (Doctor only)
exports.getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { period = 'month' } = req.query;

    // Définir la plage de dates selon la période
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // ============================================
    // 1. Statistiques générales
    // ============================================
    const [
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      totalPatientsResult,
      totalRevenueResult,
      averageRatingResult
    ] = await Promise.all([
      // Total des rendez-vous
      prisma.appointment.count({
        where: { doctorId }
      }),
      
      // Rendez-vous terminés
      prisma.appointment.count({
        where: { 
          doctorId,
          status: 'completed'
        }
      }),
      
      // Rendez-vous annulés
      prisma.appointment.count({
        where: { 
          doctorId,
          status: 'cancelled'
        }
      }),
      
      // Nombre de patients uniques
      prisma.$queryRaw`
        SELECT COUNT(DISTINCT patientId) as count
        FROM appointments
        WHERE doctorId = ${doctorId}
      `,
      
      // Revenu total
      prisma.$queryRaw`
        SELECT COALESCE(SUM(paymentAmount), 0) as total
        FROM appointments
        WHERE doctorId = ${doctorId}
          AND paymentStatus = 'paid'
      `,
      
      // Note moyenne
      prisma.$queryRaw`
        SELECT COALESCE(AVG(rating), 0) as avg
        FROM reviews
        WHERE doctorId = ${doctorId}
      `
    ]);

    // Extraire les valeurs des résultats bruts
    const totalPatients = Number(totalPatientsResult[0].count);
    const totalRevenue = Number(totalRevenueResult[0].total);
    const averageRating = Number(averageRatingResult[0].avg);

    // ============================================
    // 2. Évolution des rendez-vous
    // ============================================
    const appointmentsTimeline = await prisma.$queryRaw`
      SELECT 
        DATE(date) as date,
        COUNT(*) as count
      FROM appointments
      WHERE doctorId = ${doctorId}
        AND date >= ${startDate}
      GROUP BY DATE(date)
      ORDER BY date ASC
    `;

    // Convertir les résultats sans syntaxe TypeScript
    const parsedTimeline = [];
    for (let i = 0; i < appointmentsTimeline.length; i++) {
      parsedTimeline.push({
        date: appointmentsTimeline[i].date,
        count: Number(appointmentsTimeline[i].count)
      });
    }

    // ============================================
    // 3. Distribution par statut
    // ============================================
    const statusDistribution = await prisma.appointment.groupBy({
      by: ['status'],
      where: { doctorId },
      _count: true
    });

    // Convertir les comptages
    const parsedStatus = [];
    for (let i = 0; i < statusDistribution.length; i++) {
      parsedStatus.push({
        status: statusDistribution[i].status,
        _count: Number(statusDistribution[i]._count)
      });
    }

    // ============================================
    // 4. Revenus par mois
    // ============================================
    const revenueByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COALESCE(SUM(paymentAmount), 0) as total
      FROM appointments
      WHERE doctorId = ${doctorId}
        AND paymentStatus = 'paid'
        AND date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month ASC
    `;

    // Convertir les revenus
    const parsedRevenue = [];
    for (let i = 0; i < revenueByMonth.length; i++) {
      parsedRevenue.push({
        month: revenueByMonth[i].month,
        total: Number(revenueByMonth[i].total)
      });
    }

    // ============================================
    // 5. Satisfaction par mois
    // ============================================
    const satisfactionByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(a.date, '%Y-%m') as month,
        COALESCE(AVG(r.rating), 0) as avgRating
      FROM appointments a
      LEFT JOIN reviews r ON a.id = r.appointmentId
      WHERE a.doctorId = ${doctorId}
        AND a.date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(a.date, '%Y-%m')
      ORDER BY month ASC
    `;

    // Convertir les notes
    const parsedSatisfaction = [];
    for (let i = 0; i < satisfactionByMonth.length; i++) {
      parsedSatisfaction.push({
        month: satisfactionByMonth[i].month,
        avgRating: Number(satisfactionByMonth[i].avgRating)
      });
    }

    res.json({
      success: true,
      stats: {
        overview: {
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          completionRate: totalAppointments > 0 
            ? Math.round((completedAppointments / totalAppointments) * 100) 
            : 0,
          totalPatients,
          totalRevenue,
          averageRating: parseFloat(averageRating.toFixed(1))
        },
        charts: {
          appointmentsTimeline: parsedTimeline,
          statusDistribution: parsedStatus,
          revenueByMonth: parsedRevenue,
          satisfactionByMonth: parsedSatisfaction
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur getDoctorStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// STATISTIQUES POUR LE PATIENT
// ============================================
// @desc    Obtenir les statistiques du patient connecté
// @route   GET /api/stats/patient
// @access  Private (Patient only)
exports.getPatientStats = async (req, res) => {
  try {
    const patientId = req.user.id;

    const [
      totalAppointments,
      completedAppointments,
      upcomingAppointments,
      totalSpentResult,
      averageRatingResult
    ] = await Promise.all([
      // Total des rendez-vous
      prisma.appointment.count({
        where: { patientId }
      }),
      
      // Rendez-vous terminés
      prisma.appointment.count({
        where: { 
          patientId,
          status: 'completed'
        }
      }),
      
      // Rendez-vous à venir
      prisma.appointment.count({
        where: { 
          patientId,
          date: { gt: new Date() },
          status: { in: ['confirmed', 'pending'] }
        }
      }),
      
      // Total dépensé
      prisma.$queryRaw`
        SELECT COALESCE(SUM(paymentAmount), 0) as total
        FROM appointments
        WHERE patientId = ${patientId}
          AND paymentStatus = 'paid'
      `,
      
      // Note moyenne donnée
      prisma.$queryRaw`
        SELECT COALESCE(AVG(rating), 0) as avg
        FROM reviews
        WHERE patientId = ${patientId}
      `
    ]);

    const totalSpent = Number(totalSpentResult[0].total);
    const averageRating = Number(averageRatingResult[0].avg);

    // Rendez-vous par médecin
    const appointmentsByDoctor = await prisma.$queryRaw`
      SELECT 
        doctorId,
        COUNT(*) as count
      FROM appointments
      WHERE patientId = ${patientId}
      GROUP BY doctorId
      ORDER BY count DESC
      LIMIT 5
    `;

    // Récupérer les infos des médecins
    const doctorIds = [];
    for (let i = 0; i < appointmentsByDoctor.length; i++) {
      doctorIds.push(appointmentsByDoctor[i].doctorId);
    }
    
    let doctors = [];
    if (doctorIds.length > 0) {
      doctors = await prisma.user.findMany({
        where: { id: { in: doctorIds } },
        select: {
          id: true,
          name: true,
          specialization: true,
          profilePicture: true
        }
      });
    }

    const topDoctors = [];
    for (let i = 0; i < appointmentsByDoctor.length; i++) {
      const item = appointmentsByDoctor[i];
      topDoctors.push({
        doctor: doctors.find(d => d.id === item.doctorId),
        count: Number(item.count)
      });
    }

    res.json({
      success: true,
      stats: {
        overview: {
          totalAppointments,
          completedAppointments,
          upcomingAppointments,
          totalSpent,
          averageRating: parseFloat(averageRating.toFixed(1))
        },
        topDoctors
      }
    });

  } catch (error) {
    console.error('❌ Erreur getPatientStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// EXPORT DES DONNÉES (CSV)
// ============================================
// @desc    Exporter les rendez-vous en CSV
// @route   GET /api/stats/export
// @access  Private
exports.exportAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const where = userRole === 'doctor' 
      ? { doctorId: userId }
      : { patientId: userId };

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: userRole === 'doctor' ? {
          select: { name: true, email: true }
        } : undefined,
        doctor: userRole === 'patient' ? {
          select: { name: true, specialization: true }
        } : undefined
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Générer CSV
    let csv = 'Date,Heure,Type,Statut,Paiement,Montant,';
    csv += userRole === 'doctor' ? 'Patient,Email\n' : 'Médecin,Spécialité\n';

    for (let i = 0; i < appointments.length; i++) {
      const apt = appointments[i];
      const timeSlot = apt.timeSlot ? JSON.parse(apt.timeSlot) : { start: '' };
      const row = [
        new Date(apt.date).toLocaleDateString('fr-FR'),
        timeSlot.start,
        apt.type,
        apt.status,
        apt.paymentStatus,
        apt.paymentAmount,
        userRole === 'doctor' 
          ? apt.patient?.name || ''
          : apt.doctor?.name || '',
        userRole === 'doctor'
          ? apt.patient?.email || ''
          : apt.doctor?.specialization || ''
      ];
      csv += row.join(',') + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=rendez-vous.csv');
    res.send(csv);

  } catch (error) {
    console.error('❌ Erreur export:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};