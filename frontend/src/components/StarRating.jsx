import { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating, 
  onRatingChange, 
  readOnly = false, 
  size = 'md',
  showCount = false,
  count = 0,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  const handleMouseEnter = (starValue) => {
    if (!readOnly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const handleClick = (starValue) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${starSize} transition-colors ${
            readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(star)}
          disabled={readOnly}
        >
          <Star
            className={`${starSize} ${
              star <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-300'
            }`}
          />
        </button>
      ))}
      
      {showCount && (
        <span className="ml-2 text-sm text-gray-600">
          ({count} {count === 1 ? 'rating' : 'ratings'})
        </span>
      )}
      
      {rating > 0 && !showCount && (
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
