const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    console.log('✅ Configuration email chargée');
  } catch (error) {
    console.error('❌ Erreur configuration email:', error.message);
    console.log('📧 Les emails seront désactivés');
  }
} else {
  console.log('📧 Service email non configuré (variables manquantes)');
}

module.exports = transporter;