import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

const ChatBot = ({ menuItems = [], currentTable = null, onAddToCart = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Welcome to DineConnect! I'm your AI assistant here to help with menu, orders, and restaurant information. How may I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    "🍽️ Browse Menu",
    "⭐ Popular Items", 
    "💰 Special Offers",
    "👨‍🍳 Chef Specials",
    "🌱 Vegetarian Options",
    "🌶️ Spicy Dishes",
    "🎁 Combo Deals",
    "💰 Price Ranges",
    "🥗 Healthy Options",
    "⚠️ Allergen Info",
    "⏱️ Cooking Times",
    "📞 Contact Us"
  ];

  const botResponses = {
    greetings: [
      "Hello! Welcome to DineConnect! 🍽️",
      "Hi there! Ready to explore our delicious menu? 😊",
      "Hey! I'm Dine, your food assistant! What can I help you with?"
    ],
    menu: {
      show: "Here are our menu categories! What would you like to explore?",
      popular: "🔥 Our most popular items are:\n• Chicken Biryani\n• Butter Chicken\n• Paneer Tikka\n• Masala Dosa\n• Gulab Jamun",
      offers: "🎉 Today's Special Offers:\n• 20% off on all Biryanis\n• Buy 2 Get 1 Free on Desserts\n• Free delivery on orders above ₹500"
    },
    restaurant: {
      hours: "🕒 We're open:\nMon-Sun: 11:00 AM - 11:00 PM\nKitchen closes at 10:30 PM",
      contact: "📞 Contact Us:\nPhone: +91-9876543210\nEmail: info@dineconnect.com\nAddress: 123 Food Street, Restaurant City",
      delivery: "🚗 Delivery Options:\n• Free delivery within 5km\n• Express delivery in 30 mins\n• Takeaway available\n• Dine-in with table service"
    },
    help: "🤖 **I can help you with:**\n\n🍽️ **Menu & Food:**\n• Complete menu browsing\n• Detailed dish information\n• Ingredient lists & nutrition\n• Spice levels & dietary options\n\n💰 **Pricing & Deals:**\n• Individual item pricing\n• Budget-friendly options\n• Combo deals & offers\n• Special promotions\n\n👨‍🍳 **Recommendations:**\n• Popular dishes\n• Chef specials\n• Customer favorites\n• Personalized suggestions\n\n📋 **Order Assistance:**\n• Order placement help\n• Cart management\n• Order status tracking\n• Modification requests\n\n🏪 **Restaurant Info:**\n• Contact details\n• Operating hours\n• Delivery options\n• Table information\n\n🔍 **Advanced Features:**\n• Voice command support\n• Allergen information\n• Cooking time estimates\n• Nutritional details\n\n**Just ask me anything! I'm here to help 24/7** 🌟"
  };

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Greetings
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      return botResponses.greetings[Math.floor(Math.random() * botResponses.greetings.length)];
    }
    
    // Advanced menu item search with detailed info
    if (menuItems.length > 0) {
      const foundItem = menuItems.find(item => 
        item.name.toLowerCase().includes(message) || 
        message.includes(item.name.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(message))
      );
      
      if (foundItem) {
        const itemDetails = `🍽️ **${foundItem.name}**\n\n💰 **Price:** ₹${foundItem.price}\n📝 **Description:** ${foundItem.description || 'Delicious dish prepared with fresh ingredients'}\n\n⏱️ **Prep Time:** ${foundItem.prepTime || '15-20'} minutes\n🌶️ **Spice Level:** ${foundItem.spiceLevel || 'Medium'}\n🥗 **Category:** ${foundItem.categoryId?.name || 'Main Course'}\n\n${foundItem.ingredients ? `🥘 **Ingredients:** ${foundItem.ingredients}\n\n` : ''}${foundItem.nutritionInfo ? `📊 **Nutrition:** ${foundItem.nutritionInfo}\n\n` : ''}${foundItem.allergens ? `⚠️ **Allergens:** ${foundItem.allergens}\n\n` : ''}${foundItem.availability ? '✅ **Status:** Available Now!' : '❌ **Status:** Currently Unavailable'}\n\n${foundItem.rating ? `⭐ **Rating:** ${foundItem.rating}/5 stars` : ''}`;
        
        return itemDetails + "\n\nWould you like me to add this to your cart? 🛒";
      }
    }
    
    // Advanced menu queries
    if (message.includes('menu') || message.includes('food') || message.includes('dish')) {
      if (message.includes('popular') || message.includes('best') || message.includes('recommend')) {
        return getPopularItems();
      }
      if (message.includes('vegetarian') || message.includes('veg')) {
        return getVegetarianItems();
      }
      if (message.includes('non-veg') || message.includes('chicken') || message.includes('mutton') || message.includes('meat')) {
        return getNonVegItems();
      }
      if (message.includes('spicy') || message.includes('hot')) {
        return getSpicyItems();
      }
      if (message.includes('dessert') || message.includes('sweet')) {
        return getDessertItems();
      }
      if (message.includes('drink') || message.includes('beverage')) {
        return getBeverageItems();
      }
      return botResponses.menu.show + "\n\n" + getMenuCategories();
    }
    
    // Add to cart requests
    if (message.includes('add') && (message.includes('cart') || message.includes('order'))) {
      return "🛒 To add items to cart, you can:\n1. Browse the menu and click 'Add to Cart'\n2. Use voice commands: 'Add chicken biryani'\n3. Tell me the item name and I'll help you find it!\n\nWhat would you like to add?";
    }
    
    // Offers and pricing
    if (message.includes('offer') || message.includes('discount') || message.includes('deal') || message.includes('special')) {
      return botResponses.menu.offers;
    }
    
    // Restaurant info
    if (message.includes('time') || message.includes('hour') || message.includes('open') || message.includes('close')) {
      return botResponses.restaurant.hours;
    }
    
    if (message.includes('contact') || message.includes('phone') || message.includes('address') || message.includes('location')) {
      return botResponses.restaurant.contact;
    }
    
    if (message.includes('delivery') || message.includes('takeaway') || message.includes('pickup')) {
      return botResponses.restaurant.delivery;
    }
    
    // Order queries
    if (message.includes('order') || message.includes('cart')) {
      return "🛒 To place an order:\n1. Browse our menu\n2. Add items to cart\n3. Review your order\n4. Proceed to checkout\n\nYou can also use voice commands or ask me about specific dishes!\n\nNeed help with anything specific?";
    }
    
    // Table info
    if (message.includes('table') && currentTable) {
      return `📍 You're at Table ${currentTable.number}\nCapacity: ${currentTable.capacity} people\nEnjoy your dining experience!`;
    }
    
    // Advanced search queries
    if (message.includes('search') || message.includes('find') || message.includes('looking for')) {
      return "🔍 **Advanced Search Options:**\n\nI can help you find:\n\n🍽️ **By Category:** 'Show starters', 'Find desserts'\n🌶️ **By Spice:** 'Mild dishes', 'Very spicy food'\n💰 **By Price:** 'Under ₹100', 'Budget options'\n🥗 **By Diet:** 'Vegetarian', 'High protein'\n⏱️ **By Time:** 'Quick meals', 'Ready in 10 minutes'\n🏆 **By Rating:** 'Top rated', 'Best dishes'\n\n**Just tell me what you're looking for!** 🎯";
    }

    // Voice assistant info
    if (message.includes('voice') || message.includes('speak') || message.includes('dine assistant')) {
      return "🎤 **Voice Commands Available:**\n\n**Try saying:**\n• 'Show me chicken dishes'\n• 'Add biryani to cart'\n• 'What's popular today?'\n• 'Order status'\n• 'Find vegetarian options'\n• 'Chef recommendations'\n\n**Advanced Voice Features:**\n• Natural language understanding\n• Menu search by voice\n• Order management\n• Real-time assistance\n\nJust click the voice button (🎤) to start! 🗣️";
    }
    
    // Help
    if (message.includes('help') || message.includes('support')) {
      return botResponses.help;
    }
    
    // Advanced price queries
    if (message.includes('price') || message.includes('cost') || message.includes('₹') || message.includes('expensive') || message.includes('cheap')) {
      if (message.includes('range') || message.includes('budget')) {
        return getPriceRanges();
      }
      return "💰 **Pricing Information:**\n\n🥗 Starters: ₹80 - ₹200\n🍛 Main Course: ₹150 - ₹400\n🍞 Breads: ₹30 - ₹80\n🥤 Beverages: ₹25 - ₹100\n🍰 Desserts: ₹60 - ₹150\n\nTell me a specific dish name for exact pricing!";
    }

    // Nutrition and dietary info
    if (message.includes('calorie') || message.includes('nutrition') || message.includes('healthy') || message.includes('diet')) {
      return getNutritionInfo();
    }

    // Allergen information
    if (message.includes('allerg') || message.includes('gluten') || message.includes('dairy') || message.includes('nut')) {
      return getAllergenInfo();
    }

    // Cooking time queries
    if (message.includes('time') && (message.includes('cook') || message.includes('prepare') || message.includes('ready'))) {
      return getCookingTimes();
    }

    // Chef recommendations
    if (message.includes('chef') || message.includes('signature') || message.includes('special')) {
      return getChefSpecials();
    }

    // Combo and meal deals
    if (message.includes('combo') || message.includes('meal') || message.includes('deal') || message.includes('package')) {
      return getComboDeals();
    }

    // Rating and reviews
    if (message.includes('rating') || message.includes('review') || message.includes('feedback')) {
      return getRatingsInfo();
    }
    
    // Default response with advanced suggestions
    return "🤔 I'm not sure about that, but I can help you with:\n\n🍽️ **Menu & Food Items**\n💰 **Pricing & Budget Options**\n📞 **Restaurant Information**\n🚗 **Delivery & Takeaway**\n📋 **Order Assistance**\n🎤 **Voice Commands**\n🌶️ **Spice Levels & Dietary Info**\n⭐ **Ratings & Reviews**\n👨‍🍳 **Chef Specials**\n🎁 **Combo Deals**\n\n**Try asking:**\n• 'Show vegetarian options'\n• 'What's spicy?'\n• 'Chef recommendations'\n• 'Combo deals'\n• 'Nutrition information'\n\nWhat would you like to know?";
  };

  const getMenuCategories = () => {
    const categories = ['🍛 Main Course', '🥗 Starters', '🍞 Breads', '🥤 Beverages', '🍰 Desserts'];
    return "Available categories:\n" + categories.join('\n');
  };

  const getPopularItems = () => {
    if (menuItems.length === 0) return botResponses.menu.popular;
    
    const popularItems = menuItems
      .filter(item => item.rating >= 4 || item.isPopular)
      .slice(0, 5)
      .map(item => `⭐ ${item.name} - ₹${item.price} (${item.rating || 4.5}⭐)`)
      .join('\n');
    
    return popularItems.length > 0 
      ? `🔥 **Most Popular Items:**\n\n${popularItems}\n\nWant details about any specific item?`
      : botResponses.menu.popular;
  };

  const getVegetarianItems = () => {
    if (menuItems.length === 0) return "🥗 We have amazing vegetarian options! Please check our menu for details.";
    
    const vegItems = menuItems
      .filter(item => item.isVegetarian || item.category === 'vegetarian')
      .slice(0, 6)
      .map(item => `🥗 ${item.name} - ₹${item.price}`)
      .join('\n');
    
    return vegItems.length > 0 
      ? `🌱 **Vegetarian Delights:**\n\n${vegItems}\n\nAll made with fresh, organic ingredients!`
      : "🥗 We have delicious vegetarian options including Dal, Paneer dishes, and fresh salads!";
  };

  const getNonVegItems = () => {
    if (menuItems.length === 0) return "🍖 We serve delicious non-vegetarian dishes including Chicken, Mutton, and Seafood!";
    
    const nonVegItems = menuItems
      .filter(item => !item.isVegetarian && (item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('mutton') || item.name.toLowerCase().includes('fish')))
      .slice(0, 6)
      .map(item => `🍖 ${item.name} - ₹${item.price}`)
      .join('\n');
    
    return nonVegItems.length > 0 
      ? `🍗 **Non-Vegetarian Specialties:**\n\n${nonVegItems}\n\nFresh, tender, and perfectly spiced!`
      : "🍖 Our non-veg menu includes Chicken Biryani, Mutton Curry, Butter Chicken, and more!";
  };

  const getSpicyItems = () => {
    return "🌶️ **Spicy & Hot Dishes:**\n\n🔥 Chicken 65 - ₹180\n🔥 Spicy Mutton Curry - ₹280\n🔥 Hot & Sour Soup - ₹120\n🔥 Chili Chicken - ₹220\n🔥 Spicy Biryani - ₹250\n\n⚠️ These dishes pack some serious heat! 🔥";
  };

  const getDessertItems = () => {
    return "🍰 **Sweet Endings:**\n\n🍮 Gulab Jamun - ₹80\n🍨 Kulfi - ₹60\n🎂 Chocolate Cake - ₹120\n🍯 Ras Malai - ₹100\n🥧 Ice Cream (Various) - ₹70\n\nPerfect way to end your meal! 😋";
  };

  const getBeverageItems = () => {
    return "🥤 **Refreshing Beverages:**\n\n☕ Masala Chai - ₹30\n🥛 Lassi (Sweet/Salt) - ₹50\n🥤 Fresh Lime Soda - ₹40\n☕ Filter Coffee - ₹35\n🧊 Cold Drinks - ₹25\n🥭 Fresh Fruit Juice - ₹60\n\nStay hydrated and refreshed! 💧";
  };

  const getPriceRanges = () => {
    return "💰 **Budget-Friendly Options:**\n\n💵 **Under ₹100:**\n• Masala Chai - ₹30\n• Plain Roti - ₹15\n• Dal Tadka - ₹80\n• Gulab Jamun - ₹80\n\n💵 **₹100-200:**\n• Chicken Curry - ₹180\n• Paneer Butter Masala - ₹160\n• Veg Biryani - ₹150\n\n💵 **₹200-400:**\n• Chicken Biryani - ₹250\n• Mutton Curry - ₹320\n• Special Thali - ₹280\n\nGreat value for money! 💪";
  };

  const getNutritionInfo = () => {
    return "🥗 **Healthy & Nutritious Options:**\n\n💪 **High Protein:**\n• Grilled Chicken - 35g protein\n• Dal Tadka - 18g protein\n• Paneer Tikka - 25g protein\n\n🌱 **Low Calorie:**\n• Green Salad - 50 calories\n• Clear Soup - 80 calories\n• Steamed Rice - 130 calories\n\n🥬 **Rich in Fiber:**\n• Mixed Veg Curry\n• Brown Rice\n• Whole Wheat Roti\n\nEating healthy never tasted so good! 🌟";
  };

  const getAllergenInfo = () => {
    return "⚠️ **Allergen Information:**\n\n🥛 **Dairy-Free Options:**\n• Dal Tadka\n• Chicken Curry (without cream)\n• Coconut Rice\n\n🌾 **Gluten-Free Options:**\n• All Rice dishes\n• Grilled items\n• Most curries\n\n🥜 **Nut-Free Options:**\n• Most vegetarian curries\n• Grilled chicken\n• Plain rice & rotis\n\n⚠️ **Please inform our staff about any allergies when ordering!**\n\nYour safety is our priority! 🛡️";
  };

  const getCookingTimes = () => {
    return "⏱️ **Preparation Times:**\n\n⚡ **Quick (5-10 mins):**\n• Beverages\n• Salads\n• Ready items\n\n🕐 **Medium (15-20 mins):**\n• Most curries\n• Grilled items\n• Fried rice\n\n🕐 **Takes Time (25-35 mins):**\n• Biryani\n• Tandoor items\n• Special preparations\n\nFresh food takes time, but it's worth the wait! ⭐";
  };

  const getChefSpecials = () => {
    return "👨‍🍳 **Chef's Signature Dishes:**\n\n🏆 **Today's Specials:**\n• Chef's Special Biryani - ₹350\n• Signature Butter Chicken - ₹280\n• Royal Mutton Korma - ₹380\n• Chef's Paneer Makhani - ₹220\n\n🎖️ **Award-Winning:**\n• DineConnect Special Thali - ₹320\n• Chef's Mystery Curry - ₹250\n\n✨ **Exclusive recipes perfected over years!**\nThese dishes represent our culinary excellence! 🌟";
  };

  const getComboDeals = () => {
    return "🎁 **Amazing Combo Deals:**\n\n👥 **Family Pack (4 people):**\n• 2 Main Course + 4 Rotis + Rice + Dessert\n• Only ₹800 (Save ₹200!)\n\n💑 **Couple Special:**\n• 2 Main Course + 2 Drinks + 1 Dessert\n• Only ₹450 (Save ₹100!)\n\n🍽️ **Solo Meal:**\n• 1 Main + 2 Rotis + 1 Drink\n• Only ₹180 (Save ₹50!)\n\n🎉 **Weekend Special:**\n• Unlimited Thali + Dessert\n• Only ₹350 (Fridays-Sundays)\n\nBest value for your money! 💰";
  };

  const getRatingsInfo = () => {
    return "⭐ **Customer Ratings & Reviews:**\n\n🏆 **Top Rated Dishes:**\n• Chicken Biryani - 4.8/5 ⭐\n• Butter Chicken - 4.7/5 ⭐\n• Paneer Tikka - 4.6/5 ⭐\n• Gulab Jamun - 4.9/5 ⭐\n\n📊 **Overall Restaurant Rating:**\n⭐⭐⭐⭐⭐ 4.7/5 (2,500+ reviews)\n\n💬 **Recent Reviews:**\n'Amazing food quality!' - Priya S.\n'Best biryani in town!' - Rahul K.\n'Excellent service!' - Anjali M.\n\nYour satisfaction is our success! 🎯";
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const handleQuickReply = (reply) => {
    setInputText(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Dine - AI Assistant"
      >
        {isOpen ? '✕' : (
          <div className="chat-btn-content">
            <div className="chat-icon">💬</div>
            <span className="chat-text">Chat with Dine</span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="bot-info">
              <div className="bot-avatar">
                <div className="dine-logo">D</div>
              </div>
              <div>
                <h3>Chat with Dine</h3>
                <span className="bot-status">🟢 AI Assistant Online</span>
              </div>
            </div>
            <button 
              className="close-chat"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                <div className="message-content">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="quick-replies">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chatbot-input">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isTyping}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isTyping}
              className="send-btn"
            >
              📤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;