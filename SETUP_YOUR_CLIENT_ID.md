# 🔑 Setup Your Google Client ID

## 🎯 **Ab Sirf Ye 3 Steps Karne Hain:**

---

## **STEP 1: Client ID Add Karo**

### **Option A: Automatic Setup (Recommended)**
**Terminal mein ye command run karo:**
```bash
cd restaurant-qr-menu
node setup-google-client-id.js "YOUR_CLIENT_ID_HERE"
```

**Example:**
```bash
node setup-google-client-id.js "123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
```

### **Option B: Manual Setup**
**Agar automatic nahi chala to:**
1. **Open:** `restaurant-qr-menu/client/.env` file
2. **Replace:** `YOUR_CLIENT_ID_HERE` with your actual Client ID
3. **Save:** File

---

## **STEP 2: Servers Restart Karo**

### **2.1 Stop Current Servers:**
**Dono terminals mein:**
- **Press:** `Ctrl+C` (servers stop ho jayenge)

### **2.2 Start Servers Again:**
**Terminal 1 (Backend):**
```bash
cd restaurant-qr-menu/server
npm start
```

**Terminal 2 (Frontend):**
```bash
cd restaurant-qr-menu/client
npm start
```

---

## **STEP 3: Test Real Google Login**

### **3.1 Open Website:**
- **Go to:** `http://10.151.242.51:3001`
- **Click:** Login page

### **3.2 Enable Real Google Mode:**
- **Toggle buttons** dikhenge: `[🎭 Demo Mode] [🔑 Real Google]`
- **Click:** "🔑 Real Google" button

### **3.3 Test Login:**
- **Click:** "Continue with Google"
- **Real Google popup** khulega
- **Select:** Apna Google account
- **Login:** Successfully!

---

## ✅ **Success Check:**

### **Expected Results:**
1. **Toggle buttons** show ho rahe hain
2. **"🔑 Real Google"** mode select kar sakte ho
3. **Real Google popup** opens
4. **Your Google accounts** appear in popup
5. **Login successful** with real profile picture

### **Console Logs:**
```
🔍 Real Google user info: {your actual data}
🔍 Sending real user data to backend: your@gmail.com
✅ Google login successful!
```

---

## 🚨 **Troubleshooting:**

### **Problem 1: "Setup instructions showing"**
**Solution:** Client ID properly add nahi hui
- Check `.env` file mein Client ID correct hai
- Restart servers

### **Problem 2: "Origin not allowed"**
**Solution:** Google Cloud Console mein origins add karo:
- `http://localhost:3001`
- `http://10.151.242.51:3001`

### **Problem 3: Toggle buttons nahi dikh rahe**
**Solution:** 
- Page refresh karo
- Check console for errors
- Restart servers

---

## 🎉 **Ready Commands:**

### **Quick Setup:**
```bash
# 1. Add Client ID (replace with yours)
cd restaurant-qr-menu
node setup-google-client-id.js "YOUR_CLIENT_ID_HERE"

# 2. Restart servers
# Stop current servers (Ctrl+C)
cd server && npm start &
cd client && npm start &

# 3. Test at http://10.151.242.51:3001
```

---

## 🎯 **Final Result:**

**After setup, you'll have:**
- ✅ **Demo Mode** - Realistic simulation (no setup needed)
- ✅ **Real Google Mode** - Your actual Google accounts
- ✅ **Easy Toggle** - Switch between modes
- ✅ **Real Authentication** - Production-ready login

**Ab tumhare paas dono options hain - demo testing ke liye aur real Google login ke liye!** 🔑✨