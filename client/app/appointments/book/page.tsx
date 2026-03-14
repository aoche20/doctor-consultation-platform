'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { doctorApi } from '@/app/lib/api/doctorApi';
import { appointmentApi } from '@/app/lib/api/appointmentApi';
import AppointmentCalendar from '@/app/components/appointments/AppointmentCalendar';
import { User } from '@/app/types';
import { VideoCameraIcon, ChatBubbleLeftIcon, PhoneIcon, CurrencyEuroIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const doctorId = searchParams.get('doctorId');
  
  const [doctor, setDoctor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Array<{ start: string; end: string; available: boolean }>>([]);
  const [appointmentType, setAppointmentType] = useState('video');
  const [symptoms, setSymptoms] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'patient') {
      toast.error('Seuls les patients peuvent prendre rendez-vous');
      router.push('/');
      return;
    }

    if (doctorId) {
      loadDoctor();
    }
  }, [doctorId, isAuthenticated, user]);

  const loadDoctor = async () => {
    setLoading(true);
    try {
      const result = await doctorApi.getDoctorDetails(doctorId!);
      if (result.success && result.doctor) {
        setDoctor(result.doctor);
      } else {
        toast.error('Médecin non trouvé');
        router.push('/doctors');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate && doctorId) {
      loadAvailableSlots();
    }
  }, [selectedDate, doctorId]);

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;
    
    setLoadingSlots(true);
    try {
      const dateStr = formatDate(selectedDate);
      const result = await appointmentApi.getAvailableSlots(doctorId!, dateStr);
      if (result.success && result.availableSlots) {
        setAvailableSlots(result.availableSlots);
      }
    } catch (error) {
      console.error('Erreur chargement créneaux:', error);
      toast.error('Erreur lors du chargement des créneaux');
    } finally {
      setLoadingSlots(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: { start: string; end: string }) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot || !doctor) return;

    setSubmitting(true);
    try {
      const result = await appointmentApi.createAppointment({
        doctorId: doctor.id || doctor._id,
        date: formatDate(selectedDate),
        timeSlot: selectedSlot,
        type: appointmentType,
        symptoms: symptoms.trim() || undefined
      });

      if (result.success && result.appointment) {
        toast.success('Rendez-vous pris avec succès !');
        router.push(`/patient/appointments/${result.appointment._id}`);
      } else {
        toast.error(result.message || 'Erreur lors de la prise de rendez-vous');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Médecin non trouvé</p>
        <button
          onClick={() => router.push('/doctors')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retour à la recherche
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            ← Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Prendre rendez-vous</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Infos médecin */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
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
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{doctor.name}</h2>
                  <p className="text-blue-600">{doctor.specialization}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Prix consultation</span>
                  <span className="font-semibold text-gray-900">{doctor.consultationFee} €</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Expérience</span>
                  <span className="font-semibold text-gray-900">{doctor.experience || 0} ans</span>
                </div>
                {doctor.rating > 0 && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Note</span>
                    <span className="font-semibold text-gray-900">{doctor.rating.toFixed(1)}/5</span>
                  </div>
                )}
              </div>

              {/* Type de consultation */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de consultation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAppointmentType('video')}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                      appointmentType === 'video'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <VideoCameraIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs">Vidéo</span>
                  </button>
                  <button
                    onClick={() => setAppointmentType('audio')}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                      appointmentType === 'audio'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <PhoneIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs">Audio</span>
                  </button>
                  <button
                    onClick={() => setAppointmentType('chat')}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                      appointmentType === 'chat'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <ChatBubbleLeftIcon className="w-6 h-6 mb-1" />
                    <span className="text-xs">Chat</span>
                  </button>
                </div>
              </div>

              {/* Symptômes */}
              <div className="mb-6">
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                  Symptômes (optionnel)
                </label>
                <textarea
                  id="symptoms"
                  rows={3}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Décrivez brièvement vos symptômes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Résumé et bouton de confirmation */}
              <div className="border-t pt-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">Récapitulatif</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-600">Médecin</span>
                      <span className="font-medium text-blue-900">{doctor.name}</span>
                    </div>
                    {selectedDate && (
                      <div className="flex justify-between">
                        <span className="text-blue-600">Date</span>
                        <span className="font-medium text-blue-900">
                          {selectedDate.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                    {selectedSlot && (
                      <div className="flex justify-between">
                        <span className="text-blue-600">Horaire</span>
                        <span className="font-medium text-blue-900">{selectedSlot.start}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="text-blue-600 font-medium">Total</span>
                      <span className="font-bold text-blue-900">{doctor.consultationFee} €</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!selectedDate || !selectedSlot || submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Confirmation...' : 'Confirmer le rendez-vous'}
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite - Calendrier */}
          <div className="lg:col-span-2">
            <AppointmentCalendar
              doctorId={doctorId!}
              onDateSelect={handleDateSelect}
              onSlotSelect={handleSlotSelect}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              availableSlots={availableSlots}
              loading={loadingSlots}
            />
          </div>
        </div>
      </div>
    </div>
  );
}