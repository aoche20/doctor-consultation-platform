const cron = require('node-cron');
const prisma = require('../prisma/client');
const notificationService = require('../services/notificationService');

// Exécuter toutes les heures
cron.schedule('0 * * * *', async () => {
  console.log('🔔 Vérification des rappels de rendez-vous...');
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Rendez-vous de demain
  const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
  const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: startOfTomorrow,
        lte: endOfTomorrow
      },
      status: 'confirmed'
    },
    include: {
      patient: true,
      doctor: true
    }
  });

  console.log(`📅 ${appointments.length} rendez-vous trouvés pour demain`);

  for (const appointment of appointments) {
    await notificationService.sendAppointmentReminder(appointment);
  }
});

console.log('✅ Cron job pour les rappels démarré');