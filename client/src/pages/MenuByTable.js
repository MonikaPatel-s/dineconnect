import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuItemCard from "../components/MenuItemCard";
import Cart from "../components/Cart";
import NotificationBell from "../components/NotificationBell";
import VoiceOrdering from "../components/VoiceOrdering";
import ChatBot from "../components/ChatBot";
import SpinWheel from "../components/SpinWheel";
import RatingPopup from "../components/RatingPopup";
import config from "../config";
import { useNotification } from "../contexts/NotificationContext";
import "../App.css";

export default function MenuByTable({ user, setUser }) {
  const { tableSlug } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [guestSession] = useState(() => 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9));
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [ratingOrderInfo, setRatingOrderInfo] = useState(null);
  const { joinRoom, requestNotificationPermission, socket } = useNotification();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // No token - save slug and go to login
      localStorage.setItem('pendingTableSlug', tableSlug);
      navigate('/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role === 'staff') { navigate('/staff'); return; }
      if (payload.role === 'admin') { navigate('/admin'); return; }
      // Valid customer token - load menu
      fetchTableInfo();
      fetchMenu();
      fetchCategories();
      loadCart();
    } catch(e) {
      localStorage.setItem('pendingTableSlug', tableSlug);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [tableSlug]);

  useEffect(() => {
    // Join table-specific notification room for guest users
    if (table) {
      joinRoom('customer', guestSession, table.tableId);
      requestNotificationPermission();
    }
  }, [table, guestSession, joinRoom, requestNotificationPermission]);

  // Listen for rating request after order served
  useEffect(() => {
    if (socket) {
      socket.on('rating-request', (data) => {
        setRatingOrderInfo(data);
        setShowRatingPopup(true);
      });
      // Also listen for order-update and show rating when served
      socket.on('order-update', (data) => {
        if (data.status === 'served') {
          setTimeout(() => {
            setRatingOrderInfo({
              orderId: data.orderId,
              orderNumber: data.orderNumber,
              tableNumber: data.tableNumber,
              customerName: 'Guest'
            });
            setShowRatingPopup(true);
          }, 10 * 60 * 1000); // 10 minutes
        }
      });
      return () => {
        socket.off('rating-request');
        socket.off('order-update');
      };
    }
  }, [socket]);

  // Check for pending rating from notification context
  useEffect(() => {
    const checkPendingRating = setInterval(() => {
      if (window.__pendingRating) {
        setRatingOrderInfo(window.__pendingRating);
        setShowRatingPopup(true);
        window.__pendingRating = null;
      }
    }, 5000);
    return () => clearInterval(checkPendingRating);
  }, []);

  const fetchTableInfo = async () => {
    try {
      const apiUrl = `${config.API_BASE_URL}/tables/by-slug/${tableSlug}`;
      console.log('🔍 Fetching table info from:', apiUrl);
      console.log('🏷️ Table slug:', tableSlug);
      
      const response = await fetch(apiUrl);
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Table data received:', data);
        setTable(data);
        localStorage.setItem('currentTable', JSON.stringify(data));
      } else {
        const errorText = await response.text();
        console.error('❌ Table not found. Response:', errorText);
        console.error('❌ Status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching table info:', error);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/menu/items?availability=true&limit=100`);
      const data = await response.json();
      setMenu(data.items || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/menu/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const loadCart = () => {
    const saved = localStorage.getItem(`cart-${tableSlug}`);
    if (saved) {
      setCart(JSON.parse(saved));
    }
    
    // Load saved discount with validation - user-specific
    const discountKey = `discount-${tableSlug}-${guestSession}`;
    const savedDiscount = localStorage.getItem(discountKey);
    if (savedDiscount) {
      try {
        const discount = JSON.parse(savedDiscount);
        // Validate discount object
        if (discount && (discount.discount > 0 || discount.special)) {
          setAppliedDiscount(discount);
        } else {
          // Clear invalid discount
          localStorage.removeItem(discountKey);
        }
      } catch (error) {
        // Clear corrupted discount data
        localStorage.removeItem(discountKey);
      }
    }
  };

  const addToCart = (item) => {
    const existingIndex = cart.findIndex(c => c._id === item._id);
    let newCart;
    
    if (existingIndex >= 0) {
      newCart = [...cart];
      newCart[existingIndex].qty += 1;
    } else {
      newCart = [...cart, { ...item, qty: 1 }];
    }

    setCart(newCart);
    localStorage.setItem(`cart-${tableSlug}`, JSON.stringify(newCart));
  };

  const updateCartItem = (itemId, newQty) => {
    if (newQty === 0) {
      const newCart = cart.filter(item => item._id !== itemId);
      setCart(newCart);
      localStorage.setItem(`cart-${tableSlug}`, JSON.stringify(newCart));
    } else {
      const newCart = cart.map(item => 
        item._id === itemId ? { ...item, qty: newQty } : item
      );
      setCart(newCart);
      localStorage.setItem(`cart-${tableSlug}`, JSON.stringify(newCart));
    }
  };

  const handleVoiceSearch = (searchQuery) => {
    // Extract search terms from voice command
    const query = searchQuery.toLowerCase();
    
    if (query.includes('show') || query.includes('search')) {
      // Extract the item type from voice command
      const searchTerms = ['biryani', 'chicken', 'mutton', 'dal', 'roti', 'drink', 'lassi', 'tea', 'coffee'];
      const foundTerm = searchTerms.find(term => query.includes(term));
      
      if (foundTerm) {
        setSearchTerm(foundTerm);
        
        // Also set category if applicable
        const categoryMap = {
          'biryani': 'Main Course',
          'chicken': 'Main Course', 
          'mutton': 'Main Course',
          'dal': 'Main Course',
          'roti': 'Breads',
          'drink': 'Beverages',
          'lassi': 'Beverages',
          'tea': 'Beverages',
          'coffee': 'Beverages'
        };
        
        const category = categoryMap[foundTerm];
        if (category && categories.find(cat => cat.name === category)) {
          setSelectedCategory(category);
        }
      } else {
        // General search
        setSearchTerm(query.replace(/show|search|me|for/g, '').trim());
      }
    }
  };

  const getDiscountText = (discount) => {
    if (!discount) return 'Spin & Win';
    
    if (discount.special === "free_dessert") {
      return "🍰 Free Dessert";
    } else if (discount.special === "free_drink") {
      return "🥤 Free Drink";
    } else if (discount.discount) {
      return `${discount.discount}% OFF`;
    } else {
      return "🎁 Prize Won";
    }
  };

  const handleSpinWin = (prize) => {
    console.log('🎡 Spin Win Result:', prize);
    setAppliedDiscount(prize);
    // Use user-specific key with guestSession
    localStorage.setItem(`discount-${tableSlug}-${guestSession}`, JSON.stringify(prize));
    
    // Show success message
    if (prize.special === "free_dessert") {
      alert("🍰 Congratulations! Free dessert added to your benefits!");
    } else if (prize.special === "free_drink") {
      alert("🥤 Awesome! Free drink added to your benefits!");
    } else if (prize.discount) {
      alert(`🎉 Amazing! ${prize.discount}% discount applied to your order!`);
    } else {
      alert("🎁 Congratulations! You won a special prize!");
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
    let discount = 0;
    
    if (appliedDiscount && appliedDiscount.discount > 0) {
      discount = (subtotal * appliedDiscount.discount) / 100;
    }
    
    return {
      subtotal,
      discount,
      total: subtotal - discount
    };
  };

  const placeOrder = async (paymentData = null) => {
    if (!table || cart.length === 0) return null;

    try {
      const totals = calculateTotal();
      
      const orderData = {
        tableId: table.tableId,
        guestSession,
        items: cart.map(item => ({
          menuItemId: item._id,
          qty: item.qty,
          note: ""
        })),
        appliedDiscount: appliedDiscount,
        subtotal: totals.subtotal,
        discount: totals.discount,
        total: totals.total,
        paymentData
      };

      const response = await fetch(`${config.API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        setCart([]);
        setAppliedDiscount(null);
        localStorage.removeItem(`cart-${tableSlug}`);
        localStorage.removeItem(`discount-${tableSlug}-${guestSession}`);
        return order; // Return order for receipt
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
        return null;
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
      return null;
    }
  };

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === "All" || 
      categories.find(cat => cat._id === item.categoryId?._id)?.name === selectedCategory;
    
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const cartItemsCount = cart.reduce((total, item) => total + item.qty, 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="error-container">
        <h2>❌ Table Not Found</h2>
        <p>The QR code you scanned is invalid or the table is not active.</p>
      </div>
    );
  }

  return (
    <div className="table-menu-page">
      {/* Header */}
      <header className="table-header">
        <div className="header-content">
          <div className="table-info">
            <h1>🍽️ Table {table.number}</h1>
            <p>DineConnect</p>
          </div>
          <div className="header-actions">
            <NotificationBell />
            <button 
              className="spin-wheel-btn"
              onClick={(e) => {
                console.log('🎡 Spin button clicked!', e);
                setShowSpinWheel(true);
              }}
              disabled={false} // Temporarily enable multiple spins for testing
              data-testing="true"
              title={appliedDiscount ? "Click to spin again (Testing Mode)" : "Spin for discounts!"}
              style={{ cursor: 'pointer !important' }}
            >
              🎡 {appliedDiscount ? getDiscountText(appliedDiscount) : 'Spin & Win'}
            </button>
            {appliedDiscount && (
              <button 
                className="reset-spin-btn"
                onClick={() => {
                  setAppliedDiscount(null);
                  localStorage.removeItem(`discount-${tableSlug}-${guestSession}`);
                }}
                title="Reset spin wheel for testing"
              >
                🔄 Reset
              </button>
            )}
            <button 
              className="cart-btn"
              onClick={() => setShowCart(true)}
            >
              🛒 Cart ({cartItemsCount})
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search menu items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Voice Ordering */}
      <VoiceOrdering 
        menuItems={menu}
        onAddToCart={addToCart}
        onVoiceSearch={handleVoiceSearch}
      />

      {/* Category Filter */}
      <div className="category-filter">
        <button
          className={`category-btn ${selectedCategory === "All" ? 'active' : ''}`}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category._id}
            className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.name)}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="menu-container">
        <div className="menu-grid">
          {filteredMenu.map(item => (
            <MenuItemCard
              key={item._id}
              item={item}
              onAddToCart={addToCart}
              cartItem={cart.find(c => c._id === item._id)}
            />
          ))}
        </div>
        
        {filteredMenu.length === 0 && (
          <div className="no-items">
            <p>No items found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <Cart
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateItem={updateCartItem}
          onPlaceOrder={placeOrder}
          isGuest={true}
          preSelectedTable={table?.tableId}
        />
      )}

      {/* Spin Wheel Modal */}
      {showSpinWheel && (
        <SpinWheel
          onClose={() => setShowSpinWheel(false)}
          onWin={handleSpinWin}
          allowMultipleSpins={false} // Change to true for unlimited spins
          resetKey={tableSlug} // Resets when changing tables
        />
      )}

      {/* ChatBot */}
      <ChatBot 
        menuItems={menu}
        currentTable={table}
        onAddToCart={addToCart}
      />

      {/* Rating Popup */}
      {showRatingPopup && (
        <RatingPopup
          orderInfo={ratingOrderInfo}
          onClose={() => setShowRatingPopup(false)}
        />
      )}
    </div>
  );
}