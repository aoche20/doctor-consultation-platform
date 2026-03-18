const prisma = require('../prisma/client');
const mg = require('../config/mailgun'); // Nouvel import

class NotificationService {
  
  // ============================================
  // ENVOI D'EMAIL VIA MAILGUN
  // ============================================
  async sendEmail(to, subject, html) {
    if (!mg) {
      console.log('📧 Mailgun non configuré - email ignoré');
      return false;
    }

    try {
      const msg = {
        from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
        to: [to],
        subject: subject,
        html: html
      };

      const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, msg);
      console.log(`✅ Email envoyé à ${to}:`, response.id);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi email Mailgun:', error);
      return false;
    }
  }

  // ============================================
  // ENVOI AVEC TEMPLATE (optionnel)
  // ============================================
  async sendTemplateEmail(to, subject, templateName, templateData) {
    if (!mg) return false;

    try {
      // Construire le HTML à partir d'un template simple
      let html = this.getTemplate(templateName, templateData);

      const msg = {
        from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
        to: [to],
        subject: subject,
        html: html
      };

      const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, msg);
      console.log(`✅ Email template envoyé à ${to}:`, response.id);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi template:', error);
      return false;
    }
  }

  // ============================================
  // ENVOI AVEC PIÈCE JOINTE (PDF)
  // ============================================
  async sendEmailWithAttachment(to, subject, html, attachmentPath, attachmentName) {
    if (!mg) return false;

    try {
      const fs = require('fs');
      const attachment = fs.readFileSync(attachmentPath);

      const msg = {
        from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
        to: [to],
        subject: subject,
        html: html,
        attachment: {
          data: attachment,
          filename: attachmentName
        }
      };

      const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, msg);
      console.log(`✅ Email avec pièce jointe envoyé à ${to}:`, response.id);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi avec pièce jointe:', error);
      return false;
    }
  }

  // ============================================
  // TEMPLATES SIMPLES
  // ============================================
  getTemplate(name, data) {
    const templates = {
      'appointment-confirmation': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">DoctorConsult</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #111827; margin-top: 0;">✅ Rendez-vous confirmé</h2>
            <p style="color: #4b5563;">Bonjour ${data.patientName},</p>
            <p style="color: #4b5563;">Votre rendez-vous avec Dr ${data.doctorName} a été confirmé.</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Date :</strong> ${data.date}</p>
              <p><strong>Heure :</strong> ${data.time}</p>
            </div>
            <a href="${data.link}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Voir le rendez-vous
            </a>
          </div>
        </div>
      `,
      'appointment-reminder': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">DoctorConsult</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #111827; margin-top: 0;">🔔 Rappel de rendez-vous</h2>
            <p style="color: #4b5563;">Bonjour ${data.patientName},</p>
            <p style="color: #4b5563;">Vous avez un rendez-vous avec Dr ${data.doctorName} demain.</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Date :</strong> ${data.date}</p>
              <p><strong>Heure :</strong> ${data.time}</p>
            </div>
            <a href="${data.link}" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Voir les détails
            </a>
          </div>
        </div>
      `,
      'new-message': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">DoctorConsult</h1>
          </div>
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #111827; margin-top: 0;">💬 Nouveau message</h2>
            <p style="color: #4b5563;">Bonjour ${data.receiverName},</p>
            <p style="color: #4b5563;">Vous avez reçu un nouveau message de ${data.senderName}.</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #4b5563;"><em>"${data.messagePreview}"</em></p>
            </div>
            <a href="${data.link}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Répondre
            </a>
          </div>
        </div>
      `
    };

    return templates[name] || '<p>Template non trouvé</p>';
  }

  // ... reste des méthodes de notification avec les templates
  async sendAppointmentConfirmation(appointment) {
    const patient = appointment.patient;
    const doctor = appointment.doctor;
    
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    
    const title = 'Rendez-vous confirmé';
    
    // Utiliser le template
    await this.sendTemplateEmail(
      patient.email,
      title,
      'appointment-confirmation',
      {
        patientName: patient.name,
        doctorName: doctor.name,
        date: formattedDate,
        time: appointment.timeSlot.start,
        link: `${process.env.FRONTEND_URL}/patient/appointments/${appointment.id}`
      }
    );

    // Créer la notification en base
    await this.createNotification(
      patient.id,
      'APPOINTMENT_CONFIRMATION',
      title,
      `Votre rendez-vous avec Dr ${doctor.name} a été confirmé.`,
      { appointmentId: appointment.id }
    );

    return true;
  }

  // ... autres méthodes adaptées
}