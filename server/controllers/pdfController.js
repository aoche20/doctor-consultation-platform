const PDFDocument = require('pdfkit');
const prisma = require('../prisma/client');

// ============================================
// GÉNÉRER UN PDF DE PRESCRIPTION
// ============================================
// @desc    Générer un PDF de prescription
// @route   GET /api/prescriptions/:appointmentId/pdf
// @access  Private (Patient or Doctor)
exports.generatePrescriptionPDF = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.appointmentId);

    // Récupérer le rendez-vous avec la prescription
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            dateOfBirth: true,
            address: true
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
        message: 'Aucune prescription trouvée'
      });
    }

    const prescription = JSON.parse(appointment.prescription);
    const patientAddress = appointment.patient.address ? JSON.parse(appointment.patient.address) : null;

    // Créer le document PDF
    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 50,
      info: {
        Title: `Prescription - ${appointment.patient.name}`,
        Author: appointment.doctor.name,
        Subject: 'Prescription médicale',
        Keywords: 'prescription, médicaments',
        CreationDate: new Date()
      }
    });

    // Configurer la réponse HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription-${appointmentId}.pdf`);
    
    // Pipe le PDF directement vers la réponse
    doc.pipe(res);

    // ============================================
    // EN-TÊTE DU DOCUMENT
    // ============================================
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#2563eb')
      .text('DoctorConsult', 50, 50)
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text('Plateforme de téléconsultation médicale', 50, 75);

    // Ligne de séparation
    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, 90)
      .lineTo(550, 90)
      .stroke();

    // ============================================
    // TITRE
    // ============================================
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text('PRESCRIPTION MÉDICALE', 50, 110, { align: 'center' });

    // ============================================
    // INFORMATIONS PATIENT
    // ============================================
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('Patient :', 50, 150)
      .font('Helvetica')
      .fillColor('#111827')
      .text(appointment.patient.name, 120, 150);

    if (appointment.patient.dateOfBirth) {
      const birthDate = new Date(appointment.patient.dateOfBirth).toLocaleDateString('fr-FR');
      doc
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text('Né(e) le :', 50, 170)
        .font('Helvetica')
        .fillColor('#111827')
        .text(birthDate, 120, 170);
    }

    if (patientAddress?.city) {
      doc
        .font('Helvetica-Bold')
        .fillColor('#374151')
        .text('Ville :', 50, 190)
        .font('Helvetica')
        .fillColor('#111827')
        .text(patientAddress.city, 120, 190);
    }

    // ============================================
    // INFORMATIONS MÉDECIN
    // ============================================
    doc
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('Médecin :', 300, 150)
      .font('Helvetica')
      .fillColor('#111827')
      .text(`Dr ${appointment.doctor.name}`, 380, 150)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('Spécialité :', 300, 170)
      .font('Helvetica')
      .fillColor('#111827')
      .text(appointment.doctor.specialization || 'Médecin généraliste', 380, 170);

    // Date de prescription
    const issueDate = new Date(prescription.issuedAt || appointment.createdAt).toLocaleDateString('fr-FR');
    doc
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('Date :', 300, 190)
      .font('Helvetica')
      .fillColor('#111827')
      .text(issueDate, 380, 190);

    // Ligne de séparation
    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, 220)
      .lineTo(550, 220)
      .stroke();

    // ============================================
    // MÉDICAMENTS PRESCRITS
    // ============================================
    let yPosition = 240;

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text('Médicaments prescrits :', 50, yPosition);

    yPosition += 30;

    if (prescription.medicines && prescription.medicines.length > 0) {
      prescription.medicines.forEach((medicine, index) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        // Cadre pour chaque médicament
        doc
          .fillColor('#f9fafb')
          .rect(50, yPosition - 5, 500, 60)
          .fill()
          .strokeColor('#e5e7eb')
          .lineWidth(1)
          .stroke();

        // Nom du médicament
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#111827')
          .text(medicine.name, 60, yPosition);

        // Dosage et durée
        doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor('#4b5563')
          .text(`Dosage : ${medicine.dosage}`, 60, yPosition + 20)
          .text(`Durée : ${medicine.duration || 'Non spécifiée'}`, 200, yPosition + 20);

        // Instructions
        if (medicine.instructions) {
          doc
            .font('Helvetica')
            .fillColor('#4b5563')
            .text(`Instructions : ${medicine.instructions}`, 60, yPosition + 35);
        }

        yPosition += 75;
      });
    } else {
      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#ef4444')
        .text('Aucun médicament prescrit', 50, yPosition);
      yPosition += 30;
    }

    // ============================================
    // NOTES COMPLÉMENTAIRES
    // ============================================
    if (prescription.additionalNotes) {
      // Nouvelle page si nécessaire
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 50;
      }

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text('Notes complémentaires :', 50, yPosition);

      yPosition += 25;

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#4b5563')
        .text(prescription.additionalNotes, 50, yPosition, {
          width: 500,
          align: 'left'
        });

      yPosition += 50;
    }

    // ============================================
    // DATE DE SUIVI
    // ============================================
    if (prescription.followUpDate) {
      // Nouvelle page si nécessaire
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      const followUp = new Date(prescription.followUpDate).toLocaleDateString('fr-FR');
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#2563eb')
        .text(`Prochain rendez-vous recommandé : ${followUp}`, 50, yPosition);
      
      yPosition += 30;
    }

    // ============================================
    // SIGNATURE ET MENTIONS LÉGALES
    // ============================================
    // Nouvelle page si nécessaire
    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, yPosition)
      .lineTo(550, yPosition)
      .stroke();

    yPosition += 20;

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('Signature du médecin :', 50, yPosition)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(`Dr ${appointment.doctor.name}`, 150, yPosition);

    yPosition += 20;

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#9ca3af')
      .text('Document généré électroniquement - Fait foi pour prescription médicale', 50, yPosition, {
        align: 'center',
        width: 500
      });

    // Finaliser le PDF
    doc.end();

  } catch (error) {
    console.error('❌ Erreur generatePrescriptionPDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du PDF'
    });
  }
};