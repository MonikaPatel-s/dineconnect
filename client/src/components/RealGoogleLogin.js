import { useEffect, useState } from 'react';

const RealGoogleLogin = ({ onSuccess, onError }) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Your real Google Client ID (replace with actual one from Google Cloud Console)
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_REAL_GOOGLE_CLIENT_ID_HERE';

  useEffect(() => {
    console.log('🔍 Loading real Google Identity Services...');
    
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      console.log('✅ Google script loaded successfully');
      
      setTimeout(() => {
        if (window.google && GOOGLE_CLIENT_ID !== 'YOUR_REAL_GOOGLE_CLIENT_ID_HERE') {
          console.log('✅ Initializing real Google login...');
          
          try {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
            });

            const buttonElement = document.getElementById('real-google-signin-button');
            if (buttonElement) {
              window.google.accounts.id.renderButton(buttonElement, {
                theme: 'outline',
                size: 'large',
                width: '100%',
                text: 'signin_with',
                shape: 'rectangular',
                logo_alignment: 'left'
              });
              console.log('✅ Real Google button rendered');
              setIsGoogleLoaded(true);
            }
          } catch (error) {
            console.error('❌ Error initializing real Google:', error);
            setShowFallback(true);
          }
        } else {
          console.log('⚠️ Real Google Client ID not configured, showing setup instructions');
          setShowFallback(true);
        }
      }, 1000);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Google script');
      setShowFallback(true);
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [GOOGLE_CLIENT_ID]);

  const handleCredentialResponse = async (response) => {
    try {
      console.log('🎉 Real Google credential received!');
      
      // Decode the JWT token to get user info
      const userInfo = parseJwt(response.credential);
      
      console.log('🔍 Real Google user info:', userInfo);
      
      // Create user object for our app
      const userData = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        googleId: userInfo.sub,
        role: 'customer' // Default role for real Google users
      };

      console.log('🔍 Sending real user data to backend:', userData.email);

      // Call success callback
      if (onSuccess) {
        onSuccess(userData);
      }
    } catch (error) {
      console.error('❌ Real Google Login Error:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  // Helper function to decode JWT token
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  if (showFallback) {
    return (
      <div className="google-setup-instructions">
        <div className="setup-card">
          <h3>🔑 Real Google Login Setup Required</h3>
          <p>To use your real Google accounts, follow these steps:</p>
          
          <div className="setup-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div>
                <strong>Google Cloud Console:</strong>
                <br />Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">console.cloud.google.com</a>
              </div>
            </div>
            
            <div className="step">
              <span className="step-number">2</span>
              <div>
                <strong>Create OAuth Credentials:</strong>
                <br />APIs & Services → Credentials → Create OAuth 2.0 Client ID
              </div>
            </div>
            
            <div className="step">
              <span className="step-number">3</span>
              <div>
                <strong>Add Authorized Origins:</strong>
                <br />Add: <code>http://localhost:3001</code>
              </div>
            </div>
            
            <div className="step">
              <span className="step-number">4</span>
              <div>
                <strong>Set Environment Variable:</strong>
                <br />Create <code>.env</code> file with:
                <br /><code>REACT_APP_GOOGLE_CLIENT_ID=your_client_id</code>
              </div>
            </div>
          </div>
          
          <div className="setup-note">
            <strong>📝 Note:</strong> Once configured, restart the application to use real Google accounts.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="real-google-login-container">
      <div id="real-google-signin-button" style={{ display: isGoogleLoaded ? 'block' : 'none' }}></div>
      
      {!isGoogleLoaded && (
        <div className="google-loading">
          <div className="loading-spinner"></div>
          <span>Loading Google Login...</span>
        </div>
      )}
    </div>
  );
};

export default RealGoogleLogin;