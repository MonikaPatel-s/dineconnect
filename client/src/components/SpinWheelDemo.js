import React, { useState } from 'react';
import SpinWheel from './SpinWheel';
import './SpinWheel.css';

const SpinWheelDemo = () => {
  const [showWheel, setShowWheel] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' or 'multiple'
  const [winHistory, setWinHistory] = useState([]);

  const handleWin = (prize, spinCount) => {
    setWinHistory(prev => [...prev, { 
      prize, 
      spinCount, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎡 Spin Wheel Demo & Testing</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>🎮 Choose Mode:</h3>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <button 
            onClick={() => setMode('single')}
            style={{
              padding: '10px 20px',
              backgroundColor: mode === 'single' ? '#007bff' : '#f8f9fa',
              color: mode === 'single' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🎯 Single Spin Mode
          </button>
          <button 
            onClick={() => setMode('multiple')}
            style={{
              padding: '10px 20px',
              backgroundColor: mode === 'multiple' ? '#007bff' : '#f8f9fa',
              color: mode === 'multiple' ? 'white' : '#333',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🔄 Multiple Spins Mode
          </button>
        </div>

        <button 
          onClick={() => setShowWheel(true)}
          style={{
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
          }}
        >
          🎡 Open Spin Wheel ({mode === 'single' ? 'One Spin' : 'Unlimited Spins'})
        </button>
      </div>

      {/* Mode Descriptions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          padding: '20px', 
          border: '2px solid #e9ecef', 
          borderRadius: '10px',
          backgroundColor: mode === 'single' ? '#e3f2fd' : '#f8f9fa'
        }}>
          <h4>🎯 Single Spin Mode</h4>
          <ul>
            <li>✅ One spin per session</li>
            <li>✅ Prevents abuse</li>
            <li>✅ Fair for all customers</li>
            <li>✅ Business-friendly</li>
            <li>✅ Recommended for production</li>
          </ul>
        </div>
        
        <div style={{ 
          padding: '20px', 
          border: '2px solid #e9ecef', 
          borderRadius: '10px',
          backgroundColor: mode === 'multiple' ? '#e8f5e8' : '#f8f9fa'
        }}>
          <h4>🔄 Multiple Spins Mode</h4>
          <ul>
            <li>🎮 Unlimited spins</li>
            <li>🎯 Great for demos</li>
            <li>🎪 Fun for events</li>
            <li>🧪 Perfect for testing</li>
            <li>⚠️ Use carefully in production</li>
          </ul>
        </div>
      </div>

      {/* Win History */}
      {winHistory.length > 0 && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3>🏆 Win History</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {winHistory.map((win, index) => (
              <div key={index} style={{ 
                padding: '10px', 
                margin: '5px 0', 
                backgroundColor: 'white', 
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>
                  <strong>{win.prize.text}</strong> 
                  {win.prize.discount && ` (${win.prize.discount}% OFF)`}
                  {win.prize.special && ` (${win.prize.special.replace('_', ' ').toUpperCase()})`}
                </span>
                <small style={{ color: '#666' }}>
                  Spin #{win.spinCount} at {win.timestamp}
                </small>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setWinHistory([])}
            style={{
              marginTop: '10px',
              padding: '5px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🗑️ Clear History
          </button>
        </div>
      )}

      {/* Configuration Guide */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7',
        borderRadius: '10px'
      }}>
        <h3>⚙️ Configuration Guide</h3>
        <p><strong>To enable multiple spins in your app:</strong></p>
        <pre style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          overflow: 'auto'
        }}>
{`// In MenuByTable.js or CustomerDashboard.js
<SpinWheel
  onClose={() => setShowSpinWheel(false)}
  onWin={handleSpinWin}
  allowMultipleSpins={true}  // Change this to true
  resetKey={tableSlug}
/>`}
        </pre>
        
        <p><strong>Recommended Settings:</strong></p>
        <ul>
          <li>🏪 <strong>Production:</strong> <code>allowMultipleSpins={false}</code></li>
          <li>🧪 <strong>Testing:</strong> <code>allowMultipleSpins={true}</code></li>
          <li>🎪 <strong>Events:</strong> <code>allowMultipleSpins={true}</code></li>
          <li>🎮 <strong>Demo:</strong> <code>allowMultipleSpins={true}</code></li>
        </ul>
      </div>

      {/* Spin Wheel Modal */}
      {showWheel && (
        <SpinWheel
          onClose={() => setShowWheel(false)}
          onWin={handleWin}
          allowMultipleSpins={mode === 'multiple'}
          resetKey={mode}
        />
      )}
    </div>
  );
};

export default SpinWheelDemo;