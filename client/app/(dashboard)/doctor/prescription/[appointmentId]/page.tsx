'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { appointmentApi } from '@/app/lib/api/appointmentApi';
import PrescriptionForm from '@/app/components/prescriptions/PrescriptionForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DoctorPrescriptionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const appointmentId = parseInt(params?.appointmentId as string);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user && user.role === 'doctor' && appointmentId) {
      loadAppointment();
    } else if (user && user.role !== 'doctor') {
      toast.error('Accès non autorisé');
      router.push('/');
    }
  }, [user, isLoading, appointmentId, router]);

  const loadAppointment = async () => {
    setLoading(true);
    try {
      const result = await appointmentApi.getAppointmentById(appointmentId.toString());
      if (result.success && result.appointment) {
        setAppointment(result.appointment);
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

  const handleSuccess = () => {
    router.push(`/doctor/appointments/${appointmentId}`);
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle prescription</h1>
          <p className="text-gray-600 mt-2">
            Pour {appointment.patient?.name} - {new Date(appointment.date).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <PrescriptionForm
          appointmentId={appointmentId}
          onSuccess={handleSuccess}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}