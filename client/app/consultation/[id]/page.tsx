'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { appointmentApi } from '@/app/lib/api/appointmentApi';
import VideoRoom from '@/app/components/video/VideoRoom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [permissions, setPermissions] = useState({ camera: false, microphone: false });
  const [userRole, setUserRole] = useState<'patient' | 'doctor' | null>(null);

  const appointmentId = params?.id as string;

  // Vérifier l'authentification et charger le rendez-vous
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Veuillez vous connecter');
        router.push('/login');
        return;
      }
      
      setUserRole(user.role as 'patient' | 'doctor');
      
      if (appointmentId) {
        loadAppointment();
        checkPermissions();
      }
    }
  }, [user, authLoading, appointmentId, router]);

  // Vérifier les permissions caméra/micro
  const checkPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissions({ camera: true, microphone: true });
      console.log('✅ Permissions caméra/micro accordées');
    } catch (err) {
      console.error('❌ Permissions refusées:', err);
      setPermissions({ camera: false, microphone: false });
    }
  };

  // Charger les détails du rendez-vous
  const loadAppointment = async () => {
    setLoading(true);
    try {
      console.log('📡 Chargement du rendez-vous ID:', appointmentId);
      
      const result = await appointmentApi.getAppointmentById(appointmentId);
      console.log('📡 Résultat:', result);
      
      if (result.success && result.appointment) {
        // Vérifier que le rendez-vous est confirmé
        if (result.appointment.status !== 'confirmed') {
          toast.error('Ce rendez-vous n\'est pas encore confirmé');
          
          // Rediriger selon le rôle
          if (user?.role === 'patient') {
            router.push('/patient/appointments');
          } else {
            router.push('/doctor/appointments');
          }
          return;
        }
        
        // Vérifier que l'utilisateur est concerné
        const isPatient = result.appointment.patientId === user?.id;
        const isDoctor = result.appointment.doctorId === user?.id;
        
        if (!isPatient && !isDoctor) {
          toast.error('Vous n\'êtes pas autorisé à rejoindre cette consultation');
          router.push('/');
          return;
        }
        
        setAppointment(result.appointment);
      } else {
        toast.error('Rendez-vous non trouvé');
        router.push('/');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  // Rejoindre la consultation
  const handleJoinCall = () => {
    if (!permissions.camera || !permissions.microphone) {
      toast.error('Veuillez autoriser l\'accès à la caméra et au microphone');
      return;
    }
    setShowVideo(true);
  };

  // Quitter la consultation
  const handleEndCall = () => {
    setShowVideo(false);
    
    // Rediriger selon le rôle
    if (user?.role === 'patient') {
      router.push('/patient/appointments');
    } else {
      router.push('/doctor/appointments');
    }
  };

  // Obtenir le nom de l'autre participant
  const getOtherParticipantName = () => {
    if (!appointment || !user) return '';
    
    if (user.role === 'patient') {
      const doctor = typeof appointment.doctor === 'object' ? appointment.doctor : null;
      return doctor?.name || 'Médecin';
    } else {
      const patient = typeof appointment.patient === 'object' ? appointment.patient : null;
      return patient?.name || 'Patient';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  // Affichage de la salle vidéo
  if (showVideo && appointment) {
    const roomID = `appointment-${appointment.id}`;
    const otherParticipant = getOtherParticipantName();
    
    return (
      <VideoRoom
        roomID={roomID}
        userName={user?.name || 'Utilisateur'}
        userID={`${user?.role}-${user?.id}`}
        role={user?.role as 'patient' | 'doctor'}
        onEndCall={handleEndCall}
      />
    );
  }

  // Page de préparation avant la consultation
  const otherParticipant = getOtherParticipantName();
  const isPatient = user?.role === 'patient';

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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Consultation avec {otherParticipant}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {isPatient 
              ? 'Préparez-vous pour votre consultation médicale' 
              : 'Préparez-vous pour la consultation avec votre patient'}
          </p>

          {/* Vérification des permissions (uniquement pour le patient) */}
          {isPatient && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold text-blue-900 mb-3">Vérification des équipements</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${permissions.camera ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700">Caméra : {permissions.camera ? '✅ Autorisée' : '❌ Non autorisée'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${permissions.microphone ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-sm text-gray-700">Microphone : {permissions.microphone ? '✅ Autorisé' : '❌ Non autorisé'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Informations du rendez-vous */}
          {appointment && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold text-gray-900 mb-3">Détails du rendez-vous</h2>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Date :</span> {new Date(appointment.date).toLocaleDateString('fr-FR')} à {appointment.timeSlot.start}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Durée :</span> 30 minutes
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="font-semibold text-yellow-800 mb-2">
              {isPatient ? 'Avant de rejoindre' : 'Avant de démarrer'}
            </h2>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              {isPatient ? (
                <>
                  <li>Assurez-vous d'être dans un endroit calme</li>
                  <li>Vérifiez votre connexion internet</li>
                  <li>Testez votre caméra et votre microphone</li>
                  <li>Le médecin vous rejoindra dans quelques instants</li>
                </>
              ) : (
                <>
                  <li>Assurez-vous que votre matériel fonctionne correctement</li>
                  <li>Vérifiez votre connexion internet</li>
                  <li>Le patient sera automatiquement notifié</li>
                  <li>La consultation peut durer jusqu'à 30 minutes</li>
                </>
              )}
            </ul>
          </div>

          <button
            onClick={handleJoinCall}
            disabled={isPatient && (!permissions.camera || !permissions.microphone)}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isPatient ? 'Rejoindre la consultation' : 'Démarrer la consultation'}
          </button>

          {isPatient && (!permissions.camera || !permissions.microphone) && (
            <p className="text-sm text-center text-red-600 mt-3">
              Veuillez autoriser l'accès à la caméra et au microphone dans votre navigateur
            </p>
          )}
        </div>
      </div>
    </div>
  );
}