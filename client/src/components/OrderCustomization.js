import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const OrderCustomization = ({ item, onAddToCart, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState(item.dietaryInfo?.spiceLevel || 'medium');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { t } = useLanguage();

  const spiceLevels = [
    { value: 'mild', label: 'Mild 🌶️', emoji: '🌶️' },
    { value: 'medium', label: 'Medium 🌶️🌶️', emoji: '🌶️🌶️' },
    { value: 'hot', label: 'Hot 🌶️🌶️🌶️', emoji: '🌶️🌶️🌶️' },
    { value: 'extra-hot', label: 'Extra Hot 🌶️🌶️🌶️🌶️', emoji: '🌶️🌶️🌶️🌶️' }
  ];

  const addOns = item.customizations?.addOns || [
    { name: 'Extra Cheese', price: 30 },
    { name: 'Extra Sauce', price: 15 },
    { name: 'Extra Vegetables', price: 25 },
    { name: 'Extra Spicy', price: 10 }
  ];

  const handleAddOnToggle = (addOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(item => item.name === addOn.name);
      if (exists) {
        return prev.filter(item => item.name !== addOn.name);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const calculateTotal = () => {
    const basePrice = item.price * quantity;
    const addOnPrice = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0) * quantity;
    return basePrice + addOnPrice;
  };

  const handleAddToCart = () => {
    const customizedItem = {
      ...item,
      quantity,
      customizations: {
        spiceLevel,
        addOns: selectedAddOns,
        specialInstructions
      },
      totalPrice: calculateTotal()
    };
    onAddToCart(customizedItem);
    onClose();
  };

  return (
    <div className="customization-modal">
      <div className="customization-content">
        <div className="customization-header">
          <h2>Customize Your Order</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="item-info">
          <img src={item.imageUrl || item.img} alt={item.name} />
          <div>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <span className="base-price">₹{item.price}</span>
          </div>
        </div>

        <div className="customization-options">
          {/* Quantity */}
          <div className="option-group">
            <label>Quantity:</label>
            <div className="quantity-controls">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Spice Level */}
          <div className="option-group">
            <label>Spice Level:</label>
            <div className="spice-options">
              {spiceLevels.map(level => (
                <button
                  key={level.value}
                  className={`spice-btn ${spiceLevel === level.value ? 'selected' : ''}`}
                  onClick={() => setSpiceLevel(level.value)}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="option-group">
            <label>Add-ons:</label>
            <div className="addon-options">
              {addOns.map(addOn => (
                <label key={addOn.name} className="addon-item">
                  <input
                    type="checkbox"
                    checked={selectedAddOns.some(item => item.name === addOn.name)}
                    onChange={() => handleAddOnToggle(addOn)}
                  />
                  <span>{addOn.name} (+₹{addOn.price})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="option-group">
            <label>Special Instructions:</label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests? (e.g., less oil, no onions)"
              maxLength={200}
            />
          </div>
        </div>

        <div className="customization-footer">
          <div className="total-price">
            Total: ₹{calculateTotal()}
          </div>
          <div className="action-buttons">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCustomization;