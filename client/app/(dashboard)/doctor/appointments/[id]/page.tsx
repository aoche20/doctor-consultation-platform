'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  CurrencyEuroIcon,
  DocumentIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  DocumentTextIcon
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
  pending: 'En attente de confirmation',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

const TYPE_ICONS = {
  video: VideoCameraIcon,
  audio: PhoneIcon,
  chat: ChatBubbleLeftIcon
};

const TYPE_LABELS = {
  video: 'Consultation vidéo',
  audio: 'Consultation audio',
  chat: 'Consultation par chat',
  'in-person': 'Consultation en cabinet'
};

export default function DoctorAppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const appointmentId = params?.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role === 'doctor' && appointmentId) {
      loadAppointment();
    } else if (user && user.role !== 'doctor') {
      toast.error('Accès non autorisé');
      router.push('/');
    }
  }, [user, authLoading, appointmentId, router]);

  const loadAppointment = async () => {
    setLoading(true);
    try {
      console.log('📡 Chargement du rendez-vous ID:', appointmentId);
      
      const result = await appointmentApi.getAppointmentById(appointmentId);
      console.log('📡 Résultat:', result);
      
      if (result.success && result.appointment) {
        setAppointment(result.appointment);
      } else {
        toast.error(result.message || 'Rendez-vous non trouvé');
        router.push('/doctor/appointments');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!appointment) return;

    setUpdating(true);
    try {
      const result = await appointmentApi.updateAppointmentStatus(
        appointmentId,
        newStatus,
        `Statut mis à jour par le médecin`
      );

      if (result.success) {
        toast.success(`Rendez-vous ${newStatus === 'confirmed' ? 'confirmé' : 'terminé'}`);
        loadAppointment();
      } else {
        toast.error(result.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setUpdating(false);
    }
  };

  const canConfirm = () => {
    return appointment?.status === 'pending';
  };

  const canComplete = () => {
    return appointment?.status === 'confirmed';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Rendez-vous non trouvé</p>
        <button
          onClick={() => router.push('/doctor/appointments')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour à mes rendez-vous
        </button>
      </div>
    );
  }

  const patient = typeof appointment.patient === 'object' ? appointment.patient : null;
  const TypeIcon = TYPE_ICONS[appointment.type as keyof typeof TYPE_ICONS] || VideoCameraIcon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </button>

        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Détail du rendez-vous
              </h1>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[appointment.status]}`}>
                {STATUS_LABELS[appointment.status]}
              </span>
            </div>
            
            <div className="flex gap-2">
              {canConfirm() && (
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={updating}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Confirmer le rendez-vous
                </button>
              )}
              
              {canComplete() && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={updating}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Marquer comme terminé
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations patient */}
            {patient && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Patient
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {patient.profilePicture ? (
                      <Image
                        src={patient.profilePicture}
                        alt={patient.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">
                        {patient.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{patient.name}</h3>
                    <p className="text-gray-600">{patient.email}</p>
                    {patient.phoneNumber && (
                      <p className="text-gray-600 text-sm mt-1">{patient.phoneNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Détails de la consultation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Détails de la consultation
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(appointment.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Horaire</p>
                    <p className="font-medium text-gray-900">
                      {appointment.timeSlot.start} - {appointment.timeSlot.end}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TypeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Type de consultation</p>
                    <p className="font-medium text-gray-900">
                      {TYPE_LABELS[appointment.type as keyof typeof TYPE_LABELS] || appointment.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CurrencyEuroIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Prix</p>
                    <p className="font-medium text-gray-900">
                      {appointment.paymentAmount} €
                    </p>
                    <p className={`text-xs mt-1 ${
                      appointment.paymentStatus === 'paid' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {appointment.paymentStatus === 'paid' ? 'Payé' : 'En attente de paiement'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Symptômes */}
            {appointment.symptoms && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Symptômes décrits par le patient
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {appointment.symptoms}
                </p>
              </div>
            )}
          </div>

          {/* Colonne latérale - Actions */}
          <div className="space-y-4">
            {/* Actions rapides */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              
              <div className="space-y-3">
                {appointment.status === 'confirmed' && (
  <button
    onClick={() => router.push(`/consultation/${appointment.id}`)}
    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
  >
    <VideoCameraIcon className="w-5 h-5" />
    Démarrer la consultation
  </button>
)}
 

                <Link
                  href={`/doctor/appointments`}
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-center"
                >
                  Voir tous les rendez-vous
                </Link>
              </div>
            </div>

            {/* Informations complémentaires */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Informations
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID du rendez-vous</span>
                  <span className="font-mono text-gray-700">
                    {appointment.id.toString().padStart(8, '0').slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Créé le</span>
                  <span className="text-gray-700">
                    {new Date(appointment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {appointment.meetingId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID réunion</span>
                    <span className="font-mono text-gray-700">{appointment.meetingId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}