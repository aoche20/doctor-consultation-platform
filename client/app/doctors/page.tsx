'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import { doctorApi } from '@/app/lib/api/doctorApi';
import { User, DoctorFilters } from '@/app/types';
 
import toast from 'react-hot-toast';
import { slugify } from '@/app/lib/utils/slugify';

const SPECIALIZATIONS = [
  'Cardiologue',
  'Dentiste',
  'Dermatologue',
  'Généraliste',
  'Gynécologue',
  'Pédiatre',
  'Psychiatre',
  'Radiologue',
  'Ophtalmologue',
  'ORL',
  'Neurologue',
  'Orthopédiste'
];

const LANGUAGES = ['Français', 'English', 'Arabic', 'Spanish', 'German', 'Italian'];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0
  });
  
  const [filters, setFilters] = useState<DoctorFilters>({
    specialization: '',
    minRating: 0,
    minFee: 0,
    maxFee: 200,
    searchTerm: '',
    sortBy: 'rating'
  });

  useEffect(() => {
    loadDoctors();
  }, [filters, pagination.page]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const result = await doctorApi.searchDoctors(filters, pagination.page);
      if (result.success) {
        setDoctors(result.doctors);
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
          pages: result.pagination.pages
        }));
      } else {
        toast.error('Erreur lors du chargement des médecins');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof DoctorFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset à la première page
  };

  const clearFilters = () => {
    setFilters({
      specialization: '',
      minRating: 0,
      minFee: 0,
      maxFee: 200,
      searchTerm: '',
      sortBy: 'rating'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDoctors();
  };

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          ({doctors.find(d => d.rating === rating)?.totalReviews || 0})
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Trouvez un médecin
          </h1>
          <p className="text-gray-600 mt-2">
            Consultez les profils et prenez rendez-vous avec nos spécialistes
          </p>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, spécialité, symptôme..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <FunnelIcon className="h-5 w-5" />
              Filtres
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Rechercher
            </button>
          </div>
        </form>

        {/* Panneau de filtres */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filtres avancés</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Spécialisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spécialisation
                </label>
                <select
                  value={filters.specialization}
                  onChange={(e) => handleFilterChange('specialization', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les spécialités</option>
                  {SPECIALIZATIONS.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Note minimale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note minimale
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Toutes les notes</option>
                  <option value="4">4 étoiles et plus</option>
                  <option value="3">3 étoiles et plus</option>
                  <option value="2">2 étoiles et plus</option>
                </select>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix max (€)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={filters.maxFee}
                  onChange={(e) => handleFilterChange('maxFee', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-1">
                  Jusqu'à {filters.maxFee} €
                </div>
              </div>

              {/* Langue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Langue
                </label>
                <select
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les langues</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Disponibilité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponible le
                </label>
                <select
                  value={filters.availableDay}
                  onChange={(e) => handleFilterChange('availableDay', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les jours</option>
                  <option value="Monday">Lundi</option>
                  <option value="Tuesday">Mardi</option>
                  <option value="Wednesday">Mercredi</option>
                  <option value="Thursday">Jeudi</option>
                  <option value="Friday">Vendredi</option>
                  <option value="Saturday">Samedi</option>
                  <option value="Sunday">Dimanche</option>
                </select>
              </div>

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trier par
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">Meilleure note</option>
                  <option value="fee_asc">Prix croissant</option>
                  <option value="fee_desc">Prix décroissant</option>
                  <option value="experience">Expérience</option>
                  <option value="reviews">Nombre d'avis</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Effacer les filtres
              </button>
            </div>
          </div>
        )}

        {/* Résultats */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">Aucun médecin trouvé</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <Link href={`/doctors/${slugify(doctor.name)}`} key={doctor._id} prefetch={false}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                          {doctor.profilePicture ? (
                            <Image
                              src={doctor.profilePicture}
                              alt={doctor.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">
                              {doctor.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-lg">{doctor.name}</h3>
                          <p className="text-blue-600">{doctor.specialization}</p>
                        </div>
                      </div>

                      <RatingStars rating={doctor.rating || 0} />

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Expérience</span>
                          <span className="font-medium">{doctor.experience || 0} ans</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Prix consultation</span>
                          <span className="font-medium">{doctor.consultationFee} €</span>
                        </div>
                      </div>

                      {doctor.isVerified && (
                        <div className="mt-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Médecin vérifié
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="px-4 py-2">
                  Page {pagination.page} sur {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}