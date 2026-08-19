import { useState, useEffect } from "react";
import Receipt from "./Receipt";
import PaymentModal from "./PaymentModal";
import config from "../config";
import "../App.css";

export default function Cart({ cart, onClose, onUpdateItem, onPlaceOrder, onClearAll, appliedDiscount, onOrderPlaced }) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const spinDiscountAmount = appliedDiscount?.discount ? Math.round(subtotal * appliedDiscount.discount / 100) : 0;
  const couponDiscountAmount = couponDiscount ? couponDiscount.discountAmount : 0;
  const total = subtotal - spinDiscountAmount - couponDiscountAmount;

  useEffect(() => {
    fetch(`${config.API_BASE_URL}/tables/public`)
      .then(r => r.json())
      .then(data => setTables(data))
      .catch(() => {});
  }, []);

  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      // If quantity becomes 0 or negative, remove item
      onUpdateItem(itemId, 0);
    } else {
      onUpdateItem(itemId, newQty);
    }
  };

  const removeItem = (itemId, itemName) => {
    if (window.confirm(`Remove ${itemName} from cart?`)) {
      onUpdateItem(itemId, 0);
    }
  };

  const clearAllItems = () => {
    if (window.confirm('Clear all items from cart?')) {
      if (onClearAll) {
        // Use the dedicated clear all function for instant clearing
        onClearAll();
      } else {
        // Fallback: clear items one by one
        cart.forEach(item => onUpdateItem(item._id, 0));
      }
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: subtotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponDiscount(data);
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ ${data.message}`);
        setCouponDiscount(null);
      }
    } catch (e) {
      alert('Error applying coupon');
    }
    setCouponLoading(false);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    if (!selectedTable) {
      alert("Please select your table number!");
      return;
    }
    setShowOrderConfirm(true);
  };

  const confirmOrder = () => {
    setShowOrderConfirm(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    setShowPayment(false);
    
    if (onPlaceOrder) {
      const order = await onPlaceOrder(paymentData);
      if (order) {
        setLastOrder({...order, paymentData});
        setShowReceipt(true);
      }
    } else {
      // Default order placement for logged-in users
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login first!");
        return;
      }
      
      try {
        // Create order via API with payment data
        const orderData = {
          tableId: selectedTable,
          items: cart.map(item => ({
            menuItemId: item._id,
            qty: item.qty,
            note: ""
          })),
          paymentData: paymentData, // Include payment information
          guestSession: !token ? `guest_${Date.now()}` : undefined // Add guest session if no token
        };

        const headers = {
          "Content-Type": "application/json"
        };
        
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${config.API_BASE_URL}/orders`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(orderData)
        });

        if (response.ok) {
          const order = await response.json();
          console.log("✅ Order created successfully:", order);
          setLastOrder({...order, paymentData});
          setShowReceipt(true);
          // Clear cart after successful order
          if (onClearAll) {
            onClearAll();
          } else {
            cart.forEach(item => onUpdateItem(item._id, 0));
          }
          // Trigger order history refresh
          if (onOrderPlaced) onOrderPlaced();
        } else {
          const error = await response.json();
          console.error("❌ Order creation failed:", error);
          alert(`Failed to place order: ${error.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("❌ Network error placing order:", error);
        alert(`Failed to place order: ${error.message || 'Network error'}. Please check your connection and try again.`);
      }
      // Don't auto-close cart on error
    }
  };

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>🛒 Your Cart</h2>
          <div className="cart-header-actions">
            {cart.length > 0 && (
              <button 
                className="clear-cart-btn"
                onClick={() => clearAllItems()}
                title="Clear all items"
              >
                🗑️ Clear All
              </button>
            )}
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <p>Add some delicious items!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item._id} className="cart-item">
                    <img
                      src={item.imageUrl || item.img || `https://via.placeholder.com/60x60/ff6b35/ffffff?text=${encodeURIComponent(item.name.charAt(0))}`}
                      alt={item.name}
                      className="cart-item-image"
                      onError={e => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/60x60/ff6b35/ffffff?text=${encodeURIComponent(item.name.charAt(0))}`; }}
                    />
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">₹{item.price}</p>
                    </div>
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, item.qty - 1)}
                      >
                        -
                      </button>
                      <span className="quantity">{item.qty}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item._id, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="item-actions">
                      <div className="item-total">
                        ₹{item.price * item.qty}
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => removeItem(item._id, item.name)}
                        title="Remove item from cart"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="table-select-section">
                  <label><strong>🪑 Select Your Table:</strong></label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="table-select-dropdown"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginTop: '8px',
                      marginBottom: '12px',
                      borderRadius: '8px',
                      border: '2px solid #667eea',
                      fontSize: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Choose Table --</option>
                    {tables.map(table => (
                      <option key={table._id} value={table._id}>
                        Table {table.number} (Capacity: {table.capacity})
                      </option>
                    ))}
                  </select>
                </div>
                {/* Coupon Code Input */}
                <div style={{marginBottom:'12px'}}>
                  <label style={{fontWeight:'bold',fontSize:'14px'}}>🎟️ Coupon Code</label>
                  <div style={{display:'flex',gap:'8px',marginTop:'6px'}}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      style={{flex:1,padding:'8px 12px',borderRadius:'8px',border:'2px solid #667eea',fontSize:'14px',textTransform:'uppercase'}}
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      style={{padding:'8px 16px',background:'#667eea',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'bold',fontSize:'14px'}}
                    >
                      {couponLoading ? '⏳' : 'Apply'}
                    </button>
                    {couponDiscount && (
                      <button
                        onClick={() => { setCouponDiscount(null); setCouponCode(''); }}
                        style={{padding:'8px 12px',background:'#e74c3c',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'bold'}}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {couponDiscount && (
                    <div style={{color:'green',fontSize:'13px',marginTop:'4px'}}>
                      ✅ {couponDiscount.message || `Coupon applied!`}
                    </div>
                  )}
                </div>

                <div className="total-amount">
                  <div>Subtotal: ₹{subtotal}</div>
                  {spinDiscountAmount > 0 && (
                    <div style={{color: 'green'}}>
                      🎉 Spin Discount ({appliedDiscount.discount}% OFF): -₹{spinDiscountAmount}
                    </div>
                  )}
                  {appliedDiscount?.special === 'free_dessert' && (
                    <div style={{color: 'green'}}>🍰 Free Dessert Applied!</div>
                  )}
                  {appliedDiscount?.special === 'free_drink' && (
                    <div style={{color: 'green'}}>🥤 Free Drink Applied!</div>
                  )}
                  {couponDiscountAmount > 0 && (
                    <div style={{color: 'green'}}>
                      🎟️ Coupon ({couponDiscount.discountType === 'percent' ? couponDiscount.discountValue + '% OFF' : '₹' + couponDiscount.discountValue + ' OFF'}): -₹{couponDiscountAmount}
                    </div>
                  )}
                  <strong>Total: ₹{total}</strong>
                </div>
                <button className="place-order-btn" onClick={handlePlaceOrder}>
                  💳 Pay & Order
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showOrderConfirm && (
        <div className="order-confirm-overlay" onClick={() => setShowOrderConfirm(false)}>
          <div className="order-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-confirm-header">
              <h3>🛒 Confirm Your Order</h3>
              <button className="close-btn" onClick={() => setShowOrderConfirm(false)}>×</button>
            </div>
            
            <div className="order-confirm-content">
              <p>You are about to order {cart.length} item{cart.length > 1 ? 's' : ''}:</p>
              
              <div className="order-confirm-items">
                {cart.map((item) => (
                  <div key={item._id} className="confirm-item">
                    <span className="confirm-item-name">{item.qty}x {item.name}</span>
                    <span className="confirm-item-price">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-confirm-total">
                <strong>Total Amount: ₹{total}</strong>
              </div>
              
              <div className="order-confirm-actions">
                <button 
                  className="cancel-order-btn"
                  onClick={() => setShowOrderConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="proceed-payment-btn"
                  onClick={confirmOrder}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          orderTotal={total}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && lastOrder && (
        <Receipt
          order={lastOrder}
          onClose={() => {
            setShowReceipt(false);
            onClose();
          }}
          restaurantInfo={{
            name: "DineConnect",
            address: "123 Food Street, Restaurant City",
            phone: "+91-9876543210",
            gst: "22AAAAA0000A1Z5"
          }}
        />
      )}
    </div>
  );
}
