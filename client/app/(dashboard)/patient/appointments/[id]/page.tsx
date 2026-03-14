'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { appointmentApi } from '@/app/lib/api/appointmentApi';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { Appointment } from '@/app/types';
import {
  CalendarIcon,
  ClockIcon,
  VideoCameraIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  CurrencyEuroIcon,
  DocumentIcon,        // ✅ Remplacé par DocumentIcon
  ArrowLeftIcon,
  PencilIcon,
  CreditCardIcon,      // ✅ Ajouté pour le paiement
  CheckCircleIcon      // ✅ Ajouté pour les statuts
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

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const appointmentId = params?.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      loadAppointment();
    }
  }, [user, authLoading, appointmentId]);

 // ✅ VERSION CORRIGÉE
  const loadAppointment = async () => {
    setLoading(true);
    try {
      console.log('📡 Chargement du rendez-vous ID:', appointmentId);
      
      const result = await appointmentApi.getAppointmentById(appointmentId);
      console.log('📡 Résultat API:', result);
      
      if (result.success && result.appointment) {
        console.log('✅ Rendez-vous trouvé:', result.appointment);
        setAppointment(result.appointment);
      } else {
        console.log('❌ Rendez-vous non trouvé:', result.message);
        toast.error(result.message || 'Rendez-vous non trouvé');
        router.push('/patient/appointments');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;

    setCancelling(true);
    try {
      const result = await appointmentApi.updateAppointmentStatus(
        appointmentId,
        'cancelled',
        'Annulé par le patient'
      );

      if (result.success) {
        toast.success('Rendez-vous annulé avec succès');
        // Recharger les données
        loadAppointment();
      } else {
        toast.error(result.message || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = () => {
    if (!appointment) return false;
    if (appointment.status === 'cancelled' || appointment.status === 'completed') return false;
    
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff > 2;
  };

  const canJoin = () => {
    if (!appointment) return false;
    if (appointment.status !== 'confirmed') return false;
    
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const diffInMinutes = (appointmentDate.getTime() - now.getTime()) / (1000 * 60);
    
    // Peut rejoindre 5 minutes avant et jusqu'à 30 minutes après
    return diffInMinutes <= 5 && diffInMinutes >= -30;
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
          onClick={() => router.push('/patient/appointments')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour à mes rendez-vous
        </button>
      </div>
    );
  }

  const doctor = typeof appointment.doctor === 'object' ? appointment.doctor : null;
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
            
            {canJoin() && (
              <button
                onClick={() => router.push(`/consultation/${appointment.id}`)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
              >
                <VideoCameraIcon className="w-5 h-5" />
                Rejoindre la consultation
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations médecin */}
            {doctor && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Médecin
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {doctor.profilePicture ? (
                      <Image
                        src={doctor.profilePicture}
                        alt={doctor.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">
                        {doctor.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <p className="text-blue-600">{doctor.specialization}</p>
                    
                    {doctor.rating && doctor.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                              key={star}
                              className={`w-4 h-4 ${
                                star <= doctor.rating! ? 'text-yellow-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {doctor.rating.toFixed(1)} ({doctor.totalReviews || 0} avis)
                        </span>
                      </div>
                    )}

                    <Link
                      href={`/doctors/${doctor.name?.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Voir le profil complet →
                    </Link>
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
                  Symptômes décrits
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {appointment.symptoms}
                </p>
              </div>
            )}

            {/* Prescription (si disponible) */}
            {appointment.prescription && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Prescription
                  </h2>
                </div>
                
                {appointment.prescription.medicines?.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {appointment.prescription.medicines.map((medicine, index) => (
                      <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                        <p className="font-medium text-gray-900">{medicine.name}</p>
                        <p className="text-sm text-gray-600">
                          {medicine.dosage} - {medicine.duration}
                        </p>
                        {medicine.instructions && (
                          <p className="text-sm text-gray-500 mt-1">
                            {medicine.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {appointment.prescription.additionalNotes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-700">
                      {appointment.prescription.additionalNotes}
                    </p>
                  </div>
                )}
                
                {appointment.prescription.followUpDate && (
                  <div className="mt-4 text-sm text-gray-600">
                    Prochain rendez-vous recommandé : {new Date(appointment.prescription.followUpDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colonne latérale - Actions */}
          <div className="space-y-4">
            {/* Actions disponibles */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              
              <div className="space-y-3">
                {canCancel() && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {cancelling ? 'Annulation...' : 'Annuler ce rendez-vous'}
                  </button>
                )}
                
                {appointment.paymentStatus === 'pending' && (
  <Link
    href={`/payment/${appointment.id}`}
    className="block w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-center"
  >
    <CreditCardIcon className="w-5 h-5 inline-block mr-2" />
    Procéder au paiement
  </Link>
)}

{appointment.paymentStatus === 'paid' && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    <p className="text-green-700 font-medium flex items-center gap-2">
      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
      Paiement confirmé
    </p>
    <button
      onClick={() => window.open(`/api/payments/invoice/${appointment.id}`, '_blank')}
      className="mt-2 text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
    >
      <DocumentTextIcon className="w-4 h-4" />
      Voir la facture
    </button>
  </div>
)}

{appointment.paymentStatus === 'refunded' && (
  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
    <p className="text-orange-700 font-medium">
      Remboursement effectué
    </p>
  </div>
)}

{appointment.paymentStatus === 'failed' && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-700 font-medium mb-2">
      Paiement échoué
    </p>
    <Link
      href={`/payment/${appointment.id}`}
      className="text-sm text-red-600 hover:text-red-700 font-medium"
    >
      Réessayer le paiement →
    </Link>
  </div>
)}

                <Link
                  href={`/patient/appointments`}
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-center"
                >
                  Voir tous mes rendez-vous
                </Link>

                <Link
                  href="/doctors"
                  className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-center"
                >
                  Prendre un nouveau rendez-vous
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
                  <span className="font-mono text-gray-700">{appointment.id.toString().slice(-8)}</span>
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