const cloudinary = require('cloudinary').v2;

// Ajoutez un log pour vérifier les clés (à retirer en production)
console.log('📸 Configuration Cloudinary:');
console.log('- Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Défini' : '❌ Manquant');
console.log('- API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Défini' : '❌ Manquant');
console.log('- API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Défini' : '❌ Manquant');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;