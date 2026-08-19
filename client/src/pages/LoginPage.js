import { useState } from "react";
import config from "../config";
import "../App.css";
import "../components/GoogleLogin.css";

export default function LoginPage({ setUser }) {
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
            window.location.href = `/m/${pendingTable}`;
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

  const Branding = () => (
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
      </div>
    </div>
  );

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
    return (
      <div className="login-page">
        <Branding />
        <div className="login-form-section" style={{background:'white'}}>
          <div className="login-container" style={{padding:'30px 40px', overflowY:'auto', maxHeight:'100vh'}}>
            {BackBtn('#f39c12')}
            <h2 style={{color:'#000', fontWeight:'900', marginBottom:'20px', WebkitTextFillColor:'#000'}}>👨‍🍳 Chef / Staff</h2>
            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
              <button onClick={() => setStaffMode('login')}
                style={{flex:1, padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold',
                  background: staffMode === 'login' ? '#f39c12' : '#f5f5f5',
                  color: staffMode === 'login' ? 'white' : '#333', border:'2px solid #f39c12'}}>
                Login
              </button>
              <button onClick={() => setStaffMode('signup')}
                style={{flex:1, padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold',
                  background: staffMode === 'signup' ? '#f39c12' : '#f5f5f5',
                  color: staffMode === 'signup' ? 'white' : '#333', border:'2px solid #f39c12'}}>
                Sign Up
              </button>
            </div>
            {staffMode === 'login' ? (
              <div className="login-form">
                <div className="input-group">
                  <label style={{color:'#000', fontWeight:'700'}}>Email</label>
                  <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div className="input-group">
                  <label style={{color:'#000', fontWeight:'700'}}>Password</label>
                  <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin('staff')} style={inputStyle} />
                </div>
                <button onClick={() => handleLogin('staff')} className="login-btn" style={{background:'linear-gradient(135deg,#f39c12,#e67e22)'}}>
                  👨‍🍳 Login as Staff
                </button>
              </div>
            ) : (
              <div className="login-form">
                <div style={{background:'#fff3cd', border:'1px solid #f39c12', borderRadius:'8px', padding:'12px', marginBottom:'10px', color:'#856404', fontSize:'14px'}}>
                  ⚠️ Sign up ke baad admin approval zaruri hai
                </div>
                <div className="input-group">
                  <label style={{color:'#000', fontWeight:'700'}}>Full Name</label>
                  <input type="text" placeholder="Enter name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                </div>
                <div className="input-group">
                  <label style={{color:'#000', fontWeight:'700'}}>Email</label>
                  <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div className="input-group">
                  <label style={{color:'#000', fontWeight:'700'}}>Password</label>
                  <input type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                </div>
                <button onClick={() => handleSignup('staff')} className="login-btn" style={{background:'linear-gradient(135deg,#f39c12,#e67e22)'}}>
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
    return (
      <div className="login-page">
        <Branding />
        <div className="login-form-section" style={{background:'white'}}>
          <div className="login-container" style={{padding:'30px 40px', overflowY:'auto', maxHeight:'100vh'}}>
            {BackBtn('#27ae60')}
            <h2 style={{color:'#000', fontWeight:'900', marginBottom:'20px', WebkitTextFillColor:'#000'}}>🍽️ Customer</h2>
            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
              <button onClick={() => setCustomerMode('login')}
                style={{flex:1, padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold',
                  background: customerMode === 'login' ? '#27ae60' : '#f5f5f5',
                  color: customerMode === 'login' ? 'white' : '#333', border:'2px solid #27ae60'}}>
                Login
              </button>
              <button onClick={() => setCustomerMode('signup')}
                style={{flex:1, padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold',
                  background: customerMode === 'signup' ? '#27ae60' : '#f5f5f5',
                  color: customerMode === 'signup' ? 'white' : '#333', border:'2px solid #27ae60'}}>
                Sign Up
              </button>
            </div>
            {customerMode === 'login' ? (
              <div className="login-form">
                <div className="input-group">
                  <label style={{color:'#000', fontWeight:'700'}}>Email</label>
                  <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div className="input-group">
                  <label style={{color:'#000', fontWeight:'700'}}>Password</label>
                  <input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin('customer')} style={inputStyle} />
                </div>
                <button onClick={() => handleLogin('customer')} className="login-btn" style={{background:'linear-gradient(135deg,#27ae60,#2ecc71)'}}>
                  🍽️ Login
                </button>
              </div>
            ) : (
              <div className="login-form">
                <div className="input-group">
                  <label style={{color:'#000', fontWeight:'700'}}>Full Name</label>
                  <input type="text" placeholder="Enter name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                </div>
                <div className="input-group">
                  <label style={{color:'#000', fontWeight:'700'}}>Email</label>
                  <input type="email" placeholder="Enter email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div className="input-group">
                  <label style={{color:'#000', fontWeight:'700'}}>Password</label>
                  <input type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                </div>
                <button onClick={() => handleSignup('customer')} className="login-btn" style={{background:'linear-gradient(135deg,#27ae60,#2ecc71)'}}>
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
