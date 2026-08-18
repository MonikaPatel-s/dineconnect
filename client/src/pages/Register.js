import { useState } from "react";
import config from "../config";
import HybridGoogleLogin from "../components/HybridGoogleLogin";
import "../App.css";
import "../components/GoogleLogin.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (userData) => {
    try {
      console.log('🔍 Processing Google signup:', userData);
      
      // Send Google user data to our backend for registration
      const res = await fetch(`${config.API_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          googleId: userData.googleId,
          role: role // Use selected role from dropdown
        }),
      });
      
      const data = await res.json();
      
      if (data.token) {
        alert("Google Registration Successful! 🎉 You are now logged in.");
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } else {
        alert(data.message || 'Google registration failed');
      }
    } catch (err) {
      console.error("Google registration error:", err);
      alert("Google Registration Error ❌");
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google registration error:', error);
    alert('Google registration failed. Please try again.');
  };

  const handleRegister = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields ⚠️");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match ❌");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters ⚠️");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      if (data.user) {
        alert("Registration Successful! 🎉 You can now login.");
        window.location.href = "/login";
      } else {
        alert(data.message || "Registration Failed ❌");
      }
    } catch (err) {
      alert("Server Error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="brand-logo">
            <span className="logo-icon">🚀</span>
          </div>
          <h1 className="brand-title">DineConnect</h1>
          <p className="brand-subtitle">Join the Future of Dining</p>
          <div className="brand-description">
            <p>Create your account and become part of the digital dining revolution.</p>
          </div>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">🚀</span>
              <span className="feature-text">Quick Setup</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span className="feature-text">Secure Account</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Personalized</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Instant Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="login-form-section">
        <div className="login-container">
          <div className="login-header">
            <h2>Create Account</h2>
            <p>Join DineConnect and start your culinary journey</p>
          </div>

          <div className="login-form">
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="login-input"
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="login-input"
              />
            </div>

            <div className="input-group">
              <label>Account Type</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="login-input"
              >
                <option value="customer">🍽️ Customer</option>
                <option value="staff">👨‍🍳 Staff</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>

            <button 
              onClick={handleRegister} 
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            <div className="social-login-section">
              <div className="social-login-title">Sign up with Google</div>
              <HybridGoogleLogin 
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
              />
            </div>
            
            <div className="login-footer">
              <p>Already have an account?</p>
              <a 
                href="/login"
                className="register-link"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}