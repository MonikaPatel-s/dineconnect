# 🌐 Network Change Guide

## When Switching to Different WiFi Network:

### Step 1: Find New IP Address
```cmd
ipconfig | findstr "IPv4"
```

### Step 2: Update Server CORS (Only Required Change)
Edit `server/server.js`:

```javascript
// Replace old IP with new IP
const corsOptions = {
  origin: ["http://localhost:3001", "http://localhost:3000", "http://NEW_IP_ADDRESS:3001"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Also update Socket.IO CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:3000", "http://NEW_IP_ADDRESS:3001"],
    methods: ["GET", "POST"]
  }
});
```

### Step 3: Restart Servers
```bash
# Stop and restart both servers
npm run dev (in server folder)
npm start (in client folder)
```

## ✅ Everything Else is Automatic!
- API URLs: Auto-detect current hostname
- QR Codes: Use current network IP  
- Mobile Access: Works on any network

## 📱 Access URLs:
- **Computer:** http://localhost:3001
- **Mobile:** http://YOUR_NEW_IP:3001
- **QR Codes:** Automatically use correct IP

## 🎯 No More Manual IP Updates Needed!
The project is now network-agnostic and will work on any WiFi network with just the CORS update!