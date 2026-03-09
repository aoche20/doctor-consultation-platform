const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB avec succès');
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à MongoDB:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API Doctor Consultation Platform',
    status: 'running',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});