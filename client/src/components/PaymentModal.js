import { useState } from 'react';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, orderTotal, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handlePayment = async () => {
    // Validate payment method specific fields
    if (paymentMethod === 'upi' && !upiId.trim()) {
      alert('Please enter UPI ID');
      return;
    }
    
    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
        alert('Please fill all card details');
        return;
      }
      // Basic card number validation
      if (cardDetails.number.length < 16) {
        alert('Please enter valid card number');
        return;
      }
    }

    setProcessing(true);
    
    // Handle Cash on Delivery differently
    if (paymentMethod === 'cod') {
      setTimeout(() => {
        const paymentData = {
          method: 'cod',
          amount: orderTotal,
          transactionId: 'COD' + Date.now() + Math.floor(Math.random() * 1000),
          status: 'pending', // COD is pending until cash is received
          timestamp: new Date().toISOString()
        };
        
        setProcessing(false);
        setPaymentSuccess(true);
        
        setTimeout(() => {
          onPaymentSuccess(paymentData);
        }, 1500);
      }, 1000);
      return;
    }
    
    // Simulate payment processing with random success/failure for online payments
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      if (isSuccess) {
        const paymentData = {
          method: paymentMethod,
          amount: orderTotal,
          transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
          status: 'success',
          timestamp: new Date().toISOString(),
          ...(paymentMethod === 'upi' && { upiId }),
          ...(paymentMethod === 'card' && { 
            cardLast4: cardDetails.number.slice(-4),
            cardType: cardDetails.number.startsWith('4') ? 'Visa' : 'Mastercard'
          })
        };
        
        setProcessing(false);
        setPaymentSuccess(true);
        
        // Show success animation for 2 seconds then proceed
        setTimeout(() => {
          onPaymentSuccess(paymentData);
        }, 2000);
      } else {
        setProcessing(false);
        alert('Payment failed! Please try again.');
      }
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-header">
          <h2>💳 Payment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-content">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="amount-display">
              <span>Total Amount: </span>
              <strong>₹{orderTotal}</strong>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            
            <div className="payment-options">
              <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="option-content">
                  <span className="option-icon">📱</span>
                  <span>UPI Payment</span>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="option-content">
                  <span className="option-icon">💳</span>
                  <span>Credit/Debit Card</span>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'wallet' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="option-content">
                  <span className="option-icon">👛</span>
                  <span>Digital Wallet</span>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="option-content">
                  <span className="option-icon">💵</span>
                  <span>Pay at Table (Cash)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Forms */}
          {paymentMethod === 'upi' && (
            <div className="payment-form">
              <h4>UPI Payment</h4>
              <input
                type="text"
                placeholder="Enter UPI ID (e.g., user@paytm)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="payment-input"
                pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              />
              {upiId && !upiId.includes('@') && (
                <div className="validation-hint">
                  ⚠️ Please enter valid UPI ID (e.g., user@paytm)
                </div>
              )}
              <div className="upi-apps">
                <span>Popular UPI Apps:</span>
                <div className="upi-icons">
                  <span>📱 PhonePe</span>
                  <span>💰 Paytm</span>
                  <span>🏦 GPay</span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="payment-form">
              <h4>Card Details</h4>
              <input
                type="text"
                placeholder="Card Number"
                value={cardDetails.number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only numbers
                  setCardDetails({...cardDetails, number: value});
                }}
                className="payment-input"
                maxLength="16"
              />
              <div className="card-row">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    setCardDetails({...cardDetails, expiry: value});
                  }}
                  className="payment-input"
                  maxLength="5"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setCardDetails({...cardDetails, cvv: value});
                  }}
                  className="payment-input"
                  maxLength="3"
                />
              </div>
              <input
                type="text"
                placeholder="Cardholder Name"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                className="payment-input"
              />
            </div>
          )}

          {paymentMethod === 'wallet' && (
            <div className="payment-form">
              <h4>Digital Wallet</h4>
              <div className="wallet-options">
                <button className="wallet-btn">💰 Paytm Wallet</button>
                <button className="wallet-btn">📱 PhonePe Wallet</button>
                <button className="wallet-btn">🏦 Amazon Pay</button>
              </div>
            </div>
          )}

          {paymentMethod === 'cod' && (
            <div className="payment-form">
              <h4>💵 Pay at Table (Cash)</h4>
              <div className="cod-info">
                <div className="cod-details">
                  <p>✅ Pay cash directly at your table when served</p>
                  <p>💰 Have exact change ready for faster service</p>
                  <p>🧾 Receipt will be provided after payment</p>
                </div>
                <div className="cod-note">
                  <strong>Note:</strong> Please inform the waiter when your order arrives that you'll be paying in cash.
                </div>
              </div>
            </div>
          )}

          <div className="payment-actions">
            <button 
              className={`pay-btn ${paymentSuccess ? 'success' : ''}`}
              onClick={handlePayment}
              disabled={processing || paymentSuccess}
            >
              {paymentSuccess ? (
                <>
                  <div className="success-checkmark">✅</div>
                  {paymentMethod === 'cod' ? 'Order Confirmed!' : 'Payment Successful!'}
                </>
              ) : processing ? (
                <>
                  <div className="payment-spinner"></div>
                  {paymentMethod === 'cod' ? 'Confirming Order...' : 'Processing...'}
                </>
              ) : (
                paymentMethod === 'cod' ? `Confirm Order - ₹${orderTotal}` : `Pay ₹${orderTotal}`
              )}
            </button>
          </div>

          <div className="payment-security">
            <span>🔒 Your payment is secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;