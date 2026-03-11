'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { StarIcon } from '@heroicons/react/20/solid';
import { ClockIcon, CurrencyEuroIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { slugify } from '@/app/lib/utils/slugify';

interface DoctorCardProps {
  doctor: {
    _id: string;
    name: string;
    specialization: string;
    profilePicture?: string;
    rating?: number;
    totalReviews?: number;
    experience?: number;
    consultationFee?: number;
    isVerified?: boolean;
    nextAvailable?: string;
  };
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const router = useRouter();

  const handleClick = () => {
    const slug = slugify(doctor.name);
    router.push(`/doctors/${slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* Image section avec overlay au hover */}
      <div className="relative h-48 overflow-hidden">
        {doctor.profilePicture ? (
          <Image
            src={doctor.profilePicture}
            alt={doctor.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-white text-6xl font-light">
              {doctor.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Badge vérifié */}
        {doctor.isVerified && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-primary-600 flex items-center gap-1 shadow-lg">
            <CheckBadgeIcon className="w-4 h-4" />
            Vérifié
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {doctor.name}
          </h3>
          <p className="text-primary-600 font-medium">
            {doctor.specialization}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`w-4 h-4 ${
                  star <= (doctor.rating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {doctor.rating?.toFixed(1) || 'Nouveau'} ({doctor.totalReviews || 0} avis)
          </span>
        </div>

        {/* Infos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>Expérience</span>
            </div>
            <span className="font-medium text-gray-900">
              {doctor.experience || 0} ans
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <CurrencyEuroIcon className="w-4 h-4" />
              <span>Consultation</span>
            </div>
            <span className="font-medium text-gray-900">
              {doctor.consultationFee || 50} €
            </span>
          </div>

          {doctor.nextAvailable && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-green-600 font-medium">
                Prochain RDV: {doctor.nextAvailable}
              </p>
            </div>
          )}
        </div>

        {/* Bouton */}
        <button className="w-full mt-6 bg-primary-500 text-white py-3 rounded-button font-medium hover:bg-primary-600 transition-colors duration-200 transform group-hover:scale-[1.02]">
          Voir disponibilités
        </button>
      </div>
    </div>
  );
}