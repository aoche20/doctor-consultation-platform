'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import toast from 'react-hot-toast';

export default function AvailabilityRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        toast.error('Veuillez vous connecter');
        router.push('/login');
      } else if (user.role === 'doctor') {
        // Rediriger vers la page avec l'ID du médecin connecté
        const doctorId = user.id || user._id;
        router.replace(`/doctor/availability/${doctorId}`);
      } else {
        toast.error('Accès non autorisé');
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
    </div>
  );
}