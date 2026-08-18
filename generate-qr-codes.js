const QRCode = require('qrcode');
const fs = require('fs');

// Sample table URLs for testing
const tableUrls = [
  'http://localhost:3001/m/table-1-1762347240202-dmaxjq17s',
  'http://localhost:3001/m/table-2-1762347240202-shtghv2qc',
  'http://localhost:3001/m/table-3-1762347240202-arenv4oe8',
  'http://localhost:3001/m/table-4-1762347240202-8pj68v365',
  'http://localhost:3001/m/table-5-1762347240202-d4r12fr4f'
];

const generateQRCodes = async () => {
  console.log('🎯 Generating QR Codes for Tables...\n');
  
  for (let i = 0; i < tableUrls.length; i++) {
    const url = tableUrls[i];
    const tableNumber = i + 1;
    
    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Convert data URL to buffer and save as PNG
      const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const filename = `table-${tableNumber}-qr.png`;
      fs.writeFileSync(filename, buffer);
      
      console.log(`✅ Table ${tableNumber} QR Code: ${filename}`);
      console.log(`   URL: ${url}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error generating QR for Table ${tableNumber}:`, error);
    }
  }
  
  console.log('🎉 QR Codes generated successfully!');
  console.log('📱 You can now scan these QR codes to test the menu system.');
};

generateQRCodes();