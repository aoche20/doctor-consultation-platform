'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { CalendarIcon, UserGroupIcon, CurrencyEuroIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function DoctorDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, Dr. {user?.name} ! 👨‍⚕️
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez vos consultations et votre planning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <CalendarIcon className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-lg">5</h3>
          <p className="text-sm text-gray-600">Rendez-vous aujourd'hui</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <UserGroupIcon className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-lg">127</h3>
          <p className="text-sm text-gray-600">Patients total</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <CurrencyEuroIcon className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-lg">{user?.consultationFee} €</h3>
          <p className="text-sm text-gray-600">Prix consultation</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <ClockIcon className="w-8 h-8 text-orange-600 mb-3" />
          <h3 className="font-semibold text-lg">8</h3>
          <p className="text-sm text-gray-600">Heures disponibles</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Prochains rendez-vous</h2>
          <p className="text-gray-600 text-center py-8">Aucun rendez-vous pour le moment</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Aperçu des disponibilités</h2>
          <p className="text-gray-600 text-center py-8">Configurez vos disponibilités</p>
        </div>
      </div>
    </div>
  );
}