# 💻 VS Code Setup Guide for DineConnect

## 🔧 **Prerequisites (Must Install)**

### **1. Node.js (Required)**
- **Download**: https://nodejs.org/
- **Version**: v14 or higher (Latest LTS recommended)
- **Check Installation**: Open terminal and run:
  ```bash
  node --version
  npm --version
  ```

### **2. MongoDB (Required)**
Choose one option:

#### **Option A: MongoDB Community Server (Local)**
- **Download**: https://www.mongodb.com/try/download/community
- **Install**: Follow installation wizard
- **Start**: MongoDB should auto-start after installation

#### **Option B: MongoDB Atlas (Cloud - Easier)**
- **Sign up**: https://www.mongodb.com/atlas
- **Create free cluster**
- **Get connection string**
- **Update .env file** with Atlas connection string

### **3. Git (Optional but Recommended)**
- **Download**: https://git-scm.com/
- **For version control and project management**

---

## 🚀 **VS Code Setup Steps**

### **Step 1: Install VS Code**
- **Download**: https://code.visualstudio.com/
- **Install**: Follow installation wizard

### **Step 2: Install Recommended Extensions**
Open VS Code → Extensions (Ctrl+Shift+X) → Install these:

#### **Essential Extensions:**
1. **ES7+ React/Redux/React-Native snippets** - For React development
2. **Prettier - Code formatter** - Auto code formatting
3. **Auto Rename Tag** - HTML/JSX tag management
4. **Bracket Pair Colorizer** - Better code readability
5. **GitLens** - Git integration (if using Git)

#### **Optional but Helpful:**
1. **Thunder Client** - API testing (alternative to Postman)
2. **MongoDB for VS Code** - Database management
3. **Live Server** - For static file serving
4. **Material Icon Theme** - Better file icons

### **Step 3: Open Project in VS Code**
```bash
# Method 1: From terminal
cd "D:\RESTAURANT QR MENU SYSTEM Project\restaurant-qr-menu"
code .

# Method 2: From VS Code
File → Open Folder → Select "restaurant-qr-menu" folder
```

---

## ⚙️ **Project Setup in VS Code**

### **Step 1: Create Environment File**
1. **Navigate to server folder** in VS Code
2. **Create new file**: `.env`
3. **Add these contents**:
   ```env
   MONGO_URI=mongodb://localhost:27017/dineconnect
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5001
   ```

### **Step 2: Install Dependencies**

#### **For Server (Backend):**
1. **Open terminal in VS Code** (Ctrl+`)
2. **Navigate to server**:
   ```bash
   cd server
   npm install
   ```

#### **For Client (Frontend):**
1. **Open new terminal** (Ctrl+Shift+`)
2. **Navigate to client**:
   ```bash
   cd client
   npm install
   ```

### **Step 3: Seed Sample Data**
```bash
# In server directory
cd server
node seedData.js
```

---

## 🏃‍♂️ **Running the Project**

### **Method 1: Using VS Code Terminal**

#### **Terminal 1 - Start Backend:**
```bash
cd server
npm start
```
**Expected Output:**
```
✅ DineConnect Server running on port 5001
✅ MongoDB Connected
```

#### **Terminal 2 - Start Frontend:**
```bash
cd client
npm start
```
**Expected Output:**
```
webpack compiled successfully
Local: http://localhost:3001
```

### **Method 2: Using VS Code Tasks (Advanced)**
1. **Create .vscode folder** in project root
2. **Create tasks.json**:
   ```json
   {
     "version": "2.0.0",
     "tasks": [
       {
         "label": "Start Server",
         "type": "shell",
         "command": "npm start",
         "options": {
           "cwd": "${workspaceFolder}/server"
         },
         "group": "build"
       },
       {
         "label": "Start Client",
         "type": "shell",
         "command": "npm start",
         "options": {
           "cwd": "${workspaceFolder}/client"
         },
         "group": "build"
       }
     ]
   }
   ```
3. **Run tasks**: Ctrl+Shift+P → "Tasks: Run Task"

---

## 🔍 **VS Code Workspace Configuration**

### **Create .vscode/settings.json:**
```json
{
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.js": "javascriptreact"
  }
}
```

### **Create .vscode/launch.json (For Debugging):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 📁 **VS Code Folder Structure**
```
restaurant-qr-menu/
├── .vscode/                 # VS Code configuration
│   ├── settings.json
│   ├── tasks.json
│   └── launch.json
├── client/                  # React Frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── node_modules/
├── server/                  # Node.js Backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── .env                # Environment variables
│   ├── server.js
│   ├── package.json
│   └── node_modules/
├── README.md
├── PROJECT_PRESENTATION_GUIDE.md
└── VS_CODE_SETUP_GUIDE.md
```

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "npm is not recognized"**
**Solution**: Install Node.js properly and restart VS Code

### **Issue 2: "MongoDB connection failed"**
**Solutions**:
- **Check MongoDB is running**: Services → MongoDB → Start
- **Check connection string** in .env file
- **Use MongoDB Atlas** (cloud) instead of local

### **Issue 3: "Port already in use"**
**Solutions**:
- **Change ports** in .env (server) or package.json (client)
- **Kill existing processes**:
  ```bash
  # Windows
  netstat -ano | findstr :5001
  taskkill /PID <process_id> /F
  
  # Mac/Linux
  lsof -ti:5001 | xargs kill -9
  ```

### **Issue 4: "Module not found"**
**Solution**: Run `npm install` in both server and client directories

### **Issue 5: "CORS errors"**
**Solution**: Already configured in server.js, but check if both servers are running

---

## 🎯 **VS Code Shortcuts for Development**

### **Essential Shortcuts:**
- **Ctrl+`** - Open terminal
- **Ctrl+Shift+`** - New terminal
- **Ctrl+P** - Quick file search
- **Ctrl+Shift+P** - Command palette
- **F5** - Start debugging
- **Ctrl+Shift+F** - Search in all files
- **Alt+Shift+F** - Format document

### **React Development:**
- **rfc** - Create React functional component
- **useState** - Add useState hook
- **useEffect** - Add useEffect hook

---

## ✅ **Verification Checklist**

### **Before Starting:**
- [ ] Node.js installed and working
- [ ] MongoDB installed/Atlas setup
- [ ] VS Code with recommended extensions
- [ ] Project folder opened in VS Code
- [ ] .env file created with correct values

### **After Setup:**
- [ ] Server starts without errors (port 5001)
- [ ] Client starts without errors (port 3001)
- [ ] Can access http://localhost:3001
- [ ] Can login with test credentials
- [ ] Database connection working

---

## 🎉 **Ready for Development!**

### **Test the Setup:**
1. **Open VS Code**
2. **Open project folder**
3. **Start both servers**
4. **Visit**: http://localhost:3001
5. **Login with**: test@example.com / 123456

### **For Presentation:**
1. **Start servers** 15 minutes before presentation
2. **Test all login credentials**
3. **Check internet connection** (for MongoDB Atlas if using)
4. **Have backup plan** (screenshots/video) ready

---

## 📞 **Quick Help Commands**

### **Check if everything is working:**
```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check MongoDB (if local)
mongo --version

# Test server API
curl http://localhost:5001/api/health

# Check running processes
netstat -ano | findstr :5001
netstat -ano | findstr :3001
```

---

**Your DineConnect project is now ready to run in VS Code! 🚀**

**Pro Tip**: Keep both terminals open during development - one for server, one for client. This way you can see real-time logs and errors from both sides.

**Good luck with your presentation! 🍽️✨**