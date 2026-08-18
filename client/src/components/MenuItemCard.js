import { useState, useEffect } from "react";
import { favoriteAPI } from '../services/api';
import StarRating from './StarRating';
import "../App.css";

export default function MenuItemCard({ item, onAddToCart, cartItem, user, onReviewClick }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await favoriteAPI.checkIsFavorite(item._id);
        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    if (user && item._id) {
      checkFavoriteStatus();
    }
  }, [user, item._id]);



  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    if (!user) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoriteAPI.removeFromFavorites(item._id);
        setIsFavorite(false);
      } else {
        await favoriteAPI.addToFavorites(item._id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const fallbackImage = "https://via.placeholder.com/300x200/ff6b35/ffffff?text=" + encodeURIComponent(item.name);
  const imageUrl = item.imageUrl || item.img || fallbackImage;
  const categoryName = item.categoryId?.name || item.category || "Food";

  return (
    <div className="menu-card">
      <div className="menu-card-image">
        {imageLoading && (
          <div className="image-loading">
            <div className="loading-spinner-small"></div>
          </div>
        )}
        <img 
          src={imageError ? fallbackImage : imageUrl} 
          alt={item.name}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: imageLoading ? 'none' : 'block' }}
        />
        <div className="category-badge">{categoryName}</div>
        {user && (
          <button 
            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {favoriteLoading ? '⏳' : (isFavorite ? '❤️' : '🤍')}
          </button>
        )}
        {!item.availability && (
          <div className="unavailable-overlay">
            <span>Not Available</span>
          </div>
        )}
      </div>
      
      <div className="menu-card-content">
        <h3 className="menu-card-title">{item.name}</h3>
        <p className="menu-card-description">{item.description}</p>
        
        {item.averageRating > 0 && (
          <div className="rating-section">
            <StarRating rating={item.averageRating} readonly size="small" />
            <span className="review-count">({item.totalReviews} reviews)</span>
          </div>
        )}
        
        <div className="menu-card-footer">
          <div className="price">₹{item.price}</div>
          <div className="card-actions">
            {user && onReviewClick && (
              <button 
                className="review-btn"
                onClick={() => onReviewClick(item)}
                title="View Reviews"
              >
                💬
              </button>
            )}
            <div className="add-to-cart">
              {cartItem ? (
                <div className="quantity-badge">
                  In Cart: {cartItem.qty}
                </div>
              ) : null}
              <button 
                className="add-btn"
                onClick={() => onAddToCart(item)}
                disabled={!item.availability}
              >
                {!item.availability ? "Not Available" : cartItem ? "Add More" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
