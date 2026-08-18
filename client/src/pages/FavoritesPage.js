import React, { useState, useEffect } from 'react';
import { favoriteAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import MenuItemCard from '../components/MenuItemCard';
import ThemeToggle from '../components/ThemeToggle';

const FavoritesPage = ({ user, onAddToCart, cart }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getFavorites();
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = () => {
    // Refresh favorites after removal
    fetchFavorites();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <header className="page-header">
        <div className="header-content">
          <h1>{t('favorites')} ❤️</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="favorites-content">
        {favorites.length === 0 ? (
          <div className="empty-favorites">
            <div className="empty-state">
              <h2>{t('noFavorites')}</h2>
              <p>{t('startAddingFavorites')}</p>
            </div>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((favorite) => {
              const cartItem = cart.find(item => item._id === favorite.menuItem._id);
              return (
                <MenuItemCard
                  key={favorite._id}
                  item={favorite.menuItem}
                  onAddToCart={onAddToCart}
                  cartItem={cartItem}
                  user={user}
                  onFavoriteChange={handleRemoveFromFavorites}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;