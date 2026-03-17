'use client';

import { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { appointmentApi } from '@/app/lib/api/appointmentApi';
import toast from 'react-hot-toast';

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

interface PrescriptionFormProps {
  appointmentId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function PrescriptionForm({ appointmentId, onSuccess, onCancel }: PrescriptionFormProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '', duration: '', instructions: '' }
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
  };

  const removeMedicine = (index: number) => {
    if (medicines.length === 1) {
      toast.error('Au moins un médicament est requis');
      return;
    }
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validMedicines = medicines.filter(m => m.name.trim() && m.dosage.trim());
    if (validMedicines.length === 0) {
      toast.error('Ajoutez au moins un médicament');
      return;
    }

    setLoading(true);
    try {
      const result = await appointmentApi.addPrescription(appointmentId, {
        medicines: validMedicines,
        additionalNotes: additionalNotes.trim(),
        followUpDate: followUpDate || undefined
      });

      if (result.success) {
        toast.success('Prescription ajoutée avec succès');
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Médicaments prescrits</h2>
        
        {medicines.map((medicine, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg relative">
            <button
              type="button"
              onClick={() => removeMedicine(index)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du médicament *
                </label>
                <input
                  type="text"
                  value={medicine.name}
                  onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Doliprane"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={medicine.dosage}
                  onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 1000mg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée
                </label>
                <input
                  type="text"
                  value={medicine.duration}
                  onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 3 jours"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <input
                  type="text"
                  value={medicine.instructions}
                  onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 2 fois par jour"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addMedicine}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <PlusIcon className="w-5 h-5" />
          Ajouter un médicament
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes complémentaires</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions supplémentaires
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repos, alimentation, précautions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de suivi recommandée
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer la prescription'}
        </button>
      </div>
    </form>
  );
}