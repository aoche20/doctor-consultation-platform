'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { CalendarIcon, UserIcon, ClockIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Appointment {
  _id: string;
  doctor: {
    name: string;
    specialization: string;
    profilePicture?: string;
  };
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  status: string;
  type: string;
}

export default function PatientDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchAppointments();
    }
  }, [user, authLoading, router]);

  const fetchAppointments = async () => {
    try {
      // Simuler des données pour le moment
      // À remplacer par un vrai appel API
      setAppointments([]);
    } catch (error) {
      console.error('Erreur chargement rendez-vous:', error);
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.name} ! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Bienvenue sur votre espace patient. Gérez vos rendez-vous et votre santé en toute simplicité.
        </p>
      </div>

      {/* Cartes d'actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/doctors" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
            <VideoCameraIcon className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-lg">Trouver un médecin</h3>
            <p className="text-sm text-gray-600">Recherchez et consultez des spécialistes</p>
          </div>
        </Link>

        <Link href="/patient/appointments" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
            <CalendarIcon className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-lg">Mes rendez-vous</h3>
            <p className="text-sm text-gray-600">Consultez et gérez vos consultations</p>
          </div>
        </Link>

        <Link href="/patient/profile" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
            <UserIcon className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-lg">Mon profil</h3>
            <p className="text-sm text-gray-600">Mettez à jour vos informations</p>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6">
          <ClockIcon className="w-8 h-8 text-orange-600 mb-3" />
          <h3 className="font-semibold text-lg">Prochain rendez-vous</h3>
          <p className="text-sm text-gray-600">Aucun rendez-vous prévu</p>
        </div>
      </div>

      {/* Section des rendez-vous à venir */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Vos prochains rendez-vous</h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Vous n'avez aucun rendez-vous prévu</p>
            <Link href="/doctors">
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Prendre un rendez-vous
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt._id} className="border rounded-lg p-4">
                {/* Contenu des rendez-vous à venir */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section des recommandations */}
      <div className="bg-blue-50 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recommandations santé</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium">Consultation préventive</h3>
            <p className="text-sm text-gray-600 mt-1">Faites un check-up régulier avec votre médecin traitant</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium">Vaccination</h3>
            <p className="text-sm text-gray-600 mt-1">Pensez à mettre à jour vos vaccins</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h3 className="font-medium">Téléconsultation</h3>
            <p className="text-sm text-gray-600 mt-1">Consultez à distance pour les petits maux du quotidien</p>
          </div>
        </div>
      </div>
    </div>
  );
}