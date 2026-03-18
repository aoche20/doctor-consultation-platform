const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const fs = require('fs');
const { Server } = require('socket.io');
require('./cron/reminderJobs');

// Importer Prisma
const prisma = require('./prisma/client');

dotenv.config();

// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const app = express();
const server = http.createServer(app);
// Configuration Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});

// Stockage des connexions utilisateur
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Nouvelle connexion socket:', socket.id);

  // Authentifier l'utilisateur
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSockets.set(userId, socket.id);
    console.log(`👤 Utilisateur ${userId} connecté`);
  }

  // Rejoindre une room de conversation
  socket.on('join-conversation', (otherUserId) => {
    const roomId = [userId, otherUserId].sort().join('-');
    socket.join(roomId);
    console.log(`📦 Room rejoint: ${roomId}`);
  });

  // Envoyer un message
  socket.on('send-message', async (data) => {
    const { receiverId, message } = data;
    
    // Sauvegarder en base de données
    // (on pourrait appeler le contrôleur ici)
    
    const roomId = [userId, receiverId].sort().join('-');
    
    // Émettre au destinataire
    io.to(roomId).emit('new-message', {
      ...message,
      senderId: userId,
      createdAt: new Date()
    });

    // Notification en temps réel
    const receiverSocketId = userSockets.get(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('message-notification', {
        from: userId,
        message: message.content.substring(0, 50)
      });
    }
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('🔌 Déconnexion socket:', socket.id);
    userSockets.forEach((value, key) => {
      if (value === socket.id) {
        userSockets.delete(key);
      }
    });
  });
});

// Rendre io accessible dans les contrôleurs
app.set('io', io);

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
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
 
app.use('/api/stats', require('./routes/stats'));
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
      database: 'Mysql with Prisma',
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