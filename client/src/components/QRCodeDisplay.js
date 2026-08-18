import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const QRCodeDisplay = ({ value, size = 150 }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    if (value) {
      generateQR();
    }
  }, [value, size]);

  if (loading) {
    return (
      <div className="qr-loading" style={{ width: size, height: size }}>
        <div className="qr-spinner"></div>
        <p>Generating QR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="qr-error" style={{ width: size, height: size }}>
        <div className="qr-icon">❌</div>
        <p>QR Error</p>
        <small>{error}</small>
      </div>
    );
  }

  return (
    <div className="qr-code-display">
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        style={{ 
          width: size, 
          height: size,
          borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
};

export default QRCodeDisplay;