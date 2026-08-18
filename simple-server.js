const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*'
  });
  
  res.end(`
    <html>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1>🎉 Mobile Connection Test</h1>
        <p>If you can see this, network access is working!</p>
        <p>Server IP: ${getLocalIP()}</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <a href="http://localhost:3001" style="color: blue;">Go to DineConnect</a>
      </body>
    </html>
  `);
});

function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  // Priority order: Wi-Fi, Ethernet, then others
  const priorityOrder = ['Wi-Fi', 'Ethernet', 'Wireless LAN adapter Wi-Fi'];
  
  // First try priority interfaces
  for (const priority of priorityOrder) {
    if (interfaces[priority]) {
      for (const interface of interfaces[priority]) {
        if (interface.family === 'IPv4' && !interface.internal) {
          return interface.address;
        }
      }
    }
  }
  
  // Fallback to any non-internal IPv4
  for (const name of Object.keys(interfaces)) {
    if (!name.includes('VMware') && !name.includes('VirtualBox')) {
      for (const interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
          return interface.address;
        }
      }
    }
  }
  
  return 'localhost';
}

server.listen(8080, '0.0.0.0', () => {
  console.log('🌐 Test server running on http://0.0.0.0:8080');
  console.log('📱 Mobile test URL: http://' + getLocalIP() + ':8080');
});