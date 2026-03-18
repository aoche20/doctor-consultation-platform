'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { statsApi } from '@/app/lib/api/statsApi';
import BarChart from '@/app/components/charts/BarChart';
import LineChart from '@/app/components/charts/LineChart';
import PieChart from '@/app/components/charts/PieChart';
import { 
  CalendarIcon, 
  CurrencyEuroIcon, 
  UserGroupIcon, 
  StarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DoctorStatsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user && user.role === 'doctor') {
      loadStats();
    } else if (user && user.role !== 'doctor') {
      toast.error('Accès non autorisé');
      router.push('/');
    }
  }, [user, isLoading, period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const result = await statsApi.getDoctorStats(period);
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
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(new Blob([result.csv]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rendez-vous.csv';
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

  const statusMap: { [key: string]: string } = {
    pending: 'En attente',
    confirmed: 'Confirmés',
    completed: 'Terminés',
    cancelled: 'Annulés'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-2">
              Bienvenue, Dr {user?.name}
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Exporter CSV
            </button>
          </div>
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
            <p className="text-gray-600">Total rendez-vous</p>
            <div className="mt-2 text-sm text-green-600">
              {stats.overview.completionRate}% terminés
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CurrencyEuroIcon className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.overview.totalRevenue}€
              </span>
            </div>
            <p className="text-gray-600">Revenus totaux</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.overview.totalPatients}
              </span>
            </div>
            <p className="text-gray-600">Patients uniques</p>
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
            <p className="text-gray-600">Note moyenne</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Évolution des rendez-vous */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Évolution des rendez-vous
            </h2>
            <LineChart
              labels={stats.charts.appointmentsTimeline.map((item: any) => {
                const date = new Date(item.date);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              })}
              datasets={[{
                label: 'Rendez-vous',
                data: stats.charts.appointmentsTimeline.map((item: any) => item.count),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true
              }]}
            />
          </div>

          {/* Distribution par statut */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribution par statut
            </h2>
            <PieChart
              labels={stats.charts.statusDistribution.map((item: any) => 
                statusMap[item.status] || item.status
              )}
              data={stats.charts.statusDistribution.map((item: any) => item._count)}
            />
          </div>
        </div>

        {/* Revenus et satisfaction */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenus par mois */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Revenus mensuels
            </h2>
            <BarChart
              labels={stats.charts.revenueByMonth.map((item: any) => {
                const [year, month] = item.month.split('-');
                return `${month}/${year}`;
              })}
              datasets={[{
                label: 'Revenus (€)',
                data: stats.charts.revenueByMonth.map((item: any) => item.total)
              }]}
            />
          </div>

          {/* Satisfaction par mois */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Satisfaction patient
            </h2>
            <LineChart
              labels={stats.charts.satisfactionByMonth.map((item: any) => {
                const [year, month] = item.month.split('-');
                return `${month}/${year}`;
              })}
              datasets={[{
                label: 'Note moyenne',
                data: stats.charts.satisfactionByMonth.map((item: any) => 
                  parseFloat(item.avgRating).toFixed(1)
                ),
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true
              }]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}