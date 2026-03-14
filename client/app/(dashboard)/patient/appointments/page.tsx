'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { appointmentApi } from '@/app/lib/api/appointmentApi';
import { Appointment } from '@/app/types';
import { CalendarIcon, ClockIcon, VideoCameraIcon, PhoneIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
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

export default function PatientAppointmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadAppointments();
    }
  }, [user, authLoading, filter, pagination.page]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const status = filter === 'upcoming' ? undefined : filter;
      const result = await appointmentApi.getPatientAppointments(pagination.page, status);
      
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

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;

    try {
      const result = await appointmentApi.updateAppointmentStatus(appointmentId, 'cancelled', 'Annulé par le patient');
      
      if (result.success) {
        toast.success('Rendez-vous annulé avec succès');
        loadAppointments();
      } else {
        toast.error(result.message || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  const canCancel = (appointment: Appointment) => {
    if (appointment.status === 'cancelled' || appointment.status === 'completed') return false;
    
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff > 2;
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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes rendez-vous</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos consultations médicales
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'upcoming'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            À venir
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'pending'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'confirmed'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Confirmés
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'completed'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Terminés
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              filter === 'cancelled'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Annulés
          </button>
        </div>

        {/* Liste des rendez-vous */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun rendez-vous
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore de rendez-vous programmé
            </p>
            <Link
              href="/doctors"
              className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Trouver un médecin
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const TypeIcon = TYPE_ICONS[appointment.type as keyof typeof TYPE_ICONS] || VideoCameraIcon;
              
              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Infos médecin */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        {appointment.doctor.profilePicture ? (
                          <Image
                            src={appointment.doctor.profilePicture}
                            alt={appointment.doctor.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-xl font-bold">
                            {appointment.doctor.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.doctor.name}</h3>
                        <p className="text-blue-600">{appointment.doctor.specialization}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <TypeIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 capitalize">{appointment.type}</span>
                        </div>
                      </div>
                    </div>

                    {/* Date et statut */}
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[appointment.status]}`}>
                        {STATUS_LABELS[appointment.status]}
                      </span>
                      {/* ✅ BADGES DE PAIEMENT AJOUTÉS ICI */}
              {appointment.paymentStatus === 'paid' ? (
                <span className="text-xs text-green-600 font-medium mt-1">✓ Payé</span>
              ) : appointment.paymentStatus === 'pending' ? (
                <span className="text-xs text-yellow-600 font-medium mt-1">⏳ Paiement en attente</span>
              ) : appointment.paymentStatus === 'refunded' ? (
                <span className="text-xs text-orange-600 font-medium mt-1">↩️ Remboursé</span>
              ) : null}

                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(appointment.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4" />
                        <span>{appointment.timeSlot.start}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => router.push(`/consultation/${appointment.id}`)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                      >
                        Rejoindre la consultation
                      </button>
                    )}
                    
                    {canCancel(appointment) && (
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                      >
                        Annuler
                      </button>
                    )}

                    <Link
                      href={`/patient/appointments/${appointment.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                    >
                      Détails
                    </Link>
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