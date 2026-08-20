import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../config";

export default function RatingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const quickLabels = [
    { stars: 1, label: "😞 Poor",    color: "#e74c3c" },
    { stars: 2, label: "😐 Average", color: "#e67e22" },
    { stars: 3, label: "🙂 Good",    color: "#f39c12" },
    { stars: 4, label: "😊 Better",  color: "#27ae60" },
    { stars: 5, label: "🤩 Best!",   color: "#667eea" },
  ];

  const handleSubmit = async () => {
    if (rating === 0) { alert("Please select a rating!"); return; }
    setSubmitting(true);
    try {
      const currentTable = JSON.parse(localStorage.getItem('currentTable') || 'null');
      await fetch(`${config.API_BASE_URL}/restaurant-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Guest',
          rating,
          description,
          orderId,
          tableNumber: currentTable?.number
        })
      });
      setSubmitted(true);
    } catch (e) {
      alert("Error submitting. Please try again.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div style={{
        minHeight:'100vh', background:'linear-gradient(135deg,#667eea,#764ba2)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'
      }}>
        <div style={{background:'white', borderRadius:'24px', padding:'40px', textAlign:'center', maxWidth:'400px', width:'100%'}}>
          <div style={{fontSize:'80px', marginBottom:'16px'}}>🎉</div>
          <h2 style={{color:'#27ae60', fontSize:'24px', marginBottom:'8px'}}>Thank You!</h2>
          <p style={{color:'#666', marginBottom:'24px'}}>Your feedback means a lot to us!</p>
          <button onClick={() => navigate('/login')} style={{
            padding:'12px 32px', background:'linear-gradient(135deg,#667eea,#764ba2)',
            color:'white', border:'none', borderRadius:'12px', fontSize:'16px',
            fontWeight:'bold', cursor:'pointer'
          }}>← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight:'100vh', background:'linear-gradient(135deg,#667eea,#764ba2)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'
    }}>
      <div style={{background:'white', borderRadius:'24px', padding:'30px', maxWidth:'420px', width:'100%'}}>
        
        <div style={{textAlign:'center', marginBottom:'24px'}}>
          <div style={{fontSize:'50px', marginBottom:'8px'}}>🍽️</div>
          <h2 style={{color:'#333', fontSize:'22px', marginBottom:'4px'}}>Rate Your Experience</h2>
          <p style={{color:'#888', fontSize:'14px'}}>DineConnect Restaurant</p>
        </div>

        {/* Quick Label Buttons */}
        <div style={{display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap', justifyContent:'center'}}>
          {quickLabels.map(({stars, label, color}) => (
            <button key={stars} onClick={() => setRating(stars)} style={{
              padding:'8px 14px', borderRadius:'20px', border:`2px solid ${color}`,
              background: rating === stars ? color : 'white',
              color: rating === stars ? 'white' : color,
              cursor:'pointer', fontWeight:'bold', fontSize:'13px',
              transition:'all 0.2s'
            }}>{label}</button>
          ))}
        </div>

        {/* Star Rating */}
        <div style={{display:'flex', justifyContent:'center', gap:'8px', marginBottom:'20px'}}>
          {[1,2,3,4,5].map(star => (
            <span key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{
                fontSize:'44px', cursor:'pointer',
                color: (hovered || rating) >= star ? '#f39c12' : '#ddd',
                transition:'color 0.15s'
              }}
            >★</span>
          ))}
        </div>

        {rating > 0 && (
          <p style={{textAlign:'center', color: quickLabels[rating-1].color, fontWeight:'bold', fontSize:'16px', marginBottom:'16px'}}>
            {quickLabels[rating-1].label}
          </p>
        )}

        {/* Description */}
        <textarea
          placeholder="Tell us about your experience... (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          style={{
            width:'100%', padding:'12px', borderRadius:'12px',
            border:'2px solid #eee', fontSize:'14px', resize:'none',
            boxSizing:'border-box', marginBottom:'16px', fontFamily:'inherit',
            outline:'none'
          }}
          onFocus={e => e.target.style.borderColor='#667eea'}
          onBlur={e => e.target.style.borderColor='#eee'}
        />

        <button onClick={handleSubmit} disabled={submitting || rating === 0} style={{
          width:'100%', padding:'14px', borderRadius:'12px', border:'none',
          background: rating === 0 ? '#ccc' : 'linear-gradient(135deg,#667eea,#764ba2)',
          color:'white', cursor: rating === 0 ? 'not-allowed' : 'pointer',
          fontSize:'16px', fontWeight:'bold'
        }}>
          {submitting ? '⏳ Submitting...' : '⭐ Submit Rating'}
        </button>
      </div>
    </div>
  );
}
