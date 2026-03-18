'use client';

import { useState } from 'react';
import Image from 'next/image';
import RatingStars from './RatingStars';
import { 
  HandThumbUpIcon, 
  ChatBubbleLeftIcon,
  FlagIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/20/solid';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  patient: {
    id: number;
    name: string;
    profilePicture?: string;
  };
  rating: number;
  comment: string;
  tags: string[];
  isAnonymous: boolean;
  isVerified: boolean;
  likes: number[];
  replies: Array<{
    doctor: number;
    message: string;
    date: string;
  }>;
  createdAt: string;
}

interface ReviewListProps {
  reviews: Review[];
  doctorId: number;
  currentUserId?: number;
  onLike?: (reviewId: number) => void;
  onReply?: (reviewId: number, message: string) => void;
  onReport?: (reviewId: number) => void;
}

export default function ReviewList({ 
  reviews, 
  doctorId,
  currentUserId,
  onLike,
  onReply,
  onReport 
}: ReviewListProps) {
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const toggleReplies = (reviewId: number) => {
    setExpandedReplies(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleLike = (reviewId: number) => {
    if (onLike) onLike(reviewId);
  };

  const handleReply = (reviewId: number) => {
    if (replyText[reviewId]?.trim() && onReply) {
      onReply(reviewId, replyText[reviewId]);
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      setReplyingTo(null);
    }
  };

  const handleReport = (reviewId: number) => {
    if (onReport) onReport(reviewId);
    toast.success('Avis signalé à la modération');
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <div className="text-5xl mb-4">📝</div>
        <p className="text-gray-600">Aucun avis pour le moment</p>
        <p className="text-sm text-gray-400 mt-2">
          Soyez le premier à donner votre avis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-500">Note moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{reviews.length}</div>
            <div className="text-sm text-gray-500">Avis</div>
          </div>
          <div className="flex-1">
            <RatingStars rating={4} size="md" />
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      {reviews.map((review) => {
        const patientName = review.isAnonymous 
          ? 'Patient anonyme' 
          : review.patient.name;
        const patientInitial = review.isAnonymous ? 'A' : patientName.charAt(0);
        const hasLiked = review.likes?.includes(currentUserId!);
        const isDoctor = currentUserId === doctorId;

        return (
          <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
            {/* En-tête de l'avis */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                  {review.patient.profilePicture && !review.isAnonymous ? (
                    <Image
                      src={review.patient.profilePicture}
                      alt={patientName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-blue-600 font-bold text-lg">
                      {patientInitial}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{patientName}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <RatingStars rating={review.rating} size="sm" />
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(review.createdAt), { 
                        addSuffix: true,
                        locale: fr 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {review.isVerified && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  ✓ Avis vérifié
                </span>
              )}
            </div>

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {review.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Commentaire */}
            <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleLike(review.id)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                {hasLiked ? (
                  <HandThumbUpSolid className="w-5 h-5 text-blue-600" />
                ) : (
                  <HandThumbUpIcon className="w-5 h-5" />
                )}
                <span>{review.likes?.length || 0}</span>
              </button>

              {isDoctor && (
                <button
                  onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span>Répondre</span>
                </button>
              )}

              {!isDoctor && (
                <button
                  onClick={() => handleReport(review.id)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors ml-auto"
                >
                  <FlagIcon className="w-4 h-4" />
                  <span>Signaler</span>
                </button>
              )}
            </div>

            {/* Formulaire de réponse */}
            {replyingTo === review.id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <textarea
                  value={replyText[review.id] || ''}
                  onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                  placeholder="Écrivez votre réponse..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleReply(review.id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    Répondre
                  </button>
                </div>
              </div>
            )}

            {/* Réponses du médecin */}
            {review.replies && review.replies.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => toggleReplies(review.id)}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {expandedReplies.includes(review.id) ? (
                    <>
                      <ChevronUpIcon className="w-4 h-4" />
                      Masquer la réponse
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="w-4 h-4" />
                      Voir la réponse du médecin
                    </>
                  )}
                </button>

                {expandedReplies.includes(review.id) && (
                  <div className="mt-4 pl-4 border-l-2 border-blue-200">
                    {review.replies.map((reply, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-medium text-blue-900 mb-2">
                          Réponse du Dr.
                        </p>
                        <p className="text-gray-700 mb-2">{reply.message}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(reply.date), { 
                            addSuffix: true,
                            locale: fr 
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}