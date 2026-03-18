const formData = require('form-data');
const Mailgun = require('mailgun.js');

// Initialiser Mailgun
const mailgun = new Mailgun(formData);

let mg = null;

if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
  mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    url: process.env.MAILGUN_API_URL || 'https://api.mailgun.net' // Pour EU: 'https://api.eu.mailgun.net'
  });
  console.log('✅ Mailgun configuré');
} else {
  console.log('⚠️ MAILGUN_API_KEY manquante - les emails seront désactivés');
}

module.exports = mg;