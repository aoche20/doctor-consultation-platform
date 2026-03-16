'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import ChatWindow from '@/app/components/chat/ChatWindow';
import { User } from '@/app/types';
import { doctorApi } from '@/app/lib/api/doctorApi';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DoctorDirectChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Références pour contrôler les effets
  const isMounted = useRef(true);
  const hasLoaded = useRef(false);
  const toastId = useRef<string | null>(null);

  const userId = params?.userId as string;

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user && userId && !hasLoaded.current && isMounted.current) {
      hasLoaded.current = true;
      loadUser();
    }
  }, [user, isLoading, userId, router]);

  const loadUser = async () => {
    setLoading(true);
    try {
      console.log('📡 Chargement du patient ID:', userId);
      
      const result = await doctorApi.getDoctorDetails(userId);
      
      if (!isMounted.current) return;

      if (result.success && result.doctor) {
        setOtherUser(result.doctor);
      } else {
        // ✅ Toast avec ID unique pour éviter les doublons
        if (!toastId.current) {
          toastId.current = toast.success('Conversation ouverte avec le patient', {
            id: 'conversation-opened' // ID unique
          });
        }
        
        setOtherUser({
          id: parseInt(userId),
          name: `Patient #${userId}`,
          email: `patient${userId}@test.com`,
          role: 'patient',
          profilePicture: ''
        } as User);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      
      if (!toastId.current && isMounted.current) {
        toastId.current = toast.error('Erreur de chargement', {
          id: 'chat-error'
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Utilisateur non trouvé</p>
        <button
          onClick={() => router.push('/doctor/messages')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour à la messagerie
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <ChatWindow
            currentUser={user!}
            otherUser={otherUser}
          />
        </div>
      </div>
    </div>
  );
}