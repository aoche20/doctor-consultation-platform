'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { userApi } from '@/app/lib/api/userApi';
import ProfileImageUpload from '@/app/components/ProfileImageUpload';
import DoctorAvailability from '@/app/components/DoctorAvailability';
import { User, AvailableSlot } from '@/app/types';
import { PencilIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DoctorProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    consultationFee: 50,
    experience: 0,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'France'
    }
  });

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login');
    } else if (authUser) {
      loadProfile();
    }
  }, [authUser, authLoading]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phoneNumber: profile.phoneNumber || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        specialization: profile.specialization || '',
        consultationFee: profile.consultationFee || 50,
        experience: profile.experience || 0,
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zipCode: profile.address?.zipCode || '',
          country: profile.address?.country || 'France'
        }
      });
    }
  }, [profile]);

  const loadProfile = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const result = await userApi.getProfile(authUser.id);
      if (result.success && result.user) {
        setProfile(result.user);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await userApi.updateProfile(formData);
      if (result.success && result.user) {
        setProfile(result.user);
        setIsEditing(false);
        toast.success('Profil mis à jour avec succès');
      } else {
        toast.error(result.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (imageUrl: string) => {
    if (profile) {
      setProfile({ ...profile, profilePicture: imageUrl });
    }
  };

  const handleAvailabilitySave = async (slots: AvailableSlot[]) => {
    setLoading(true);
    try {
      const result = await userApi.updateAvailability(slots);
      if (result.success && result.availableSlots) {
        setProfile(prev => prev ? { ...prev, availableSlots: result.availableSlots } : null);
        toast.success('Disponibilités mises à jour');
      } else {
        toast.error(result.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* En-tête */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Mon Profil Médecin</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                <PencilIcon className="w-5 h-5" />
                Modifier
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Photo et infos de base */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center">
                <ProfileImageUpload
                  currentImage={profile?.profilePicture}
                  userName={profile?.name || ''}
                  onUploadSuccess={handlePhotoUpload}
                />
                
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-bold">{profile?.name}</h2>
                  <p className="text-blue-600 font-medium">{profile?.specialization}</p>
                  
                  {profile?.isVerified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                      ✓ Médecin vérifié
                    </span>
                  )}
                </div>

                <div className="w-full mt-6 pt-6 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Note</span>
                    <span className="font-medium">{profile?.rating?.toFixed(1) || 'Nouveau'}/5</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Avis</span>
                    <span className="font-medium">{profile?.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Prix consultation</span>
                    <span className="font-medium">{profile?.consultationFee || 50} €</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Expérience</span>
                    <span className="font-medium">{profile?.experience || 0} ans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Formulaire et disponibilités */}
          <div className="lg:col-span-2 space-y-6">
            {/* Formulaire d'édition */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de naissance
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Genre
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner</option>
                        <option value="male">Homme</option>
                        <option value="female">Femme</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spécialisation *
                      </label>
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner</option>
                        <option value="Cardiologue">Cardiologue</option>
                        <option value="Dentiste">Dentiste</option>
                        <option value="Dermatologue">Dermatologue</option>
                        <option value="Généraliste">Médecin généraliste</option>
                        <option value="Gynécologue">Gynécologue</option>
                        <option value="Pédiatre">Pédiatre</option>
                        <option value="Psychiatre">Psychiatre</option>
                        <option value="Radiologue">Radiologue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prix consultation (€)
                      </label>
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Années d'expérience
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Adresse du cabinet</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rue
                        </label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ville
                        </label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Code postal
                        </label>
                        <input
                          type="text"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nom complet</p>
                      <p className="font-medium">{profile?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{profile?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium">{profile?.phoneNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Spécialisation</p>
                      <p className="font-medium">{profile?.specialization}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gestion des disponibilités */}
            <DoctorAvailability
              slots={profile?.availableSlots || []}
              onSave={handleAvailabilitySave}
            />

            {/* Qualifications */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <AcademicCapIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Qualifications</h3>
              </div>

              {profile?.qualifications && profile.qualifications.length > 0 ? (
                <div className="space-y-3">
                  {profile.qualifications.map((qual, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                      <p className="font-medium">{qual.degree}</p>
                      <p className="text-sm text-gray-600">{qual.institution} • {qual.year}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Aucune qualification renseignée
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}