'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/20/solid';
import { CalendarIcon, CurrencyEuroIcon, AcademicCapIcon, LanguageIcon, ClockIcon } from '@heroicons/react/24/outline';
import { doctorApi } from '@/app/lib/api/doctorApi';
import { reviewApi } from '@/app/lib/api/reviewApi';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { User, Review } from '@/app/types';
import {slugify, deslugify } from '@/app/lib/utils/slugify';
import toast from 'react-hot-toast';

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  // Récupérer le slug de l'URL (ex: "dr-sophie-martin")
  const slug = params?.slug as string;
  
  const [doctor, setDoctor] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // ✅ CORRECTION : Utiliser slug au lieu de doctorId
  useEffect(() => {
    if (slug && slug !== 'undefined') {
      loadDoctorBySlug();
    } else {
      console.error('Slug du médecin non fourni');
      toast.error('Médecin non spécifié');
      router.push('/doctors');
    }
  }, [slug, router]);

  // ✅ CORRECTION : Nouvelle fonction pour charger par slug
  const loadDoctorBySlug = async () => {
    setLoading(true);
    try {
      console.log('Chargement du médecin avec slug:', slug);
      
      // Transformer le slug en nom (ex: "dr-sophie-martin" -> "Dr Sophie Martin")
      const doctorName = deslugify(slug);
      console.log('Nom recherché:', doctorName);
      
      // Utiliser la nouvelle méthode getDoctorByName
      const result = await doctorApi.getDoctorByName(doctorName);
      console.log('Résultat API:', result);
      
      if (result.success && result.doctor) {
        setDoctor(result.doctor);
        setReviews(result.reviews || []);
        setRatingStats(result.ratingStats || []);
        
        // Charger les disponibilités avec l'ID du docteur
        const availability = await doctorApi.getDoctorAvailability(result.doctor._id || result.doctor.id);
        if (availability.success) {
          setAvailableSlots(availability.availableSlots || []);
        }
      } else {
        toast.error('Médecin non trouvé');
        router.push('/doctors');
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour prendre rendez-vous');
      router.push('/login');
      return;
    }

    if (user.role !== 'patient') {
      toast.error('Seuls les patients peuvent prendre rendez-vous');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      toast.error('Veuillez sélectionner un créneau');
      return;
    }

    if (!doctor) {
      toast.error('Informations du médecin non disponibles');
      return;
    }

    // ✅ CORRECTION : Utiliser l'ID du docteur (avec fallback)
    const doctorId = doctor._id || doctor.id;
    router.push(`/appointments/book?doctorId=${doctorId}&date=${selectedDate}&slot=${selectedSlot}`);
  };

  const RatingDistribution = () => {
    const total = ratingStats.reduce((acc, stat) => acc + stat.count, 0);
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const stat = ratingStats.find((s) => s._id === rating);
          const count = stat?.count || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm w-12">{rating} étoiles</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Médecin non trouvé</p>
        <button
          onClick={() => router.push('/doctors')}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retour à la recherche
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Bouton retour */}
        <button
          onClick={() => router.push('/doctors')}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Retour à la recherche
        </button>

        {/* En-tête du profil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="md:w-48">
              <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-200 mx-auto">
                {doctor.profilePicture ? (
                  <Image
                    src={doctor.profilePicture}
                    alt={doctor.name}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-6xl font-bold">
                    {doctor.name?.charAt(0) || 'D'}
                  </div>
                )}
              </div>
            </div>

            {/* Infos */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
                  <p className="text-xl text-blue-600 mt-1">{doctor.specialization}</p>
                  
                  <div className="flex items-center mt-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-5 w-5 ${
                            star <= (doctor.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600">
                      {doctor.rating?.toFixed(1)} ({doctor.totalReviews || 0} avis)
                    </span>
                  </div>
                </div>

                {doctor.isVerified && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Médecin vérifié
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <CurrencyEuroIcon className="h-6 w-6 mx-auto text-gray-600" />
                  <p className="text-sm text-gray-600 mt-1">Prix</p>
                  <p className="font-semibold">{doctor.consultationFee} €</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <ClockIcon className="h-6 w-6 mx-auto text-gray-600" />
                  <p className="text-sm text-gray-600 mt-1">Expérience</p>
                  <p className="font-semibold">{doctor.experience || 0} ans</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <AcademicCapIcon className="h-6 w-6 mx-auto text-gray-600" />
                  <p className="text-sm text-gray-600 mt-1">Patients</p>
                  <p className="font-semibold">{doctor.totalPatients || 0}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <LanguageIcon className="h-6 w-6 mx-auto text-gray-600" />
                  <p className="text-sm text-gray-600 mt-1">Langues</p>
                  <p className="font-semibold">{doctor.languages?.length || 1}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Informations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">À propos</h2>
              <p className="text-gray-700">
                {doctor.bio || "Aucune biographie renseignée"}
              </p>
            </div>

            {/* Formation */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Formation</h2>
              {doctor.education && doctor.education.length > 0 ? (
                <div className="space-y-4">
                  {doctor.education.map((edu: any, index: number) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-4">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-gray-600">{edu.institution} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune formation renseignée</p>
              )}
            </div>

            {/* Avis */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Avis patients</h2>
              
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucun avis pour le moment
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {review.isAnonymous ? (
                              <span className="text-gray-500">A</span>
                            ) : (
                              <span className="text-blue-600 font-bold">
                                {review.patient?.name?.charAt(0) || 'P'}
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">
                              {review.isAnonymous ? 'Patient anonyme' : review.patient?.name || 'Patient'}
                            </p>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700">{review.comment}</p>
                      {review.tags && review.tags.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {review.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Disponibilités et prise de RDV */}
          <div className="space-y-6">
            {/* Disponibilités */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Disponibilités</h2>
              
              {availableSlots.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucune disponibilité pour le moment
                </p>
              ) : (
                <div className="space-y-4">
                  {availableSlots.map((slot, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <p className="font-medium">{slot.day}</p>
                      <p className="text-sm text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prise de rendez-vous */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Prendre rendez-vous</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sélectionnez une date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sélectionnez un créneau
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choisir un horaire</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={handleBookAppointment}
                  disabled={!selectedDate || !selectedSlot}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prendre rendez-vous ({doctor.consultationFee} €)
                </button>

                {!user && (
                  <p className="text-sm text-center text-gray-500">
                    <button
                      onClick={() => router.push('/login')}
                      className="text-blue-600 hover:underline"
                    >
                      Connectez-vous
                    </button>{' '}
                    pour prendre rendez-vous
                  </p>
                )}
              </div>
            </div>

            {/* Distribution des notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Distribution des notes</h2>
              <RatingDistribution />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}