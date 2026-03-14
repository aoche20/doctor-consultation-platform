'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { appointmentApi } from '@/app/lib/api/appointmentApi';
import { Appointment } from '@/app/types';
import { 
  CalendarIcon, 
  ClockIcon, 
  VideoCameraIcon, 
  PhoneIcon, 
  ChatBubbleLeftIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
};

const STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

const TYPE_ICONS = {
  video: VideoCameraIcon,
  audio: PhoneIcon,
  chat: ChatBubbleLeftIcon
};

export default function DoctorAppointmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role === 'doctor') {
      loadAppointments();
    } else if (user && user.role !== 'doctor') {
      toast.error('Accès non autorisé');
      router.push('/');
    }
  }, [user, authLoading, filter, pagination.page, selectedDate]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const status = filter === 'upcoming' ? undefined : filter;
      const date = filter === 'upcoming' ? selectedDate : undefined;
      
      const result = await appointmentApi.getDoctorAppointments(pagination.page, status, date);
      
      if (result.success) {
        setAppointments(result.appointments || []);
        setPagination(result.pagination || { page: 1, total: 0, pages: 0 });
      } else {
        toast.error('Erreur lors du chargement des rendez-vous');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: number, newStatus: string) => {
    try {
      const result = await appointmentApi.updateAppointmentStatus(
        appointmentId.toString(),
        newStatus,
        `Statut mis à jour par le médecin`
      );

      if (result.success) {
        toast.success(`Rendez-vous ${newStatus === 'confirmed' ? 'confirmé' : 'terminé'}`);
        loadAppointments();
      } else {
        toast.error(result.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  const canConfirm = (appointment: Appointment) => {
    return appointment.status === 'pending';
  };

  const canComplete = (appointment: Appointment) => {
    return appointment.status === 'confirmed';
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des rendez-vous</h1>
          <p className="text-gray-600 mt-2">
            Consultez et gérez vos consultations
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  filter === 'upcoming'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                À venir
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  filter === 'pending'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En attente
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  filter === 'confirmed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmés
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  filter === 'completed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Terminés
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  filter === 'cancelled'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Annulés
              </button>
            </div>
            
            {filter === 'upcoming' && (
              <div className="flex-1 max-w-xs">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Liste des rendez-vous */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun rendez-vous
            </h3>
            <p className="text-gray-600">
              Aucun rendez-vous ne correspond à vos critères
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const patient = typeof appointment.patient === 'object' ? appointment.patient : null;
              const TypeIcon = TYPE_ICONS[appointment.type as keyof typeof TYPE_ICONS] || VideoCameraIcon;
              
              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Infos patient */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        {patient?.profilePicture ? (
                          <Image
                            src={patient.profilePicture}
                            alt={patient.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xl font-bold">
                            {patient?.name?.charAt(0) || 'P'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{patient?.name}</h3>
                        <p className="text-gray-600 text-sm">{patient?.email}</p>
                        {patient?.phoneNumber && (
                          <p className="text-gray-500 text-xs mt-1">{patient.phoneNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* Infos consultation */}
                    <div className="flex flex-col items-start lg:items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[appointment.status]}`}>
                        {STATUS_LABELS[appointment.status]}
                      </span>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(appointment.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        <span>{appointment.timeSlot.start} - {appointment.timeSlot.end}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TypeIcon className="w-4 h-4" />
                        <span className="capitalize">{appointment.type}</span>
                      </div>

                      {appointment.paymentStatus === 'paid' && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircleIcon className="w-3 h-3" />
                          <span>Paiement reçu ({appointment.paymentAmount}€)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Symptômes */}
                  {appointment.symptoms && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Symptômes :</span> {appointment.symptoms}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap justify-end gap-3 mt-4 pt-4 border-t">
                    {canConfirm(appointment) && (
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Confirmer
                      </button>
                    )}
                    
                    {canComplete(appointment) && (
                      <button
                        onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Marquer comme terminé
                      </button>
                    )}

                    <button
                      onClick={() => router.push(`/doctor/appointments/${appointment.id}`)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                    >
                      Détails
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} sur {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}