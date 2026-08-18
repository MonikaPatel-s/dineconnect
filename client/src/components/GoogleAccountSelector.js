import { useState } from 'react';
import './GoogleAccountSelector.css';

const GoogleAccountSelector = ({ isOpen, onClose, onSelectAccount }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Demo Google accounts
  const googleAccounts = [
    {
      id: 'google_001',
      name: 'Pranav',
      email: 'pranav@gmail.com',
      picture: null, // Will use CSS avatar
      backgroundColor: '#4285f4',
      role: 'customer'
    },
    {
      id: 'google_002', 
      name: 'Lucky',
      email: 'lucky@gmail.com',
      picture: null, // Will use CSS avatar
      backgroundColor: '#34a853',
      role: 'customer'
    },
    {
      id: 'google_003',
      name: 'Monika',
      email: 'monika@gmail.com',
      picture: null, // Will use CSS avatar
      backgroundColor: '#ea4335',
      role: 'customer'
    }
  ];

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    console.log('🔍 Selected Google account:', account.email);
    
    // Simulate Google login process
    setTimeout(() => {
      onSelectAccount({
        email: account.email,
        name: account.name,
        picture: account.picture,
        googleId: account.id,
        role: account.role
      });
      onClose();
      setSelectedAccount(null);
    }, 800);
  };

  const handleAddAccount = () => {
    // Simulate adding new account
    const newAccount = {
      id: 'google_new_' + Date.now(),
      name: 'New User',
      email: 'newuser@gmail.com',
      picture: 'https://via.placeholder.com/150/4285f4/ffffff?text=NU',
      role: 'customer'
    };
    
    console.log('➕ Adding new Google account');
    setTimeout(() => {
      onSelectAccount(newAccount);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="google-popup-overlay" onClick={onClose}>
      <div className="google-popup-container" onClick={(e) => e.stopPropagation()}>
        {/* Google Header */}
        <div className="google-popup-header">
          <div className="google-logo">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google</span>
          </div>
          <button className="google-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Title */}
        <div className="google-popup-title">
          <h2>Choose an account</h2>
          <p>to continue to DineConnect</p>
        </div>

        {/* Account List */}
        <div className="google-accounts-list">
          {googleAccounts.map((account) => (
            <div 
              key={account.id}
              className={`google-account-item ${selectedAccount?.id === account.id ? 'selected' : ''}`}
              onClick={() => handleAccountSelect(account)}
            >
              {account.picture ? (
                <img 
                  src={account.picture} 
                  alt={account.name}
                  className="google-account-avatar"
                />
              ) : (
                <div 
                  className="google-account-avatar css-avatar"
                  style={{ backgroundColor: account.backgroundColor }}
                >
                  {account.name}
                </div>
              )}
              <div className="google-account-info">
                <div className="google-account-name">{account.name}</div>
                <div className="google-account-email">{account.email}</div>
              </div>
              {selectedAccount?.id === account.id && (
                <div className="google-loading-spinner"></div>
              )}
            </div>
          ))}
          
          {/* Add Account Option */}
          <div className="google-account-item add-account" onClick={handleAddAccount}>
            <div className="google-add-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#5f6368">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <div className="google-account-info">
              <div className="google-account-name">Use another account</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="google-popup-footer">
          <div className="google-footer-links">
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            <span>•</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          </div>
        </div>


      </div>
    </div>
  );
};

export default GoogleAccountSelector;