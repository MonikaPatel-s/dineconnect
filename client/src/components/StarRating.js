import React from 'react';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'medium' }) => {
  const stars = [1, 2, 3, 4, 5];
  
  const sizeClasses = {
    small: 'star-small',
    medium: 'star-medium',
    large: 'star-large'
  };

  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  return (
    <div className={`star-rating ${readonly ? 'readonly' : 'interactive'}`}>
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${sizeClasses[size]} ${star <= rating ? 'filled' : 'empty'}`}
          onClick={() => handleStarClick(star)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          ★
        </span>
      ))}
      {readonly && rating > 0 && (
        <span className="rating-text">({rating.toFixed(1)})</span>
      )}
    </div>
  );
};

export default StarRating;