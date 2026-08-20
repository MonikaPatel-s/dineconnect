import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import "../App.css";
import "../components/GoogleLogin.css";

export default function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [staffMode, setStaffMode] = useState('login');
  const [customerMode, setCustomerMode] = useState('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [adminUniqueId, setAdminUniqueId] = useState("");

  const ADMIN_UNIQUE_ID = "DINE-ADMIN-9K7X-2024";

  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px',
    border: '2px solid #ddd', marginTop: '4px',
    boxSizing: 'border-box', fontSize: '15px', color: '#000'
  };

  const resetFields = () => { setEmail(""); setPassword(""); setName(""); };

  // ── LOGIN ──
  const handleLogin = async (role) => {
    if (role === 'admin' && adminUniqueId !== ADMIN_UNIQUE_ID) {
      alert("❌ Invalid Admin ID!");
      return;
    }
    try {
      const res = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, requestedRole: role }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          if (data.user.specialDiscount) {
            localStorage.setItem(`special-discount-${data.user.id}`, JSON.stringify(data.user.specialDiscount));
            setTimeout(() => alert(`🎉 You are our 10,000th Customer! 50% OFF! 🥳`), 500);
          }
          setUser(data.user);
          // Redirect to pending table only for customers
          const pendingTable = localStorage.getItem('pendingTableSlug');
          if (pendingTable && data.user.role === 'customer') {
            localStorage.removeItem('pendingTableSlug');
            navigate(`/m/${pendingTable}`);
          } else {
            // Staff/Admin - clear any pending table
            localStorage.removeItem('pendingTableSlug');
          }
        }
      } else {
        if (data.message === 'pending_approval') {
          alert(`⏳ Admin approval pending hai. Approve hone ke baad login kar sakte ho.`);
        } else {
          alert(data.message);
        }
      }
    } catch (err) {
      alert("Server Error ❌");
    }
  };

  // ── SIGNUP ──
  const handleSignup = async (role) => {
    if (!name || !email || !password) { alert("Sabhi fields fill karo!"); return; }
    try {
      const res = await fetch(`${config.API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        if (role === 'staff') {
          alert("✅ Request send ho gayi! Admin approve karega tab login hoga.");
          setStaffMode('login');
        } else {
          alert("✅ Account ban gaya! Ab login karo.");
          setCustomerMode('login');
        }
        resetFields();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Server Error ❌");
    }
  };

  const Branding = () => {
    const [reviews, setReviews] = useState([]);
    useEffect(() => {
      fetch(`${config.API_BASE_URL}/restaurant-reviews`)
        .then(r => r.json())
        .then(data => setReviews(data))
        .catch(() => {});
    }, []);

    return (
    <div className="login-branding">
      <div className="branding-content">
        <div className="brand-logo"><span className="logo-icon">🍽️</span></div>
        <h1 className="brand-title">DineConnect</h1>
        <p className="brand-subtitle">Connecting Diners with Great Food</p>
        <div className="brand-description" style={{marginTop:'-8px'}}>
          <p>Where great food meets unforgettable moments.</p>
        </div>
        <div className="brand-features">
          <div className="feature-item">
            <span className="feature-icon">⭐</span>
            <span className="feature-text">Rate & Review</span>
          </div>
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div style={{marginTop:'20px', width:'100%'}}>
            <h3 style={{color:'white', fontSize:'16px', marginBottom:'12px', opacity:0.9}}>
              💬 What our customers say
            </h3>
            <div style={{display:'flex', flexDirection:'column', gap:'10px', maxHeight:'280px', overflowY:'auto'}}>
              {reviews.map(r => (
                <div key={r._id} style={{
                  background:'rgba(255,255,255,0.15)', borderRadius:'12px',
                  padding:'12px', textAlign:'left', backdropFilter:'blur(5px)'
                }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px'}}>
                    <span style={{color:'white', fontWeight:'bold', fontSize:'14px'}}>
                      {r.customerName}
                    </span>
                    <span style={{fontSize:'16px'}}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.description && (
                    <p style={{color:'rgba(255,255,255,0.85)', fontSize:'13px', margin:0}}>
                      "{r.description}"
                    </p>
                  )}
                  {r.tableNumber && (
                    <span style={{color:'rgba(255,255,255,0.6)', fontSize:'11px'}}>
                      Table {r.tableNumber}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
  };

  const BackBtn = (color) => (
    <button onClick={() => { setSelectedRole(null); resetFields(); }}
      style={{background:'none', border:'none', cursor:'pointer', fontSize:'18px', color: color || '#667eea', marginBottom:'10px', display:'block'}}>
      ← Back
    </button>
  );

  // ─── ROLE SELECTION ───
  if (!selectedRole) {
    return (
      <div className="login-page">
        <Branding />
        <div className="login-form-section" style={{background:'white'}}>
          <div className="login-container" style={{padding:'30px 40px', overflowY:'auto', maxHeight:'100vh'}}>
            <div className="login-header">
              <h2 style={{color:'#000', fontWeight:'900', fontSize:'26px', WebkitTextFillColor:'#000'}}>Welcome to DineConnect!</h2>
              <p style={{color:'#000', fontSize:'15px', fontWeight:'700', WebkitTextFillColor:'#000'}}>Please select your role to continue</p>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'16px', marginTop:'20px'}}>
              <button onClick={() => { setSelectedRole('admin'); resetFields(); }}
                style={{padding:'20px', borderRadius:'16px', border:'none',
                  background:'linear-gradient(135deg,#4a0080,#7b2ff7)', color:'white',
                  cursor:'pointer', fontSize:'16px', fontWeight:'bold',
                  display:'flex', alignItems:'center', gap:'14px',
                  boxShadow:'0 4px 15px rgba(74,0,128,0.4)'}}>
                <span style={{fontSize:'32px'}}>👑</span>
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:'18px'}}>Admin</div>
                  <div style={{fontSize:'12px', opacity:0.85, fontWeight:'normal'}}>Full system control</div>
                </div>
              </button>

              <button onClick={() => { setSelectedRole('staff'); setStaffMode('login'); resetFields(); }}
                style={{padding:'20px', borderRadius:'16px', border:'none',
                  background:'linear-gradient(135deg,#1a237e,#3949ab)', color:'white',
                  cursor:'pointer', fontSize:'16px', fontWeight:'bold',
                  display:'flex', alignItems:'center', gap:'14px',
                  boxShadow:'0 4px 15px rgba(26,35,126,0.4)'}}>
                <span style={{fontSize:'32px'}}>👨‍🍳</span>
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:'18px'}}>Chef / Staff</div>
                  <div style={{fontSize:'12px', opacity:0.85, fontWeight:'normal'}}>Manage orders & kitchen</div>
                </div>
              </button>

              <button onClick={() => { setSelectedRole('customer'); setCustomerMode('login'); resetFields(); }}
                style={{padding:'20px', borderRadius:'16px', border:'none',
                  background:'linear-gradient(135deg,#006064,#00acc1)', color:'white',
                  cursor:'pointer', fontSize:'16px', fontWeight:'bold',
                  display:'flex', alignItems:'center', gap:'14px', width:'100%',
                  boxShadow:'0 4px 15px rgba(0,96,100,0.4)'}}>
                <span style={{fontSize:'32px'}}>🍽️</span>
                <div style={{textAlign:'left'}}>
                  <div style={{fontSize:'18px'}}>Customer</div>
                  <div style={{fontSize:'13px', opacity:0.85, fontWeight:'normal'}}>Login or Sign up to order</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ADMIN ───
  if (selectedRole === 'admin') {
    return (
      <div className="login-page">
        <Branding />
        <div className="login-form-section" style={{background:'white'}}>
          <div className="login-container" style={{padding:'30px 40px'}}>
            {BackBtn('#667eea')}
            <h2 style={{color:'#000', fontWeight:'900', marginBottom:'20px', WebkitTextFillColor:'#000'}}>👑 Admin Login</h2>
            <div className="login-form">
              <div className="input-group">
                <label style={{color:'#000', fontWeight:'700'}}>🔑 Admin Unique ID</label>
                <input type="password" placeholder="Enter Admin Unique ID"
                  value={adminUniqueId} onChange={e => setAdminUniqueId(e.target.value)}
                  style={{...inputStyle, borderColor:'#667eea'}} />
              </div>
              <div className="input-group">
                <label style={{color:'#000', fontWeight:'700'}}>Email</label>
                <input type="email" placeholder="Enter email"
                  value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              </div>
              <div className="input-group">
                <label style={{color:'#000', fontWeight:'700'}}>Password</label>
                <input type="password" placeholder="Enter password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin('admin')} style={inputStyle} />
              </div>
              <button onClick={() => handleLogin('admin')} className="login-btn">👑 Sign In as Admin</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── STAFF ───
  if (selectedRole === 'staff') {
    const staffColor = '#c0392b';
    const staffGradient = 'linear-gradient(135deg,#c0392b,#e74c3c)';
    return (
      <div className="login-page">
        <Branding />
        <div className="login-form-section" style={{background: staffGradient}}>
          <div className="login-container" style={{padding:'30px 40px', overflowY:'auto', maxHeight:'100vh'}}>
            {BackBtn('white')}
            <h2 style={{color:'white', fontWeight:'900', marginBottom:'20px'}}>👨‍🍳 Chef / Staff</h2>
            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
              <button onClick={() => setStaffMode('login')}
                style={{flex:1, padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold',
                  background: staffMode === 'login' ? 'white' : 'rgba(255,255,255,0.2)',
                  color: staffMode === 'login' ? staffColor : 'white', border:'2px solid white'}}>
                Login
              </button>
              <button onClick={() => setStaffMode('signup')}
                style={{flex:1, padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold',
                  background: staffMode === 'signup' ? 'white' : 'rgba(255,255,255,0.2)',
                  color: staffMode === 'signup' ? staffColor : 'white', border:'2px solid white'}}>
                Sign Up
              </button>
            </div>
            {staffMode === 'login' ? (
              <div className="login-form">
                <div className="input-group">
                  <label style={{color:'white', fontWeight:'700'}}>Email</label>
                  <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} style={{...inputStyle, borderColor:'rgba(255,255,255,0.5)'}} />
                </div>
                <div className="input-group">
                  <label style={{color:'white', fontWeight:'700'}}>Password</label>
                  <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin('staff')} style={{...inputStyle, borderColor:'rgba(255,255,255,0.5)'}} />
                </div>
                <button onClick={() => handleLogin('staff')} className="login-btn" style={{background:'white', color:staffColor, fontWeight:'900'}}>
                  👨‍🍳 Login as Staff
                </button>
              </div>
            ) : (
              <div className="login-form">
                <div style={{background:'rgba(255,255,255,0.2)', border:'1px solid white', borderRadius:'8px', padding:'12px', marginBottom:'10px', color:'white', fontSize:'14px'}}>
                  ⚠️ Sign up ke baad admin approval zaruri hai
                </div>
                <div className="input-group">
                  <label style={{color:'white', fontWeight:'700'}}>Full Name</label>
                  <input type="text" placeholder="Enter name" value={name} onChange={e => setName(e.target.value)} style={{...inputStyle, borderColor:'rgba(255,255,255,0.5)'}} />
                </div>
                <div className="input-group">
                  <label style={{color:'white', fontWeight:'700'}}>Email</label>
                  <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} style={{...inputStyle, borderColor:'rgba(255,255,255,0.5)'}} />
                </div>
                <div className="input-group">
                  <label style={{color:'white', fontWeight:'700'}}>Password</label>
                  <input type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} style={{...inputStyle, borderColor:'rgba(255,255,255,0.5)'}} />
                </div>
                <button onClick={() => handleSignup('staff')} className="login-btn" style={{background:'white', color:staffColor, fontWeight:'900'}}>
                  📤 Send Request to Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── CUSTOMER ───
  if (selectedRole === 'customer') {
    const custColor = '#0f3460';
    const custGradient = 'linear-gradient(135deg,#0f3460,#533483)';
    return (
      <div className="login-page">
        <Branding />
        <div className="login-form-section" style={{background: custGradient}}>
          <div className="login-container" style={{padding:'30px 40px', overflowY:'auto', maxHeight:'100vh'}}>
            {BackBtn('white')}
            <h2 style={{color:'white', fontWeight:'900', marginBottom:'20px'}}>🍽️ Customer</h2>
            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
              <button onClick={() => setCustomerMode('login')}
                style={{flex:1, padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold',
                  background: customerMode === 'login' ? 'white' : 'rgba(255,255,255,0.2)',
                  color: customerMode === 'login' ? custColor : 'white', border:'2px solid white'}}>
                Login
              </button>
              <button onClick={() => setCustomerMode('signup')}
                style={{flex:1, padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold',
                  background: customerMode === 'signup' ? 'white' : 'rgba(255,255,255,0.2)',
                  color: customerMode === 'signup' ? custColor : 'white', border:'2px solid white'}}>
                Sign Up
              </button>
            </div>
            {customerMode === 'login' ? (
              <div className="login-form">
                <div className="input-group">
                  <label style={{color:'white', fontWeight:'700'}}>Email</label>
                  <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} style={{...inputStyle, borderColor:'rgba(255,255,255,0.5)'}} />
                </div>
                <div className="input-group">
                  <label style={{color:'white', fontWeight:'700'}}>Password</label>
                  <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin('customer')} style={{...inputStyle, borderColor:'rgba(255,255,255,0.5)'}} />
                </div>
                <button onClick={() => handleLogin('customer')} className="login-btn" style={{background:'white', color:custColor, fontWeight:'900'}}>
                  🍽️ Login
                </button>
              </div>
            ) : (
              <div className="login-form">
                <div className="input-group">
                  <label style={{color:'white', fontWeight:'700'}}>Full Name</label>
                  <input type="text" placeholder="Enter name" value={name} onChange={e => setName(e.target.value)} style={{...inputStyle, borderColor:'rgba(255,255,255,0.5)'}} />
                </div>
                <div className="input-group">
                  <label style={{color:'white', fontWeight:'700'}}>Email</label>
                  <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} style={{...inputStyle, borderColor:'rgba(255,255,255,0.5)'}} />
                </div>
                <div className="input-group">
                  <label style={{color:'white', fontWeight:'700'}}>Password</label>
                  <input type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} style={{...inputStyle, borderColor:'rgba(255,255,255,0.5)'}} />
                </div>
                <button onClick={() => handleSignup('customer')} className="login-btn" style={{background:'white', color:custColor, fontWeight:'900'}}>
                  ✅ Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
