'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { messageApi, Conversation } from '@/app/lib/api/messageApi';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface ConversationListProps {
  currentUserId: number;
  onSelectConversation: (conversation: Conversation) => void;
  selectedUserId?: number;
}

export default function ConversationList({
  currentUserId,
  onSelectConversation,
  selectedUserId
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const result = await messageApi.getConversations();
      if (result.success && result.conversations) {
        setConversations(result.conversations);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: fr
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune conversation</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {conversations.map((conv) => (
        <button
          key={conv.user.id}
          onClick={() => onSelectConversation(conv)}
          className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition ${
            selectedUserId === conv.user.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
              {conv.user.profilePicture ? (
                <Image
                  src={conv.user.profilePicture}
                  alt={conv.user.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                  {conv.user.name.charAt(0)}
                </div>
              )}
            </div>
            {conv.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {conv.unreadCount}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h4 className="font-medium text-gray-900 truncate">
                {conv.user.name}
              </h4>
              <span className="text-xs text-gray-500">
                {formatLastMessageTime(conv.lastMessage.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {conv.lastMessage.senderId === currentUserId ? 'Vous : ' : ''}
              {conv.lastMessage.content}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}