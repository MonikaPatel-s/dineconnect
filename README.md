# 🍽️ DineConnect - Restaurant QR Menu Management System

[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14.0+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.0+-brightgreen.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**DineConnect** is a modern, full-stack restaurant management system that enables contactless dining through QR code technology. Built with the MERN stack, it provides a seamless experience for customers, staff, and administrators.

## 🌟 **Live Demo**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001

## 🔑 **Demo Credentials**
- **Admin**: admin@restaurant.com / admin123
- **Staff**: staff@restaurant.com / staff123
- **Customer**: test@example.com / 123456

## ✨ Features

### 🎯 **Core Functionality**
- **QR Code Menu Access** - Customers scan QR codes to view menus
- **Role-Based Authentication** - Customer, Staff, and Admin roles
- **Digital Ordering** - Complete cart and checkout system
- **Order Management** - Real-time order tracking and status updates
- **Digital Receipts** - PDF generation and printing capabilities

### ⭐ **Advanced Features**
- **Ratings & Reviews** - 5-star rating system with comments
- **Favorites System** - Save and manage favorite dishes
- **Dark/Light Theme** - Toggle between themes
- **Multi-Language Support** - English and Hindi translations
- **Responsive Design** - Works on all devices

### 👥 **User Roles**

#### 🛍️ **Customer Features**
- Browse menu by categories
- Add items to cart and place orders
- Rate and review dishes
- Save favorite items
- View order history
- Digital receipt download

#### 👨‍🍳 **Staff Features**
- View and manage incoming orders
- Update order status (Preparing, Ready, Served)
- Generate customer receipts
- Order analytics

#### 👑 **Admin Features**
- Complete menu management (CRUD operations)
- User management
- Order analytics and reporting
- System configuration

## 🛠️ **Technology Stack**

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### **Frontend**
- **React.js** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Context API** - State management
- **CSS3** - Styling

### **Additional Libraries**
- **jsPDF** - PDF generation
- **html2canvas** - Screenshot capture
- **QRCode** - QR code generation

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-qr-menu
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Create .env file
   echo "MONGO_URI=mongodb://localhost:27017/dineconnect" > .env
   echo "JWT_SECRET=your-secret-key" >> .env
   echo "PORT=5001" >> .env
   
   # Start server
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   
   # Start client
   npm start
   ```

4. **Seed Database (Optional)**
   ```bash
   cd ../server
   node seedData.js
   ```

### **Access the Application**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/api/health

## 📱 **Usage**

### **For Restaurants**
1. **Admin Setup**: Register as admin and configure menu
2. **Generate QR Codes**: Create QR codes for each table
3. **Staff Training**: Train staff on order management system

### **For Customers**
1. **Scan QR Code**: Use phone camera to scan table QR code
2. **Browse Menu**: View dishes, ratings, and reviews
3. **Place Order**: Add items to cart and checkout
4. **Track Order**: Monitor order status in real-time
5. **Rate & Review**: Share feedback after dining

## 🎨 **Screenshots**

### Customer Experience
- **Menu Browsing** - Clean, categorized menu display
- **Cart Management** - Easy add/remove items
- **Favorites** - Save preferred dishes
- **Reviews** - Rate and comment on dishes

### Staff Dashboard
- **Order Queue** - Real-time order management
- **Status Updates** - Easy order status changes
- **Receipt Generation** - Digital receipt creation

### Admin Panel
- **Menu Management** - Full CRUD operations
- **Analytics** - Order and revenue insights
- **User Management** - Customer and staff oversight

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Menu Management**
- `GET /api/menu/items` - Get all menu items
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### **Orders**
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status

### **Reviews & Favorites**
- `GET /api/reviews/menu/:id` - Get item reviews
- `POST /api/reviews` - Add review
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add to favorites

## 🌟 **Key Highlights**

- **Contactless Experience** - Complete QR-based ordering
- **Real-time Updates** - Live order status tracking
- **Multi-language** - English and Hindi support
- **Responsive Design** - Mobile-first approach
- **Professional UI** - Modern restaurant-themed design
- **Scalable Architecture** - Built for growth

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 **Developer**

Built with ❤️ for modern restaurants seeking digital transformation.

---

**DineConnect** - *Connecting Diners with Great Food* 🍽️✨