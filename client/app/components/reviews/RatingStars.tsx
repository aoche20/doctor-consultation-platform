'use client';

import { StarIcon } from '@heroicons/react/20/solid';

interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function RatingStars({ 
  rating, 
  size = 'md', 
  interactive = false,
  onRatingChange 
}: RatingStarsProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (selectedRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <StarIcon
            className={`${sizes[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}