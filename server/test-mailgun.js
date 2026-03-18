require('dotenv').config();
const mg = require('./config/mailgun');

async function test() {
  try {
    const msg = {
      from: `DoctorConsult <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: ['votre-email@test.com'], // Remplacez par votre email
      subject: 'Test DoctorConsult avec Mailgun',
      html: '<h1>Test réussi !</h1><p>Mailgun fonctionne correctement avec DoctorConsult.</p>'
    };

    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, msg);
    console.log('✅ Email test envoyé !', response);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

test();