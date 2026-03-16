'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { userApi } from '@/app/lib/api/userApi';
import { doctorApi } from '@/app/lib/api/doctorApi';
import { AvailableSlot, User } from '@/app/types';
import { PlusIcon, XMarkIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DAYS = [
  { value: 'Monday', label: 'Lundi' },
  { value: 'Tuesday', label: 'Mardi' },
  { value: 'Wednesday', label: 'Mercredi' },
  { value: 'Thursday', label: 'Jeudi' },
  { value: 'Friday', label: 'Vendredi' },
  { value: 'Saturday', label: 'Samedi' },
  { value: 'Sunday', label: 'Dimanche' }
];

// Générer les heures de 00:00 à 23:30 par pas de 30 minutes
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

export default function DoctorAvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const doctorId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState<User | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // État pour le nouveau créneau
  const [newSlot, setNewSlot] = useState<Partial<AvailableSlot>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && doctorId) {
      loadDoctorAvailability();
      // Vérifier si c'est le profil du médecin connecté
      setIsOwnProfile(user.id.toString() === doctorId || user._id?.toString() === doctorId);
    }
  }, [user, authLoading, doctorId, router]);

  const loadDoctorAvailability = async () => {
    setLoading(true);
    try {
      // Récupérer les informations du médecin
      const result = await doctorApi.getDoctorDetails(doctorId);
      
      if (result.success && result.doctor) {
        setDoctor(result.doctor);
        setAvailableSlots(result.doctor.availableSlots || []);
      } else {
        toast.error('Médecin non trouvé');
        router.push('/doctors');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = () => {
    // Validation
    if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    // Vérifier que l'heure de fin est après l'heure de début
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    // Vérifier les chevauchements
    const hasOverlap = availableSlots.some(slot => 
      slot.day === newSlot.day &&
      ((slot.startTime <= newSlot.startTime! && slot.endTime > newSlot.startTime!) ||
       (slot.startTime < newSlot.endTime! && slot.endTime >= newSlot.endTime!))
    );

    if (hasOverlap) {
      toast.error('Ce créneau chevauche un créneau existant');
      return;
    }

    setAvailableSlots([...availableSlots, newSlot as AvailableSlot]);
    toast.success('Créneau ajouté');
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = availableSlots.filter((_, i) => i !== index);
    setAvailableSlots(newSlots);
    toast.success('Créneau supprimé');
  };

  const handleToggleAvailability = (index: number) => {
    const newSlots = [...availableSlots];
    newSlots[index] = {
      ...newSlots[index],
      isAvailable: !newSlots[index].isAvailable
    };
    setAvailableSlots(newSlots);
  };

  const handleSave = async () => {
    if (!isOwnProfile) {
      toast.error('Vous ne pouvez pas modifier les disponibilités d\'un autre médecin');
      return;
    }

    setSaving(true);
    try {
      const result = await userApi.updateAvailability(availableSlots);
      
      if (result.success) {
        toast.success('Disponibilités enregistrées avec succès');
      } else {
        toast.error(result.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">
            Disponibilités de {doctor.name}
          </h1>
          <p className="text-gray-600 mt-2">
            {doctor.specialization}
          </p>
          {!isOwnProfile && (
            <p className="text-sm text-yellow-600 mt-2 bg-yellow-50 p-2 rounded">
              ⚠️ Vous consultez les disponibilités d'un autre médecin. Vous ne pouvez pas les modifier.
            </p>
          )}
        </div>

        {/* Formulaire d'ajout (uniquement pour le médecin concerné) */}
        {isOwnProfile && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ajouter un créneau
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jour
                </label>
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Début
                </label>
                <select
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fin
                </label>
                <select
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddSlot}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Ajouter
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                checked={newSlot.isAvailable}
                onChange={(e) => setNewSlot({ ...newSlot, isAvailable: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
                Disponible (décocher pour marquer comme indisponible)
              </label>
            </div>
          </div>
        )}

        {/* Liste des créneaux existants */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Créneaux de consultation
          </h2>

          {availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Aucun créneau défini pour ce médecin.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableSlots.map((slot, index) => {
                const dayLabel = DAYS.find(d => d.value === slot.day)?.label || slot.day;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      slot.isAvailable ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-900 w-24">{dayLabel}</span>
                      <span className="text-gray-700">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        slot.isAvailable 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {slot.isAvailable ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>
                    
                    {/* Actions (uniquement pour le médecin concerné) */}
                    {isOwnProfile && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAvailability(index)}
                          className={`p-2 rounded-lg transition ${
                            slot.isAvailable 
                              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          title={slot.isAvailable ? 'Marquer comme indisponible' : 'Marquer comme disponible'}
                        >
                          {slot.isAvailable ? '🔴' : '🟢'}
                        </button>
                        <button
                          onClick={() => handleRemoveSlot(index)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          title="Supprimer"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bouton de sauvegarde (uniquement pour le médecin concerné) */}
        {isOwnProfile && availableSlots.length > 0 && (
          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les disponibilités'}
            </button>
          </div>
        )}

        {/* Légende */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Comment ça fonctionne ?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Les créneaux définis ici seront visibles par les patients lors de la prise de rendez-vous</li>
            <li>• Un patient ne pourra pas prendre rendez-vous en dehors de ces créneaux</li>
            {isOwnProfile && (
              <li>• Vous pouvez marquer un créneau comme indisponible temporairement sans le supprimer</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}