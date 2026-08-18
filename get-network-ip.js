const os = require('os');

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        // Prefer WiFi interfaces
        if (name.toLowerCase().includes('wi-fi') || 
            name.toLowerCase().includes('wireless') ||
            name.toLowerCase().includes('wlan')) {
          return interface.address;
        }
      }
    }
  }
  
  // Fallback to any non-internal IPv4
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

console.log('Current Network IP:', getNetworkIP());
module.exports = getNetworkIP;