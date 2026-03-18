'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/hooks/useAuth';
import { reviewApi } from '@/app/lib/api/reviewApi';
import RatingStars from './RatingStars';
import { 
  CheckCircleIcon, 
  UserIcon, 
  LockClosedIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  appointmentId: number;
  doctorId: number;
  doctorName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TAGS = [
  'Ponctuel',
  'À l\'écoute',
  'Professionnel',
  'Rassurant',
  'Disponible',
  'Expert',
  'Pédagogue',
  'Empathique',
];

export default function ReviewForm({ 
  appointmentId, 
  doctorId, 
  doctorName,
  onSuccess,
  onCancel 
}: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Veuillez donner une note');
      return;
    }

    if (!comment.trim()) {
      toast.error('Veuillez écrire un commentaire');
      return;
    }

    setLoading(true);
    try {
      const result = await reviewApi.createReview({
        doctorId,
        appointmentId,
        rating,
        comment: comment.trim(),
        tags: selectedTags,
        isAnonymous
      });

      if (result.success) {
        toast.success('Votre avis a été publié !');
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Donner mon avis
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Note */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Votre note *
        </label>
        <div className="flex items-center gap-4">
          <RatingStars
            rating={rating}
            size="lg"
            interactive
            onRatingChange={setRating}
          />
          <span className="text-sm text-gray-500">
            {rating === 0 ? 'Cliquez pour noter' : `${rating}/5`}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Qualificatifs (optionnel)
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Commentaire */}
      <div className="mb-6">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Votre commentaire *
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Partagez votre expérience avec le Dr. {doctorName}..."
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-1">
          {comment.length}/500 caractères
        </p>
      </div>

      {/* Options */}
      <div className="mb-6 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            Publier anonymement
          </span>
        </label>

        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <LockClosedIcon className="w-4 h-4 text-green-600" />
          <span>Votre avis sera vérifié et publié après modération</span>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Envoi...' : 'Publier mon avis'}
        </button>
      </div>
    </form>
  );
}