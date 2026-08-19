import { useEffect, useState } from "react";
import MenuItemCard from "../components/MenuItemCard";
import Cart from "../components/Cart";
import FavoritesPage from "./FavoritesPage";
import ReviewSection from "../components/ReviewSection";
import ThemeToggle from "../components/ThemeToggle";
import NotificationBell from "../components/NotificationBell";
import QRCodeDisplay from "../components/QRCodeDisplay";
import VoiceAssistant from "../components/VoiceAssistant";
import ChatBot from "../components/ChatBot";
import SpinWheel from "../components/SpinWheel";
import config from "../config";
import { useLanguage } from "../contexts/LanguageContext";
import { useNotification } from "../contexts/NotificationContext";
import "../App.css";

export default function CustomerDashboard({ user }) {
  const { t } = useLanguage();
  const { joinRoom, requestNotificationPermission, socket } = useNotification();
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentView, setCurrentView] = useState('menu'); // menu, favorites, reviews, qrcodes
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);
  const [tables, setTables] = useState([]);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  useEffect(() => {
    fetchMenu();
    fetchCategories();
    fetchOrderHistory();
    fetchTables();
    loadCart();
    
    // Join notification room and request permission
    if (user) {
      // Join with tableId if previously ordered from a table
      const savedTableId = localStorage.getItem('customer-tableId');
      joinRoom('customer', user.userId, savedTableId || null);
      requestNotificationPermission();
    }
  }, [user, joinRoom, requestNotificationPermission]);

  // Real-time order history update via socket
  useEffect(() => {
    if (socket) {
      socket.on('order-update', () => {
        fetchOrderHistory();
      });
      socket.on('kitchen-update', () => {
        fetchOrderHistory();
      });
      return () => {
        socket.off('order-update');
        socket.off('kitchen-update');
      };
    }
  }, [socket]);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/menu/items?limit=100`);
      const data = await response.json();
      setMenu(data.items || []);
    } catch (error) {
      console.error("Error fetching menu:", error);
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
      console.error("Error fetching categories:", error);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${config.API_BASE_URL}/orders/customer/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrderHistory(data);
      }
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

  const fetchTables = async () => {
    try {
      // For customers, we'll show public table info (without admin auth)
      const response = await fetch(`${config.API_BASE_URL}/tables/public`);
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
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

  const loadCart = () => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setCart(JSON.parse(saved));
    }
    
    // Check for 10000th customer special discount first
    const specialDiscountKey = `special-discount-${user?.userId || user?.id}`;
    const specialDiscount = localStorage.getItem(specialDiscountKey);
    if (specialDiscount) {
      try {
        const discount = JSON.parse(specialDiscount);
        setAppliedDiscount({ discount: discount.discount, isSpecial: true });
        return;
      } catch(e) {}
    }
    
    // Load saved spin discount with validation - user-specific
    const discountKey = `customer-discount-${user?.userId || user?.id || 'anonymous'}`;
    const savedDiscount = localStorage.getItem(discountKey);
    if (savedDiscount) {
      try {
        const discount = JSON.parse(savedDiscount);
        if (discount && (discount.discount > 0 || discount.special)) {
          setAppliedDiscount(discount);
        } else {
          localStorage.removeItem(discountKey);
        }
      } catch (error) {
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
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const updateCartItem = (itemId, newQty) => {
    if (newQty === 0) {
      const newCart = cart.filter(item => item._id !== itemId);
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
    } else {
      const newCart = cart.map(item => 
        item._id === itemId ? { ...item, qty: newQty } : item
      );
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  const clearAllCart = () => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
  };

  const handleVoiceOrder = async (orderItems) => {
    try {
      // First, add items to cart so user can see them
      let newCart = [...cart];
      
      orderItems.forEach(voiceItem => {
        // Find the actual menu item
        const menuItem = menu.find(item => item._id === voiceItem.id);
        if (menuItem) {
          // Check if item already exists in cart
          const existingIndex = newCart.findIndex(c => c._id === menuItem._id);
          
          if (existingIndex >= 0) {
            // Add to existing quantity
            newCart[existingIndex].qty += voiceItem.quantity;
          } else {
            // Add new item to cart
            newCart.push({ ...menuItem, qty: voiceItem.quantity });
          }
        }
      });
      
      // Update cart state and localStorage
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      
      // Show cart modal for final confirmation
      setShowCart(true);
      
      // Return success (no actual order placed yet, just added to cart)
      return { success: true, message: "Items added to cart! Please review and place order from cart." };
      
    } catch (error) {
      console.error('Error adding voice items to cart:', error);
      throw error;
    }
  };

  const filteredMenu = selectedCategory === "All" 
    ? menu 
    : menu.filter(item => item.categoryId?.name === selectedCategory);

  const cartItemsCount = cart.reduce((total, item) => total + item.qty, 0);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    window.location.reload();
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
    <div className="customer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">

          {/* Row 1: Welcome (left) + Logout (right) */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', marginBottom:'12px'}}>
            <h1 style={{fontSize:'22px', margin:0}}>🍽️ Welcome, {user?.name || 'Guest'}!</h1>
            <button className="logout-btn" onClick={logout} style={{fontSize:'16px', padding:'10px 20px'}}>
              {t('logout')}
            </button>
          </div>

          {/* Row 2: Dark Mode + Language (left) | Notification (right) */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', marginBottom:'10px'}}>
            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
              <ThemeToggle />
            </div>
            <NotificationBell />
          </div>

          {/* Row 3: Menu | My Favorites | QR Codes */}
          <div style={{display:'flex', gap:'10px', width:'100%', marginBottom:'10px', flexWrap:'wrap'}}>
            <button
              className={`nav-btn ${currentView === 'menu' ? 'active' : ''}`}
              onClick={() => setCurrentView('menu')}
              style={{flex:1, fontSize:'16px', padding:'12px 8px', minWidth:'80px'}}
            >
              🍽️ {t('menu')}
            </button>
            <button
              className={`nav-btn ${currentView === 'favorites' ? 'active' : ''}`}
              onClick={() => setCurrentView('favorites')}
              style={{flex:1, fontSize:'16px', padding:'12px 8px', minWidth:'80px'}}
            >
              ❤️ {t('favorites')}
            </button>
            <button
              className={`nav-btn ${currentView === 'qrcodes' ? 'active' : ''}`}
              onClick={() => setCurrentView('qrcodes')}
              style={{flex:1, fontSize:'16px', padding:'12px 8px', minWidth:'80px'}}
            >
              📱 QR Codes
            </button>
          </div>

          {/* Row 4: Dine | Spin */}
          <div style={{display:'flex', gap:'10px', width:'100%', marginBottom:'10px'}}>
            <button
              className={`nav-btn ${currentView === 'voice' ? 'active' : ''}`}
              onClick={() => setCurrentView('voice')}
              style={{flex:1, fontSize:'16px', padding:'12px 8px'}}
            >
              🎤 Dine
            </button>
            <button
              className="spin-wheel-btn"
              onClick={() => setShowSpinWheel(true)}
              disabled={appliedDiscount !== null}
              title={appliedDiscount ?
                (appliedDiscount.isSpecial ? "🎉 Special 50% discount applied!" : "Already used spin wheel today")
                : "Spin for discounts!"}
              style={{flex:1, fontSize:'16px', padding:'12px 8px'}}
            >
              🎡 {appliedDiscount ? getDiscountText(appliedDiscount) : 'Spin & Win'}
            </button>
          </div>

          {/* Row 5: Cart | Order History */}
          <div style={{display:'flex', gap:'10px', width:'100%', marginBottom:'4px'}}>
            <button
              className="cart-btn"
              onClick={() => setShowCart(true)}
              style={{flex:1, fontSize:'16px', padding:'12px 8px'}}
            >
              🛒 {t('cart')} ({cartItemsCount})
            </button>
            <button
              className="history-btn"
              onClick={() => { fetchOrderHistory(); setShowHistory(true); }}
              style={{flex:1, fontSize:'16px', padding:'12px 8px'}}
            >
              📋 {t('orderHistory')}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      {currentView === 'menu' && (
        <>
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
                  user={user}
                  onReviewClick={setSelectedItemForReview}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {currentView === 'favorites' && (
        <FavoritesPage 
          user={user} 
          onAddToCart={addToCart} 
          cart={cart} 
        />
      )}

      {currentView === 'voice' && (
        <div className="voice-section">
          <VoiceAssistant 
            menuItems={menu}
            onPlaceOrder={handleVoiceOrder}
            customerName={user?.name}
          />
        </div>
      )}

      {currentView === 'qrcodes' && (
        <div className="qrcodes-section">
          <h2>📱 Table QR Codes</h2>
          <p>Scan these QR codes to access table-specific menus for quick ordering!</p>
          
          <div className="qr-grid">
            {tables.map(table => (
              <div key={table._id} className="qr-card">
                <div className="qr-header">
                  <h3>🪑 Table {table.number}</h3>
                  <p>Capacity: {table.capacity} people</p>
                </div>
                
                <div className="qr-code-container">
                  <QRCodeDisplay 
                    value={`http://${window.location.hostname === 'localhost' ? '10.235.195.51' : window.location.hostname}:3001/m/${table.qrSlug}`}
                    size={150}
                  />
                </div>
                
                <div className="qr-actions">
                  <button 
                    className="view-menu-btn"
                    onClick={() => window.open(`http://localhost:3000/m/${table.qrSlug}`, '_blank')}
                  >
                    🍽️ View Menu
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {tables.length === 0 && (
            <div className="no-tables">
              <p>No tables available at the moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedItemForReview && (
        <div className="modal-overlay" onClick={() => setSelectedItemForReview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reviews for {selectedItemForReview.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedItemForReview(null)}
              >
                ×
              </button>
            </div>
            <ReviewSection 
              menuItemId={selectedItemForReview._id} 
              user={user} 
            />
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <Cart
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateItem={updateCartItem}
          onClearAll={clearAllCart}
          appliedDiscount={appliedDiscount}
          onOrderPlaced={() => {
            fetchOrderHistory();
            // Rejoin socket room with updated tableId after order is placed
            const savedTableId = localStorage.getItem('customer-tableId');
            if (savedTableId) {
              joinRoom('customer', user?.userId, savedTableId);
            }
          }}
        />
      )}

      {/* Order History Modal */}
      {showHistory && (
        <div className="cart-modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>📋 Order History</h2>
              <button className="close-btn" onClick={() => setShowHistory(false)}>×</button>
            </div>
            <div className="cart-content">
              {orderHistory.length === 0 ? (
                <div className="empty-cart">
                  <p>No orders yet</p>
                  <p>Start ordering to see your history!</p>
                </div>
              ) : (
                <div className="order-history-list">
                  {orderHistory.map(order => (
                    <div key={order._id} className="history-order">
                      <div className="order-header">
                        <span className="order-number">#{order.orderNumber}</span>
                        <span className="order-status-badge" style={{
                          background: order.status === 'placed' ? '#f39c12' :
                                      order.status === 'preparing' ? '#3498db' :
                                      order.status === 'ready' ? '#27ae60' :
                                      order.status === 'served' ? '#8e44ad' :
                                      order.status === 'canceled' ? '#e74c3c' : '#95a5a6',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {order.status === 'placed' ? '🕐 Placed' :
                           order.status === 'preparing' ? '👨‍🍳 Preparing' :
                           order.status === 'ready' ? '✅ Ready' :
                           order.status === 'served' ? '🎉 Served' :
                           order.status === 'canceled' ? '❌ Canceled' : order.status}
                        </span>
                      </div>
                      <div className="order-details">
                        <div>🪑 Table {order.tableId?.number}</div>
                        <div>📅 {new Date(order.createdAt).toLocaleDateString()}</div>
                        <div className="order-total" style={{color: '#ff6b35', fontWeight: 'bold', fontSize: '18px'}}>₹{order.total}</div>
                      </div>
                      <div className="order-items-summary">
                        {order.items.map((item, idx) => (
                          <span key={idx}>
                            {item.menuItemId?.name} x{item.qty}
                            {idx < order.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spin Wheel Modal */}
      {showSpinWheel && (
        <SpinWheel
          onClose={() => setShowSpinWheel(false)}
          onWin={(prize) => {
            setAppliedDiscount(prize);
            // Use user-specific key
            const discountKey = `customer-discount-${user?.userId || user?.id || 'anonymous'}`;
            localStorage.setItem(discountKey, JSON.stringify(prize));
            if (prize.special === "free_dessert") {
              alert("🍰 Congratulations! Free dessert added to your benefits!");
            } else if (prize.special === "free_drink") {
              alert("🥤 Awesome! Free drink added to your benefits!");
            } else {
              alert(`🎉 Amazing! ${prize.discount}% discount applied to your orders!`);
            }
          }}
        />
      )}

      {/* ChatBot */}
      <ChatBot 
        menuItems={menu}
        currentTable={null}
      />
    </div>
  );
}
