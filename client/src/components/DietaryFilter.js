import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const DietaryFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const { t } = useLanguage();

  const dietaryOptions = [
    { key: 'isVegetarian', label: 'Vegetarian', icon: '🥬', color: '#4CAF50' },
    { key: 'isVegan', label: 'Vegan', icon: '🌱', color: '#8BC34A' },
    { key: 'isGlutenFree', label: 'Gluten Free', icon: '🌾', color: '#FF9800' },
    { key: 'isJain', label: 'Jain', icon: '🙏', color: '#9C27B0' }
  ];

  const spiceLevels = [
    { value: 'mild', label: 'Mild', icon: '🌶️' },
    { value: 'medium', label: 'Medium', icon: '🌶️🌶️' },
    { value: 'hot', label: 'Hot', icon: '🌶️🌶️🌶️' },
    { value: 'extra-hot', label: 'Extra Hot', icon: '🌶️🌶️🌶️🌶️' }
  ];

  const handleDietaryChange = (key) => {
    onFilterChange({
      ...filters,
      [key]: !filters[key]
    });
  };

  const handleSpiceChange = (spiceLevel) => {
    const currentSpices = filters.spiceLevels || [];
    const newSpices = currentSpices.includes(spiceLevel)
      ? currentSpices.filter(level => level !== spiceLevel)
      : [...currentSpices, spiceLevel];
    
    onFilterChange({
      ...filters,
      spiceLevels: newSpices
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + 
    (filters.spiceLevels?.length || 0);

  return (
    <div className="dietary-filter">
      <div className="filter-header">
        <h3>Dietary Preferences</h3>
        {activeFiltersCount > 0 && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="filter-section">
        <h4>Diet Type</h4>
        <div className="filter-options">
          {dietaryOptions.map(option => (
            <button
              key={option.key}
              className={`filter-btn ${filters[option.key] ? 'active' : ''}`}
              onClick={() => handleDietaryChange(option.key)}
              style={{ 
                borderColor: filters[option.key] ? option.color : '#ddd',
                backgroundColor: filters[option.key] ? `${option.color}20` : 'white'
              }}
            >
              <span className="filter-icon">{option.icon}</span>
              <span className="filter-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Spice Level</h4>
        <div className="filter-options">
          {spiceLevels.map(level => (
            <button
              key={level.value}
              className={`filter-btn spice-btn ${
                filters.spiceLevels?.includes(level.value) ? 'active' : ''
              }`}
              onClick={() => handleSpiceChange(level.value)}
            >
              <span className="filter-icon">{level.icon}</span>
              <span className="filter-label">{level.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-range">
          <input
            type="range"
            min="0"
            max="1000"
            value={filters.maxPrice || 1000}
            onChange={(e) => onFilterChange({
              ...filters,
              maxPrice: parseInt(e.target.value)
            })}
            className="price-slider"
          />
          <div className="price-labels">
            <span>₹0</span>
            <span>₹{filters.maxPrice || 1000}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietaryFilter;