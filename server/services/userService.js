const prisma = require('../prisma/client');

// Fonctions utilitaires pour les utilisateurs
const userService = {
  // Trouver un utilisateur par email
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  // Trouver un utilisateur par ID
  async findById(id) {
    return prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
  },

  // Créer un utilisateur
  async create(data) {
    return prisma.user.create({
      data
    });
  },

  // Mettre à jour un utilisateur
  async update(id, data) {
    return prisma.user.update({
      where: { id: parseInt(id) },
      data
    });
  }
};

module.exports = userService;