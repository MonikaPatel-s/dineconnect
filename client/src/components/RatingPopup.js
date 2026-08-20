import { useState } from "react";
import config from "../config";

export default function RatingPopup({ orderInfo, onClose }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { alert("Please select a star rating!"); return; }
    setSubmitting(true);
    try {
      await fetch(`${config.API_BASE_URL}/restaurant-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: orderInfo?.customerName || 'Guest',
          rating,
          description,
          orderId: orderInfo?.orderId,
          tableNumber: orderInfo?.tableNumber
        })
      });
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch (e) {
      alert("Error submitting review");
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      position:'fixed', top:0, left:0, right:0, bottom:0,
      background:'rgba(0,0,0,0.7)', zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'
    }}>
      <div style={{
        background:'white', borderRadius:'20px', padding:'30px',
        maxWidth:'400px', width:'100%', textAlign:'center',
        boxShadow:'0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {submitted ? (
          <>
            <div style={{fontSize:'60px', marginBottom:'10px'}}>🎉</div>
            <h2 style={{color:'#27ae60'}}>Thank you for rating!</h2>
            <p style={{color:'#666'}}>Your feedback means a lot to us.</p>
          </>
        ) : (
          <>
            <div style={{fontSize:'50px', marginBottom:'10px'}}>🍽️</div>
            <h2 style={{color:'#333', marginBottom:'5px'}}>How was your experience?</h2>
            <p style={{color:'#666', fontSize:'14px', marginBottom:'20px'}}>
              Table {orderInfo?.tableNumber} · Order #{orderInfo?.orderNumber}
            </p>

            {/* Stars */}
            <div style={{display:'flex', justifyContent:'center', gap:'10px', marginBottom:'20px'}}>
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  style={{
                    fontSize:'40px', cursor:'pointer',
                    color: (hovered || rating) >= star ? '#f39c12' : '#ddd',
                    transition:'color 0.2s'
                  }}
                >★</span>
              ))}
            </div>

            {/* Description */}
            <textarea
              placeholder="Tell us about your experience... (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{
                width:'100%', padding:'12px', borderRadius:'10px',
                border:'2px solid #eee', fontSize:'14px', resize:'none',
                boxSizing:'border-box', marginBottom:'16px', fontFamily:'inherit'
              }}
            />

            <div style={{display:'flex', gap:'10px'}}>
              <button onClick={onClose} style={{
                flex:1, padding:'12px', borderRadius:'10px',
                border:'2px solid #ddd', background:'white',
                color:'#666', cursor:'pointer', fontSize:'15px'
              }}>Skip</button>
              <button onClick={handleSubmit} disabled={submitting || rating === 0} style={{
                flex:2, padding:'12px', borderRadius:'10px',
                border:'none', background:'linear-gradient(135deg,#667eea,#764ba2)',
                color:'white', cursor:'pointer', fontSize:'15px', fontWeight:'bold'
              }}>
                {submitting ? 'Submitting...' : '⭐ Submit Rating'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
