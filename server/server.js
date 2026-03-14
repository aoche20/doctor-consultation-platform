const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const fs = require('fs');

// Importer Prisma
const prisma = require('./prisma/client');

dotenv.config();

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const app = express();
const server = http.createServer(app);

// ============================================
// CONFIGURATION WEBOOK STRIPE
// ============================================
app.post('/api/payments/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const { handleWebhook } = require('./controllers/paymentController');
      await handleWebhook(req, res);
    } catch (error) {
      console.error('❌ Erreur webhook:', error);
      res.status(500).json({ error: 'Erreur webhook' });
    }
  }
);

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// MIDDLEWARE PRISMA (injecter prisma dans req)
// ============================================
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/payments', require('./routes/payments'));

// ============================================
// ROUTE DE TEST
// ============================================
app.get('/', async (req, res) => {
  try {
    // Tester la connexion Prisma
    await prisma.$queryRaw`ping`;
    res.json({ 
      message: '🚀 API Doctor Consultation Platform',
      status: 'running',
      database: 'MongoDB with Prisma',
      connection: 'OK'
    });
  } catch (error) {
    res.json({ 
      message: '🚀 API Doctor Consultation Platform',
      status: 'running',
      database: 'MongoDB with Prisma',
      connection: 'Error - ' + error.message
    });
  }
});

// ============================================
// DÉMARRAGE
// ============================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📅 ${new Date().toLocaleString()}`);
  console.log(`🗄️  Base de données: Mysql avec Prisma`);
});

// ============================================
// ARRÊT GRACIEUX
// ============================================
process.on('SIGINT', async () => {
  console.log('\n👋 Arrêt du serveur...');
  await prisma.$disconnect();
  console.log('🔌 Déconnecté de MongoDB');
  process.exit(0);
});