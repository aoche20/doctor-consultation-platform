'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { statsApi } from '@/app/lib/api/statsApi';
import { 
  CalendarIcon, 
  CurrencyEuroIcon, 
  StarIcon,
  ClockIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function PatientStatsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user && user.role === 'patient') {
      loadStats();
    } else if (user && user.role !== 'patient') {
      toast.error('Accès non autorisé');
      router.push('/');
    }
  }, [user, isLoading]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const result = await statsApi.getPatientStats();
      if (result.success) {
        setStats(result.stats);
      } else {
        toast.error('Erreur lors du chargement des statistiques');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const result = await statsApi.exportAppointments();
      if (result.success) {
        const url = window.URL.createObjectURL(new Blob([result.csv]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mes-rendez-vous.csv';
        a.click();
      } else {
        toast.error('Erreur lors de l\'export');
      }
    } catch (error) {
      console.error('❌ Erreur export:', error);
      toast.error('Erreur de connexion');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mon historique</h1>
            <p className="text-gray-600 mt-2">
              Bonjour {user?.name}
            </p>
          </div>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mt-4 md:mt-0"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Exporter mes données
          </button>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.overview.totalAppointments}
              </span>
            </div>
            <p className="text-gray-600">Rendez-vous total</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.overview.upcomingAppointments}
              </span>
            </div>
            <p className="text-gray-600">À venir</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CurrencyEuroIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.overview.totalSpent}€
              </span>
            </div>
            <p className="text-gray-600">Total dépensé</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <StarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.overview.averageRating}
              </span>
            </div>
            <p className="text-gray-600">Note moyenne donnée</p>
          </div>
        </div>

        {/* Médecins les plus consultés */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Médecins les plus consultés
          </h2>
          
          {stats.topDoctors.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Vous n'avez pas encore consulté de médecin
            </p>
          ) : (
            <div className="space-y-4">
              {stats.topDoctors.map((item: any) => (
                <div key={item.doctor?.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {item.doctor?.profilePicture ? (
                        <Image
                          src={item.doctor.profilePicture}
                          alt={item.doctor.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                          {item.doctor?.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.doctor?.name}</p>
                      <p className="text-sm text-blue-600">{item.doctor?.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                    <p className="text-sm text-gray-500">consultation(s)</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}