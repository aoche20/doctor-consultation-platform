'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useSocket } from '@/app/lib/hooks/useSocket';
import { messageApi, Message } from '@/app/lib/api/messageApi';
import { User } from '@/app/types';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  currentUser: User;
  otherUser: User;
  appointmentId?: number;
  onClose?: () => void;
}

export default function ChatWindow({ currentUser, otherUser, appointmentId, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket(currentUser.id.toString());

  // Set pour éviter les messages en double
  const messageIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    loadMessages();

    if (socket && isConnected) {
      socket.emit('join-conversation', otherUser.id);

      socket.on('new-message', (message: Message) => {
        // ✅ Vérifier si le message est déjà dans la liste
        setMessages(prev => {
          // Éviter les doublons
          if (messageIdsRef.current.has(message.id)) {
            console.log('⏭️ Message déjà reçu, ignoré');
            return prev;
          }
          
          // Ajouter l'ID au Set
          messageIdsRef.current.add(message.id);
          
          // Ajouter le message
          return [...prev, message];
        });
        
        scrollToBottom();
      });
    }

    return () => {
      if (socket) {
        socket.off('new-message');
      }
    };
  }, [socket, isConnected, otherUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const result = await messageApi.getConversation(otherUser.id);
      if (result.success && result.messages) {
        // Remplir le Set avec les IDs des messages existants
        messageIdsRef.current = new Set(result.messages.map(m => m.id));
        setMessages(result.messages);
      }
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Vider immédiatement pour éviter la double soumission
    setSending(true);

    try {
      // ✅ Créer un ID temporaire pour éviter les doublons
      const tempId = Date.now();
      
      // Message temporaire pour l'UI
      const tempMessage: Message = {
        id: tempId,
        content: messageContent,
        senderId: currentUser.id,
        receiverId: otherUser.id,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          profilePicture: currentUser.profilePicture
        },
        receiver: {
          id: otherUser.id,
          name: otherUser.name,
          role: otherUser.role,
          profilePicture: otherUser.profilePicture
        },
        isRead: false,
        createdAt: new Date().toISOString()
      };

      // Ajouter le message temporaire
      setMessages(prev => [...prev, tempMessage]);
      messageIdsRef.current.add(tempId);
      scrollToBottom();

      // Envoyer au serveur
      const result = await messageApi.sendMessage(
        otherUser.id,
        messageContent,
        appointmentId
      );

      if (result.success && result.message) {
        // Remplacer le message temporaire par le vrai message
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempId);
          messageIdsRef.current.delete(tempId);
          messageIdsRef.current.add(result.message!.id);
          return [...filtered, result.message!];
        });
      } else {
        // En cas d'erreur, retirer le message temporaire
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempId);
          messageIdsRef.current.delete(tempId);
          return filtered;
        });
        toast.error('Erreur lors de l\'envoi');
        // Remettre le message dans l'input
        setNewMessage(messageContent);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de connexion');
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
            {otherUser.profilePicture ? (
              <Image
                src={otherUser.profilePicture}
                alt={otherUser.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-300 text-blue-600 font-bold">
                {otherUser.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{otherUser.name}</h3>
            <p className="text-xs text-blue-200">
              {otherUser.role === 'doctor' ? 'Médecin' : 'Patient'}
              {isConnected && ' • 🟢 En ligne'}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white hover:text-gray-200">
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Aucun message pour le moment</p>
            <p className="text-sm mt-2">Envoyez le premier message !</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUser.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 shadow'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span
                      className={`text-xs ${
                        isCurrentUser ? 'text-blue-200' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </span>
                    {isCurrentUser && message.isRead && (
                      <span className={`text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                        ✓✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez votre message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}