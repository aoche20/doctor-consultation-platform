'use client';

import { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AvailableSlot } from '@/app/types';
import toast from 'react-hot-toast';

interface DoctorAvailabilityProps {
  slots: AvailableSlot[];
  onSave: (slots: AvailableSlot[]) => void;
}

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const HOURS = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);

export default function DoctorAvailability({ slots, onSave }: DoctorAvailabilityProps) {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>(slots || []);
  const [newSlot, setNewSlot] = useState<Partial<AvailableSlot>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true
  });

  const addSlot = () => {
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

  const removeSlot = (index: number) => {
    const newSlots = availableSlots.filter((_, i) => i !== index);
    setAvailableSlots(newSlots);
    toast.success('Créneau supprimé');
  };

  const saveSlots = () => {
    onSave(availableSlots);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Gérer mes disponibilités</h3>
      
      {/* Liste des créneaux existants */}
      <div className="space-y-2 mb-6">
        {availableSlots.map((slot, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
            <div>
              <span className="font-medium">{slot.day}</span>
              <span className="mx-2 text-gray-500">•</span>
              <span>{slot.startTime} - {slot.endTime}</span>
              {!slot.isAvailable && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  Indisponible
                </span>
              )}
            </div>
            <button
              onClick={() => removeSlot(index)}
              className="text-red-600 hover:text-red-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        
        {availableSlots.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            Aucun créneau de disponibilité défini
          </p>
        )}
      </div>

      {/* Ajouter un nouveau créneau */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Ajouter un créneau</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={newSlot.day}
            onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DAYS.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>

          <select
            value={newSlot.startTime}
            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {HOURS.map(hour => (
              <option key={hour} value={hour}>{hour}</option>
            ))}
          </select>

          <select
            value={newSlot.endTime}
            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {HOURS.map(hour => (
              <option key={hour} value={hour}>{hour}</option>
            ))}
          </select>

          <button
            onClick={addSlot}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Ajouter
          </button>
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

      {/* Bouton de sauvegarde */}
      <div className="mt-6">
        <button
          onClick={saveSlots}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          Enregistrer les disponibilités
        </button>
      </div>
    </div>
  );
}