import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation data
const translations = {
  en: {
    // Common
    welcome: "Welcome!",
    login: "Login",
    register: "Register",
    logout: "Logout",
    email: "Email",
    password: "Password",
    name: "Name",
    submit: "Submit",
    cancel: "Cancel",
    loading: "Loading...",
    
    // Menu
    menu: "Menu",
    cart: "Cart",
    addToCart: "Add to Cart",
    placeOrder: "Place Order",
    orderHistory: "Order History",
    categories: "Categories",
    search: "Search menu items...",
    
    // Order Status
    placed: "Placed",
    preparing: "Preparing",
    ready: "Ready",
    served: "Served",
    canceled: "Canceled",
    
    // Receipt
    receipt: "Receipt",
    downloadPDF: "Download PDF",
    print: "Print",
    orderNumber: "Order #",
    table: "Table",
    date: "Date",
    status: "Status",
    customerName: "Customer",
    subtotal: "Subtotal",
    tax: "Tax",
    total: "Total",
    thankYou: "Thank you for dining with us!",
    
    // Dashboard
    dashboard: "Dashboard",
    overview: "Overview",
    menuItems: "Menu Items",
    tables: "Tables",
    ordersToday: "Orders Today",
    revenueToday: "Revenue Today",
    
    // Roles
    admin: "Admin",
    staff: "Staff",
    customer: "Customer",
    
    // Reviews & Favorites
    reviews: "Reviews",
    writeReview: "Write a Review",
    yourReview: "Your Review",
    editReview: "Edit",
    deleteReview: "Delete",
    submitReview: "Submit Review",
    yourRating: "Your Rating",
    comment: "Comment (optional)",
    shareExperience: "Share your experience...",
    noReviews: "No reviews yet. Be the first to review!",
    favorites: "My Favorites",
    addToFavorites: "Add to favorites",
    removeFromFavorites: "Remove from favorites",
    noFavorites: "No favorites yet!",
    startAddingFavorites: "Start adding items to your favorites by clicking the heart icon on menu items.",
    viewReviews: "View Reviews"
  },
  hi: {
    // Common
    welcome: "स्वागत है!",
    login: "लॉगिन",
    register: "रजिस्टर",
    logout: "लॉगआउट",
    email: "ईमेल",
    password: "पासवर्ड",
    name: "नाम",
    submit: "सबमिट",
    cancel: "रद्द करें",
    loading: "लोड हो रहा है...",
    
    // Menu
    menu: "मेन्यू",
    cart: "कार्ट",
    addToCart: "कार्ट में डालें",
    placeOrder: "ऑर्डर करें",
    orderHistory: "ऑर्डर हिस्ट्री",
    categories: "श्रेणियां",
    search: "मेन्यू आइटम खोजें...",
    
    // Order Status
    placed: "ऑर्डर किया",
    preparing: "तैयार हो रहा",
    ready: "तैयार",
    served: "परोसा गया",
    canceled: "रद्द",
    
    // Receipt
    receipt: "रसीद",
    downloadPDF: "PDF डाउनलोड",
    print: "प्रिंट",
    orderNumber: "ऑर्डर #",
    table: "टेबल",
    date: "दिनांक",
    status: "स्थिति",
    customerName: "ग्राहक",
    subtotal: "उप-योग",
    tax: "टैक्स",
    total: "कुल",
    thankYou: "हमारे साथ खाने के लिए धन्यवाद!",
    
    // Dashboard
    dashboard: "डैशबोर्ड",
    overview: "अवलोकन",
    menuItems: "मेन्यू आइटम",
    tables: "टेबल",
    ordersToday: "आज के ऑर्डर",
    revenueToday: "आज की आय",
    
    // Roles
    admin: "एडमिन",
    staff: "स्टाफ",
    customer: "ग्राहक",
    
    // Reviews & Favorites
    reviews: "समीक्षाएं",
    writeReview: "समीक्षा लिखें",
    yourReview: "आपकी समीक्षा",
    editReview: "संपादित करें",
    deleteReview: "हटाएं",
    submitReview: "समीक्षा सबमिट करें",
    yourRating: "आपकी रेटिंग",
    comment: "टिप्पणी (वैकल्पिक)",
    shareExperience: "अपना अनुभव साझा करें...",
    noReviews: "अभी तक कोई समीक्षा नहीं। पहले समीक्षा करने वाले बनें!",
    favorites: "मेरे पसंदीदा",
    addToFavorites: "पसंदीदा में जोड़ें",
    removeFromFavorites: "पसंदीदा से हटाएं",
    noFavorites: "अभी तक कोई पसंदीदा नहीं!",
    startAddingFavorites: "मेन्यू आइटम पर हार्ट आइकन पर क्लिक करके अपने पसंदीदा में आइटम जोड़ना शुरू करें।",
    viewReviews: "समीक्षाएं देखें"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};