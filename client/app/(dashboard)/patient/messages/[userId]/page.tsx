'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import ChatWindow from '@/app/components/chat/ChatWindow';
import { User } from '@/app/types';
import { doctorApi } from '@/app/lib/api/doctorApi';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function PatientDirectChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = params?.userId as string;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user && userId) {
      loadUser();
    }
  }, [user, isLoading, userId, router]);

  const loadUser = async () => {
    setLoading(true);
    try {
      console.log('📡 Chargement du médecin ID:', userId);
      
      const result = await doctorApi.getDoctorDetails(userId);
      
      if (result.success && result.doctor) {
        setOtherUser(result.doctor);
      } else {
        toast.error('Médecin non trouvé');
        router.push('/patient/messages');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
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
    return null;
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