import React, { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';
// import { useLanguage } from '../contexts/LanguageContext';
import StarRating from './StarRating';

const ReviewSection = ({ menuItemId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  // const { t } = useLanguage(); // For future translations

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewAPI.getReviews(menuItemId);
        setReviews(response.data);
        
        // Find user's review if exists
        if (user) {
          const userReviewFound = response.data.find(review => 
            review.user._id === user.id
          );
          setUserReview(userReviewFound);
          if (userReviewFound) {
            setNewRating(userReviewFound.rating);
            setNewComment(userReviewFound.comment || '');
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, [menuItemId, user]);

  const refreshReviews = async () => {
    try {
      const response = await reviewAPI.getReviews(menuItemId);
      setReviews(response.data);
      
      // Find user's review if exists
      if (user) {
        const userReviewFound = response.data.find(review => 
          review.user._id === user.userId
        );
        setUserReview(userReviewFound);
        if (userReviewFound) {
          setNewRating(userReviewFound.rating);
          setNewComment(userReviewFound.comment || '');
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating === 0) return;

    setLoading(true);
    try {
      await reviewAPI.addReview({
        menuItemId,
        rating: newRating,
        comment: newComment
      });
      
      setShowReviewForm(false);
      setNewComment('');
      refreshReviews(); // Refresh reviews
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await reviewAPI.deleteReview(userReview._id);
        setUserReview(null);
        setNewRating(0);
        setNewComment('');
        refreshReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
      }
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="review-section">
      <div className="review-header">
        <h3>Reviews ({reviews.length})</h3>
        {reviews.length > 0 && (
          <div className="average-rating">
            <StarRating rating={averageRating} readonly size="small" />
          </div>
        )}
      </div>

      {user && (
        <div className="user-review-section">
          {!userReview ? (
            !showReviewForm ? (
              <button 
                className="btn-primary"
                onClick={() => setShowReviewForm(true)}
              >
                Write a Review
              </button>
            ) : (
              <form onSubmit={handleSubmitReview} className="review-form">
                <div className="rating-input">
                  <label>Your Rating:</label>
                  <StarRating 
                    rating={newRating} 
                    onRatingChange={setNewRating}
                    size="large"
                  />
                </div>
                <div className="comment-input">
                  <label>Comment (optional):</label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience..."
                    maxLength={500}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading || newRating === 0}
                  >
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setShowReviewForm(false);
                      setNewRating(0);
                      setNewComment('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="user-existing-review">
              <h4>Your Review:</h4>
              <div className="review-item user-review">
                <StarRating rating={userReview.rating} readonly size="small" />
                {userReview.comment && <p>{userReview.comment}</p>}
                <div className="review-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setShowReviewForm(true);
                      setNewRating(userReview.rating);
                      setNewComment(userReview.comment || '');
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={handleDeleteReview}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="reviews-list">
        {reviews.filter(review => !user || review.user._id !== user.id).map((review) => (
          <div key={review._id} className="review-item">
            <div className="review-header">
              <span className="reviewer-name">{review.user.name}</span>
              <StarRating rating={review.rating} readonly size="small" />
              <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            {review.comment && (
              <p className="review-comment">{review.comment}</p>
            )}
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <p className="no-reviews">No reviews yet. Be the first to review!</p>
      )}
    </div>
  );
};

export default ReviewSection;