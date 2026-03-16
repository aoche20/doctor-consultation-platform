'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { appointmentApi } from '@/app/lib/api/appointmentApi';
import VideoRoom from '@/app/components/video/VideoRoom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DoctorConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [patientName, setPatientName] = useState('');

  const appointmentId = params?.appointmentId as string;

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
      const result = await appointmentApi.getAppointmentById(appointmentId);
      
      if (result.success && result.appointment) {
        // Vérifier que le rendez-vous est confirmé
        if (result.appointment.status !== 'confirmed') {
          toast.error('Ce rendez-vous n\'est pas confirmé');
          router.push('/doctor/appointments');
          return;
        }
        
        setAppointment(result.appointment);
        
        const patient = typeof result.appointment.patient === 'object' 
          ? result.appointment.patient 
          : null;
        setPatientName(patient?.name || 'Patient');
      } else {
        toast.error('Rendez-vous non trouvé');
        router.push('/doctor/appointments');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = () => {
    setShowVideo(true);
  };

  const handleEndCall = () => {
    setShowVideo(false);
    router.push('/doctor/appointments');
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
          Retour
        </button>
      </div>
    );
  }

  if (showVideo) {
    // Utiliser l'ID du rendez-vous comme roomID
    const roomID = `appointment-${appointment.id}`;
    
    return (
      <VideoRoom
        roomID={roomID}
        userName={user?.name || 'Médecin'}
        userID={`doctor-${user?.id}`}
        role="doctor"
        onEndCall={handleEndCall}
      />
    );
  }

  const patient = typeof appointment.patient === 'object' ? appointment.patient : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Consultation avec {patient?.name}
          </h1>

          {/* Informations patient */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-3">Informations patient</h2>
            <p className="text-sm text-gray-700"><span className="font-medium">Nom :</span> {patient?.name}</p>
            <p className="text-sm text-gray-700"><span className="font-medium">Email :</span> {patient?.email}</p>
            {patient?.phoneNumber && (
              <p className="text-sm text-gray-700"><span className="font-medium">Téléphone :</span> {patient.phoneNumber}</p>
            )}
          </div>

          {/* Détails du rendez-vous */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-3">Détails du rendez-vous</h2>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Date :</span> {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.timeSlot.start}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Durée :</span> 30 minutes
            </p>
          </div>

          {/* Symptômes */}
          {appointment.symptoms && (
            <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
              <h2 className="font-semibold text-yellow-800 mb-2">Symptômes décrits</h2>
              <p className="text-sm text-gray-700">{appointment.symptoms}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="font-semibold text-green-800 mb-2">Avant de démarrer</h2>
            <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
              <li>Assurez-vous que votre matériel fonctionne correctement</li>
              <li>Vérifiez votre connexion internet</li>
              <li>Le patient sera automatiquement notifié</li>
              <li>La consultation peut durer jusqu'à 30 minutes</li>
            </ul>
          </div>

          <button
            onClick={handleStartCall}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 transition text-lg"
          >
            Démarrer la consultation
          </button>
        </div>
      </div>
    </div>
  );
}