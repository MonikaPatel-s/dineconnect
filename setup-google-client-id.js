const fs = require('fs');
const path = require('path');

console.log('🔑 Google Client ID Setup Script');
console.log('================================');

// Get Client ID from command line argument
const clientId = process.argv[2];

if (!clientId) {
    console.log('❌ Please provide your Google Client ID as an argument');
    console.log('');
    console.log('Usage:');
    console.log('node setup-google-client-id.js "YOUR_CLIENT_ID_HERE"');
    console.log('');
    console.log('Example:');
    console.log('node setup-google-client-id.js "123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"');
    process.exit(1);
}

// Path to .env file
const envPath = path.join(__dirname, 'client', '.env');

// Create .env content
const envContent = `# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=${clientId}

# Generated on: ${new Date().toISOString()}
# This file contains your Google OAuth Client ID for real Google login
`;

try {
    // Write .env file
    fs.writeFileSync(envPath, envContent);

    console.log('✅ Google Client ID configured successfully!');
    console.log('');
    console.log('📁 File created: client/.env');
    console.log('🔑 Client ID:', clientId);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Restart both servers (Ctrl+C then npm start)');
    console.log('2. Go to login page');
    console.log('3. Toggle to "🔑 Real Google" mode');
    console.log('4. Test with your real Google account!');
    console.log('');
    console.log('🎯 Ready to use real Google login!');

} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    process.exit(1);
}