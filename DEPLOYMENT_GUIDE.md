# 🚀 DineConnect - Deployment Guide

## 🌐 **Free Hosting Options**

### **Option 1: Vercel + MongoDB Atlas (Recommended)**
- **Frontend**: Vercel (Free)
- **Backend**: Vercel (Free)
- **Database**: MongoDB Atlas (Free)

### **Option 2: Netlify + Render**
- **Frontend**: Netlify (Free)
- **Backend**: Render (Free)
- **Database**: MongoDB Atlas (Free)

### **Option 3: Railway (All-in-One)**
- **Full Stack**: Railway (Free tier)
- **Database**: Built-in PostgreSQL or MongoDB Atlas

---

## 🎯 **Method 1: Vercel Deployment (Easiest)**

### **Step 1: Prepare for Deployment**

#### **Update API URLs for Production**
Create production config files:

**client/src/config.js:**
```javascript
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5001/api'
  },
  production: {
    API_BASE_URL: 'https://your-backend-url.vercel.app/api'
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

#### **Update API Service**
```javascript
// client/src/services/api.js
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;
// Rest of your API code...
```

### **Step 2: Deploy Backend to Vercel**

#### **Create vercel.json in server directory:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### **Deploy Backend:**
1. **Install Vercel CLI**: `npm i -g vercel`
2. **Navigate to server**: `cd server`
3. **Deploy**: `vercel --prod`
4. **Set Environment Variables** in Vercel dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your JWT secret
   - `PORT`: 5001

### **Step 3: Deploy Frontend to Vercel**

#### **Update API URL in client/src/config.js:**
```javascript
production: {
  API_BASE_URL: 'https://your-backend-url.vercel.app/api'
}
```

#### **Deploy Frontend:**
1. **Navigate to client**: `cd client`
2. **Build**: `npm run build`
3. **Deploy**: `vercel --prod`

---

## 🎯 **Method 2: Quick Deploy with Railway**

### **Step 1: Prepare Project**

#### **Create railway.json in root:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### **Update package.json in root:**
```json
{
  "name": "dineconnect-restaurant-system",
  "version": "1.0.0",
  "scripts": {
    "start": "cd server && npm start",
    "build": "cd client && npm run build",
    "install-server": "cd server && npm install",
    "install-client": "cd client && npm install",
    "install-all": "npm run install-server && npm run install-client"
  }
}
```

### **Step 2: Deploy to Railway**
1. **Visit**: https://railway.app
2. **Login** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select** your repository
5. **Add Environment Variables**:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT=5001`

---

## 🎯 **Method 3: Netlify + Render**

### **Frontend on Netlify:**
1. **Visit**: https://netlify.com
2. **Drag & Drop** your `client/build` folder
3. **Or connect** GitHub repository

### **Backend on Render:**
1. **Visit**: https://render.com
2. **New Web Service**
3. **Connect** GitHub repository
4. **Build Command**: `cd server && npm install`
5. **Start Command**: `cd server && npm start`

---

## 🗄️ **Database Setup - MongoDB Atlas**

### **Step 1: Create MongoDB Atlas Account**
1. **Visit**: https://www.mongodb.com/atlas
2. **Sign up** for free
3. **Create** new cluster (free tier)

### **Step 2: Setup Database**
1. **Database Access** → **Add Database User**
2. **Network Access** → **Add IP Address** (0.0.0.0/0 for all)
3. **Connect** → **Get connection string**

### **Step 3: Update Connection String**
```
mongodb+srv://username:password@cluster.mongodb.net/dineconnect?retryWrites=true&w=majority
```

---

## 🔧 **Production Environment Variables**

### **Required Environment Variables:**
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dineconnect

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Server
PORT=5001
NODE_ENV=production

# Optional
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

---

## 📦 **Build Scripts for Production**

### **Update server/package.json:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'Server build complete'",
    "seed": "node seedData.js"
  }
}
```

### **Update client/package.json:**
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

---

## 🌐 **CORS Configuration for Production**

### **Update server/server.js:**
```javascript
const cors = require("cors");

// CORS configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## 🚀 **Automated Deployment Script**

### **Create deploy.js in root:**
```javascript
const { execSync } = require('child_process');

console.log('🚀 Starting deployment...');

// Build client
console.log('📦 Building client...');
execSync('cd client && npm run build', { stdio: 'inherit' });

// Deploy to Vercel
console.log('🌐 Deploying to Vercel...');
execSync('vercel --prod', { stdio: 'inherit' });

console.log('✅ Deployment complete!');
```

### **Run deployment:**
```bash
node deploy.js
```

---

## 🔍 **Testing Production Deployment**

### **Health Check Endpoints:**
```javascript
// Add to server.js
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'DineConnect API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});
```

### **Test URLs:**
- **Backend Health**: `https://your-backend.vercel.app/api/health`
- **Frontend**: `https://your-frontend.vercel.app`

---

## 📱 **Mobile PWA Configuration**

### **Add to client/public/manifest.json:**
```json
{
  "short_name": "DineConnect",
  "name": "DineConnect Restaurant System",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#667eea",
  "background_color": "#ffffff"
}
```

---

## 🎯 **Quick Deployment Commands**

### **One-Click Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd server
vercel --prod

# Deploy frontend
cd ../client
npm run build
vercel --prod
```

### **Environment Setup:**
```bash
# Set environment variables
vercel env add MONGO_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV
```

---

## 🌟 **Post-Deployment Checklist**

### **✅ Verify Deployment:**
- [ ] Backend API responding
- [ ] Frontend loading correctly
- [ ] Database connection working
- [ ] Authentication working
- [ ] All features functional

### **✅ Performance:**
- [ ] Fast loading times
- [ ] Mobile responsive
- [ ] Error handling working
- [ ] HTTPS enabled

### **✅ SEO & PWA:**
- [ ] Meta tags added
- [ ] Favicon configured
- [ ] PWA manifest
- [ ] Service worker (optional)

---

## 🎉 **Your Live URLs**

After deployment, you'll have:

### **Production URLs:**
- **Frontend**: `https://dineconnect-frontend.vercel.app`
- **Backend**: `https://dineconnect-backend.vercel.app`
- **API Health**: `https://dineconnect-backend.vercel.app/api/health`

### **Demo Credentials:**
- **Admin**: admin@restaurant.com / admin123
- **Staff**: staff@restaurant.com / staff123
- **Customer**: test@example.com / 123456

---

**Your DineConnect project is now live on the internet! 🌐**

**Perfect for college presentations and portfolio! 🎓✨**

**Share the live URL with anyone - no installation required! 🚀**