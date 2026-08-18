# 🔑 Google Cloud Console - Step by Step Guide

## 🎯 **Bilkul Simple Steps - Follow Karo:**

---

## **STEP 1: Google Cloud Console Open Karo**

### **1.1 Website Pe Jao:**
- **Browser mein type karo:** `https://console.cloud.google.com/`
- **Enter press karo**

### **1.2 Google Account Se Login:**
- **Apna Google account** se sign in karo (jo tumhara main email hai)
- **Allow permissions** if asked

---

## **STEP 2: New Project Banao**

### **2.1 Project Selector Click Karo:**
- **Top mein** "Select a project" dropdown dikhega
- **Click karo** us pe

### **2.2 New Project Create Karo:**
- **"NEW PROJECT"** button click karo
- **Project name:** `DineConnect Restaurant`
- **"CREATE"** button click karo
- **Wait karo** 30 seconds (project create hone ke liye)

---

## **STEP 3: APIs Enable Karo**

### **3.1 APIs & Services Pe Jao:**
- **Left sidebar** mein "APIs & Services" click karo
- **"Library"** click karo

### **3.2 Google+ API Enable Karo:**
- **Search box** mein type karo: `Google+ API`
- **Google+ API** result pe click karo
- **"ENABLE"** button click karo
- **Wait karo** enable hone ke liye

---

## **STEP 4: OAuth Credentials Banao**

### **4.1 Credentials Page Pe Jao:**
- **Left sidebar** mein "Credentials" click karo
- **"+ CREATE CREDENTIALS"** button click karo
- **"OAuth 2.0 Client IDs"** select karo

### **4.2 OAuth Consent Screen Setup (Agar Pehli Baar Hai):**
**Agar ye screen aaye to:**
- **"CONFIGURE CONSENT SCREEN"** click karo
- **"External"** select karo
- **"CREATE"** click karo

**App Information Fill Karo:**
- **App name:** `DineConnect Restaurant System`
- **User support email:** Apna email address
- **Developer contact:** Apna email address
- **"SAVE AND CONTINUE"** click karo
- **"SAVE AND CONTINUE"** (Scopes page skip karo)
- **"SAVE AND CONTINUE"** (Test users skip karo)
- **"BACK TO DASHBOARD"** click karo

### **4.3 OAuth Client ID Banao:**
- **"Credentials"** pe wapas jao
- **"+ CREATE CREDENTIALS"** → "OAuth 2.0 Client IDs"
- **Application type:** "Web application"
- **Name:** `DineConnect Web Client`

### **4.4 Authorized Origins Add Karo:**
**"Authorized JavaScript origins" section mein:**
- **"+ ADD URI"** click karo
- **Type karo:** `http://localhost:3001`
- **"+ ADD URI"** click karo again
- **Type karo:** `http://10.151.242.51:3001`

### **4.5 Create Karo:**
- **"CREATE"** button click karo
- **Popup aayega** with Client ID and Secret

---

## **STEP 5: Client ID Copy Karo**

### **5.1 Client ID Copy Karo:**
**Popup mein dikhega:**
```
Client ID: 123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
Client secret: GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

**Client ID ko copy karo** (puri line)

### **5.2 Popup Close Karo:**
- **"OK"** click karo popup close karne ke liye

---

## **STEP 6: Application Mein Setup Karo**

### **6.1 .env File Banao:**
**Windows File Explorer mein:**
- **Jao:** `restaurant-qr-menu/client/` folder
- **Right click** → "New" → "Text Document"
- **Name:** `.env` (dot se start karo)
- **File open karo** Notepad mein

### **6.2 Client ID Add Karo:**
**Notepad mein type karo:**
```
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```
**(Apna actual Client ID paste karo)**

### **6.3 File Save Karo:**
- **Ctrl+S** press karo
- **File save ho jayegi**

---

## **STEP 7: Application Restart Karo**

### **7.1 Servers Stop Karo:**
**Dono terminals mein:**
- **Ctrl+C** press karo (server stop karne ke liye)

### **7.2 Servers Start Karo:**
**Terminal 1:**
```bash
cd restaurant-qr-menu/server
npm start
```

**Terminal 2:**
```bash
cd restaurant-qr-menu/client
npm start
```

---

## **STEP 8: Test Karo**

### **8.1 Website Open Karo:**
- **Browser mein jao:** `http://10.151.242.51:3001`
- **Login page** pe jao

### **8.2 Real Google Mode Enable Karo:**
- **"🔑 Real Google"** toggle click karo
- **"Continue with Google"** button click karo
- **Apna real Google account** select karo

### **8.3 Success Check Karo:**
- **Google popup** khulna chahiye
- **Apne Google accounts** dikhne chahiye
- **Login successful** hona chahiye

---

## 🎯 **Visual Guide - Kya Dikhega:**

### **Google Cloud Console Dashboard:**
```
┌─────────────────────────────────────┐
│ Google Cloud Console                │
│ ┌─────────────────────────────────┐ │
│ │ Select a project ▼              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ☰ APIs & Services                   │
│   ├── Library                       │
│   ├── Credentials                   │
│   └── OAuth consent screen          │
└─────────────────────────────────────┘
```

### **Credentials Page:**
```
┌─────────────────────────────────────┐
│ + CREATE CREDENTIALS                │
│ ├── API key                         │
│ ├── OAuth 2.0 Client IDs ← YE      │
│ └── Service account                 │
└─────────────────────────────────────┘
```

### **OAuth Setup Form:**
```
┌─────────────────────────────────────┐
│ Application type: Web application   │
│ Name: DineConnect Web Client        │
│                                     │
│ Authorized JavaScript origins:      │
│ + ADD URI                           │
│ http://localhost:3001               │
│ http://10.151.242.51:3001          │
│                                     │
│ [CREATE]                            │
└─────────────────────────────────────┘
```

---

## 🚨 **Common Problems & Solutions:**

### **Problem 1: "Project not found"**
**Solution:** Make sure project is selected in top dropdown

### **Problem 2: "APIs not enabled"**
**Solution:** Go to APIs & Services → Library → Enable Google+ API

### **Problem 3: ".env file not working"**
**Solution:** 
- File name should be exactly `.env` (with dot)
- Save in `client/` folder, not root
- Restart both servers after creating

### **Problem 4: "Origin not allowed"**
**Solution:** Add both URLs in Authorized Origins:
- `http://localhost:3001`
- `http://10.151.242.51:3001`

---

## ✅ **Success Checklist:**

### **✅ Google Cloud Console:**
- [ ] Project created: "DineConnect Restaurant"
- [ ] Google+ API enabled
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized origins added
- [ ] Client ID copied

### **✅ Application Setup:**
- [ ] `.env` file created in `client/` folder
- [ ] Client ID added to `.env` file
- [ ] Both servers restarted
- [ ] Real Google mode working

---

## 🎉 **Final Test:**

### **Expected Result:**
1. **Toggle to "🔑 Real Google"** mode
2. **Click "Continue with Google"**
3. **Real Google popup** opens
4. **Your Google accounts** appear
5. **Select account** and login successful
6. **Dashboard opens** with your real profile

**Agar ye sab kaam kar raha hai, to setup successful hai!** ✅

---

## 📞 **Need Help?**

**Agar koi step confusing hai to:**
1. **Screenshot le kar** batao kahan stuck ho
2. **Error message** copy kar ke batao
3. **Console logs** check kar ke batao

**Main step-by-step help karunga!** 🤝

**Ab follow karo ye steps aur apne real Google account se login karo!** 🔑✨