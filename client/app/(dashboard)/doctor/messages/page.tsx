'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import ConversationList from '@/app/components/chat/ConversationList';
import ChatWindow from '@/app/components/chat/ChatWindow';
import { Conversation } from '@/app/lib/api/messageApi';
import { User } from '@/app/types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PatientMessagesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messagerie</h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex h-[700px]">
            {/* Liste des conversations (mobile/desktop) */}
            <div className={`${showChat ? 'hidden md:block' : 'block'} md:w-1/3 border-r`}>
              <ConversationList
                currentUserId={user.id}
                onSelectConversation={handleSelectConversation}
                selectedUserId={selectedConversation?.user.id}
              />
            </div>

            {/* Fenêtre de chat */}
            <div className={`${!showChat ? 'hidden md:flex' : 'flex'} md:w-2/3 flex-col`}>
              {selectedConversation ? (
                <>
                  <div className="md:hidden p-2 border-b">
                    <button
                      onClick={() => setShowChat(false)}
                      className="flex items-center gap-2 text-blue-600"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      Retour
                    </button>
                  </div>
                  <ChatWindow
                    currentUser={user}
                    otherUser={selectedConversation.user}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Sélectionnez une conversation
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}