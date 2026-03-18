const prisma = require('../prisma/client');

// ============================================
// ENVOYER UN MESSAGE
// ============================================
// @desc    Envoyer un message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, appointmentId } = req.body;

    if (!content || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Contenu et destinataire requis'
      });
    }

    // Vérifier que le destinataire existe
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId) }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Destinataire non trouvé'
      });
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.user.id,
        receiverId: parseInt(receiverId),
        appointmentId: appointmentId ? parseInt(appointmentId) : null
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePicture: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePicture: true
          }
        }
      }
    });

    // ✅ ENVOI DE NOTIFICATION - DÉPLACÉ ICI APRÈS LA CRÉATION DU MESSAGE
    try {
      const sender = message.sender; // Déjà inclus dans le message
      const receiver = message.receiver; // Déjà inclus dans le message
      
      await notificationService.sendNewMessageNotification(message, sender, receiver);
    } catch (notifError) {
      console.error('❌ Erreur envoi notification message:', notifError);
      // On ne bloque pas la réponse même si la notification échoue
    }

    // Émettre un événement WebSocket pour notifier le destinataire en temps réel
    const io = req.app.get('io');
    const roomId = [req.user.id, parseInt(receiverId)].sort().join('-');
    io.to(roomId).emit('new-message', message);

    res.status(201).json({
      success: true,
      message
    });

  } catch (error) {
    console.error('❌ Erreur sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// RÉCUPÉRER LA CONVERSATION AVEC UN UTILISATEUR
// ============================================
// @desc    Récupérer les messages entre deux utilisateurs
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { AND: [{ senderId: req.user.id }, { receiverId: otherUserId }] },
          { AND: [{ senderId: otherUserId }, { receiverId: req.user.id }] }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      },
      skip,
      take: parseInt(limit),
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePicture: true
          }
        }
      }
    });

    // Marquer les messages comme lus
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: req.user.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    const total = await prisma.message.count({
      where: {
        OR: [
          { AND: [{ senderId: req.user.id }, { receiverId: otherUserId }] },
          { AND: [{ senderId: otherUserId }, { receiverId: req.user.id }] }
        ]
      }
    });

    res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('❌ Erreur getConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// RÉCUPÉRER LES CONVERSATIONS RÉCENTES
// ============================================
// @desc    Récupérer la liste des conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Récupérer tous les messages où l'utilisateur est impliqué
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePicture: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePicture: true
          }
        }
      }
    });

    // Regrouper par interlocuteur
    const conversationsMap = new Map();

    messages.forEach(message => {
      const otherUser = message.senderId === req.user.id ? message.receiver : message.sender;
      const key = otherUser.id;

      if (!conversationsMap.has(key) || 
          new Date(message.createdAt) > new Date(conversationsMap.get(key).lastMessage.createdAt)) {
        
        // Compter les messages non lus
        const unreadCount = messages.filter(m => 
          m.senderId === otherUser.id && 
          m.receiverId === req.user.id && 
          !m.isRead
        ).length;

        conversationsMap.set(key, {
          user: otherUser,
          lastMessage: message,
          unreadCount
        });
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('❌ Erreur getConversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// MARQUER LES MESSAGES COMME LUS
// ============================================
// @desc    Marquer tous les messages d'un expéditeur comme lus
// @route   PUT /api/messages/read/:senderId
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const senderId = parseInt(req.params.senderId);

    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId: req.user.id,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Messages marqués comme lus'
    });

  } catch (error) {
    console.error('❌ Erreur markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// ============================================
// SUPPRIMER UN MESSAGE
// ============================================
// @desc    Supprimer un message (soft delete)
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);

    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'expéditeur
    if (message.senderId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres messages'
      });
    }

    // Soft delete : on pourrait ajouter un champ isDeleted
    // Pour l'instant, on supprime vraiment
    await prisma.message.delete({
      where: { id: messageId }
    });

    res.json({
      success: true,
      message: 'Message supprimé'
    });

  } catch (error) {
    console.error('❌ Erreur deleteMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};