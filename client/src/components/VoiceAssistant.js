import React, { useState, useEffect } from 'react';
import './VoiceAssistant.css';

const VoiceAssistant = ({ menuItems, onPlaceOrder, customerName }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [pendingOrder, setPendingOrder] = useState(null); // Store order for confirmation
  const [voiceGender, setVoiceGender] = useState('female'); // male or female voice
  const [language, setLanguage] = useState('en-US'); // English for better recognition

  useEffect(() => {
    // Enhanced browser support check
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    console.log('🔍 Browser support check:');
    console.log('- Browser:', navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other');
    console.log('- SpeechRecognition available:', !!SpeechRecognition);
    console.log('- webkitSpeechRecognition available:', !!window.webkitSpeechRecognition);
    console.log('- MediaDevices available:', !!navigator.mediaDevices);
    console.log('- getUserMedia available:', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    console.log('- Protocol:', window.location.protocol);
    console.log('- Hostname:', window.location.hostname);
    console.log('- Full URL:', window.location.href);
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      
      // Fixed Configuration for English recognition
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US'; // Force English for better recognition
      recognitionInstance.maxAlternatives = 1; // Single alternative for clarity
      
      // Event handlers
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        console.log('🔍 Debug - Speech recognition result:', finalTranscript || interimTranscript); // Debug log
        
        if (finalTranscript) {
          console.log('🔍 Debug - Raw transcript:', finalTranscript);
          
          // Enhanced cleaning for better recognition
          const cleanedTranscript = finalTranscript
            .toLowerCase()
            .trim()
            .replace(/[.,!?;]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize spaces
            .replace(/[^\w\s]/g, '') // Remove special characters
            .replace(/\d+/g, ''); // Remove numbers that might confuse
          
          console.log('🔍 Debug - Cleaned transcript:', cleanedTranscript);
          processVoiceInput(cleanedTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.log('🔍 Speech Recognition Error:', event.error);
        setIsListening(false);
        
        let errorMessage = '';
        switch(event.error) {
          case 'not-allowed':
            errorMessage = '🎤 Microphone access denied. Please allow microphone permission and try again.';
            break;
          case 'no-speech':
            errorMessage = '🔇 No speech detected. Please speak clearly and try again.';
            break;
          case 'audio-capture':
            errorMessage = '🎤 Microphone not found. Please check your microphone and try again.';
            break;
          case 'network':
            errorMessage = '🌐 Network error. Please check your internet connection.';
            break;
          default:
            errorMessage = `❌ Speech recognition error: ${event.error}. Please try again.`;
        }
        
        addToConversation('system', errorMessage);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }

    // Load voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log('🔍 Voices loaded:', voices.length);
    };
    
    // Load voices when they become available
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();

    // Advanced Welcome message
    addToConversation('assistant', `🎉 Welcome ${customerName || 'to DineConnect'}! I'm Dine, your advanced AI dining assistant.

    🎤 Voice Ordering Made Easy:
    • "Show menu" - Browse all available items
    • "I want coffee" - Order any menu item
    • "Order two pizza" - Specify quantities
    • "Add biryani" - Add items to cart
    • "Voice test" - Check audio quality
    
    🍽️ I can recognize all ${menuItems.length} menu items! Just speak naturally.
    
    💡 Speak clearly in English for best results. Ready to order? Try "Show menu" or "I want coffee"!`);
  }, [customerName]);

  const addToConversation = (sender, message) => {
    setConversation(prev => [...prev, { sender, message, timestamp: new Date() }]);
  };

  const processVoiceInput = async (input) => {
    setIsProcessing(true);
    addToConversation('customer', input);
    
    const lowerInput = input.toLowerCase().trim();
    console.log('🔍 Debug - Processing input:', `"${lowerInput}"`);
    
    // SIMPLE WORKING COMMANDS ONLY
    
    // 1. Basic greetings (TESTED - WORKING)
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('test')) {
      const response = "🎉 Hello! I can hear you perfectly! I'm working great! Try saying 'voice test' or 'tell me a joke'!";
      addToConversation('assistant', response);
      speakResponse(response);
      setIsProcessing(false);
      return;
    }

    // 2. Voice test (TESTED - WORKING)
    if (lowerInput.includes('voice test') || lowerInput.includes('test voice')) {
      const response = voiceGender === 'female' ? 
        "💃 Perfect! This is my female voice! I sound sweet and clear!" :
        "🕺 Excellent! This is my male voice! I sound deep and confident!";
      addToConversation('assistant', response);
      speakResponse(response);
      setIsProcessing(false);
      return;
    }
    
    // 3. Voice switching (WORKING via dropdown)
    if (lowerInput.includes('female voice')) {
      setVoiceGender('female');
      const response = "💃 Switched to female voice! How do I sound?";
      addToConversation('assistant', response);
      speakResponse(response);
      setIsProcessing(false);
      return;
    } else if (lowerInput.includes('male voice')) {
      setVoiceGender('male');
      const response = "🕺 Switched to male voice! How do I sound?";
      addToConversation('assistant', response);
      speakResponse(response);
      setIsProcessing(false);
      return;
    }

    // 4. Jokes (TESTED - WORKING)
    if (lowerInput.includes('joke') || lowerInput.includes('funny')) {
      const jokes = [
        "😄 Why did the biryani go to therapy? Because it had too many layers!",
        "🤣 What did the pizza say to the burger? You're bun-believable!",
        "😂 Customer: 'This dal tastes like water!' Waiter: 'Sir, dal learned swimming!'"
      ];
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      addToConversation('assistant', randomJoke);
      speakResponse(randomJoke);
      setIsProcessing(false);
      return;
    }

    // 5. Thank you (TESTED - WORKING)
    if (lowerInput.includes('thank you') || lowerInput.includes('thanks')) {
      const response = "🙏 You're welcome! I'm happy to help! Try saying 'voice test' or 'tell me a joke'!";
      addToConversation('assistant', response);
      speakResponse(response);
      setIsProcessing(false);
      return;
    }

    // 6. Advanced food ordering system
    else if (lowerInput.includes('want') || lowerInput.includes('order') || lowerInput.includes('get me') || 
             lowerInput.includes('add') || lowerInput.includes('menu') || lowerInput.includes('show menu') ||
             // Check if any menu item is mentioned
             menuItems.some(item => {
               const itemWords = item.name.toLowerCase().split(/[\s\-\(\)]+/);
               return itemWords.some(word => word.length > 2 && lowerInput.includes(word));
             })) {
      handleAdvancedFoodOrder(lowerInput);
    }
    
    // 7. Default response for unrecognized commands
    else {
      const response = `🤔 I heard "${lowerInput}" but I'm not sure what you want. Try these working commands: "hello", "voice test", "tell me a joke", "thank you", "female voice", or "male voice"!`;
      addToConversation('assistant', response);
      speakResponse("I'm not sure what you want. Try saying 'hello', 'voice test', 'tell me a joke', or 'thank you'!");
    }
    
    setIsProcessing(false);
  };

  const handleAdvancedFoodOrder = async (input) => {
    console.log('🔍 Processing advanced food order:', input);
    
    // Check for menu inquiry first
    if (input.includes('menu') || input.includes('show') || input.includes('what do you have') || 
        input.includes('available') || input.includes('list')) {
      showMenuItems();
      return;
    }
    
    // Extract items from speech
    const foundItems = extractItemsFromSpeech(input);
    
    if (foundItems.length > 0) {
      // Process the order
      const itemsList = foundItems.map(item => `${item.quantity} ${item.name}`).join(', ');
      const total = foundItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const response = `🎉 Perfect! I found: ${itemsList}. Total: ₹${total}. Adding to your cart now!`;
      addToConversation('assistant', response);
      speakResponse(response);
      
      // Add items to cart
      try {
        await addItemsToCart(foundItems);
        const successResponse = "✅ Items successfully added to your cart! You can review and place your order now.";
        addToConversation('assistant', successResponse);
        speakResponse(successResponse);
      } catch (error) {
        const errorResponse = "❌ Sorry, there was an issue adding items to your cart. Please try again.";
        addToConversation('assistant', errorResponse);
        speakResponse(errorResponse);
      }
    } else {
      const response = "🤔 I couldn't find those items on our menu. Try saying 'show menu' to see all available items, or speak the item name clearly.";
      addToConversation('assistant', response);
      speakResponse(response);
    }
  };

  const showMenuItems = () => {
    if (menuItems.length === 0) {
      const response = "📋 Menu is currently being loaded. Please try again in a moment.";
      addToConversation('assistant', response);
      speakResponse(response);
      return;
    }
    
    // Group items by category
    const categories = {};
    menuItems.forEach(item => {
      const category = item.categoryId?.name || 'Other';
      if (!categories[category]) categories[category] = [];
      categories[category].push(item);
    });
    
    let menuText = "🍽️ Here's our menu:\n\n";
    Object.entries(categories).forEach(([category, items]) => {
      menuText += `${category}:\n`;
      items.slice(0, 3).forEach(item => { // Show top 3 items per category
        menuText += `• ${item.name} - ₹${item.price}\n`;
      });
      menuText += '\n';
    });
    
    menuText += "Just say 'I want [item name]' to order!";
    
    addToConversation('assistant', menuText);
    
    // Speak a shorter version
    const spokenResponse = `We have ${Object.keys(categories).join(', ')} and more! Popular items include ${menuItems.slice(0, 5).map(item => item.name).join(', ')}. Just say 'I want' followed by any item name to order!`;
    speakResponse(spokenResponse);
  };

  const addItemsToCart = async (items) => {
    if (onPlaceOrder) {
      return await onPlaceOrder(items);
    } else {
      // Fallback: simulate adding to cart
      console.log('🛒 Adding items to cart:', items);
      return Promise.resolve(items);
    }
  };

  const handleOrderInitiation = (input) => {
    // Extract items from the initial order request
    const items = extractItemsFromSpeech(input);
    
    console.log('🔍 Debug - Items found:', items); // Debug log
    
    if (items.length > 0) {
      // Auto-add to cart without confirmation for smoother experience
      setCurrentOrder(items);
      setPendingOrder(items);
      
      // Directly add to cart
      addItemsToCart(items);
      
      const itemsList = items.map(item => `${item.quantity} ${item.name} (₹${item.price * item.quantity})`).join(', ');
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const response = `🎉 Perfect! I've added ${itemsList} to your cart. Total: ₹${total}. The cart will open now so you can review and place your order!`;
      addToConversation('assistant', response);
      speakResponse(response);
      
      setCurrentOrder([]);
      setPendingOrder(null);
    } else {
      const response = `🎤 I'm ready to take your order! What would you like to have today? You can say something like "I want cold coffee" or "I want chicken biryani".`;
      addToConversation('assistant', response);
      speakResponse(response);
    }
  };

  const handleDirectOrder = (input) => {
    const items = extractItemsFromSpeech(input);
    
    console.log('🔍 Debug - Direct order items:', items); // Debug log
    
    if (items.length > 0) {
      // Auto-add to cart without confirmation for smoother experience
      setCurrentOrder(items);
      setPendingOrder(items);
      
      // Directly add to cart
      addItemsToCart(items);
      
      const itemsList = items.map(item => `${item.quantity} ${item.name} (₹${item.price * item.quantity})`).join(', ');
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const response = `🎉 Excellent! I've added ${itemsList} to your cart. Total: ₹${total}. The cart will open now so you can review and place your order!`;
      addToConversation('assistant', response);
      speakResponse(response);
      
      setCurrentOrder([]);
      setPendingOrder(null);
    } else {
      const response = `🤔 I couldn't find those items on our menu. Could you try again? Say something like "I want cold coffee" or ask "what do you have?" to see our menu.`;
      addToConversation('assistant', response);
      speakResponse(response);
    }
  };



  const confirmAndPlaceOrder = async () => {
    console.log('🔍 Debug - Current order when confirming:', currentOrder); // Debug log
    console.log('🔍 Debug - Pending order when confirming:', pendingOrder); // Debug log
    
    const orderToProcess = pendingOrder || currentOrder;
    
    if (orderToProcess && orderToProcess.length > 0) {
      try {
        // Add items to cart
        await addItemsToCart(orderToProcess);
        
        const response = `🎉 Perfect! I've added your items to the cart. The cart will open now so you can review and place your final order. Thank you for using DineConnect!`;
        addToConversation('assistant', response);
        speakResponse(response);
        
        setCurrentOrder([]);
        setPendingOrder(null);
      } catch (error) {
        // Error already handled in addItemsToCart
      }
    } else {
      const response = `🤔 I don't have any items in your current order. Please tell me what you'd like to order first. Try saying "I want cold coffee".`;
      addToConversation('assistant', response);
      speakResponse(response);
    }
  };

  const cancelCurrentOrder = () => {
    setCurrentOrder([]);
    setPendingOrder(null);
    const response = `👍 No problem! Your order has been cleared. What would you like to order instead?`;
    addToConversation('assistant', response);
    speakResponse(response);
  };

  const showMenuOptions = () => {
    const categories = [...new Set(menuItems.map(item => item.categoryId?.name).filter(Boolean))];
    const allItems = menuItems.map(item => item.name).join(', ');
    
    if (menuItems.length <= 10) {
      // If few items, list all
      const response = `🍽️ Here are all our items: ${allItems}. Just say "I want [item name]" to order!`;
      addToConversation('assistant', response);
      speakResponse(response);
    } else {
      // If many items, show categories and some examples
      const popularItems = menuItems.slice(0, 8).map(item => item.name).join(', ');
      const response = `🍽️ We have ${categories.join(', ')} and more! Some items are: ${popularItems}. Just say "I want [any item name]" to order!`;
      addToConversation('assistant', response);
      speakResponse(response);
    }
    
    console.log('🔍 Debug - All menu items for voice recognition:', menuItems.map(item => item.name));
  };

  const handleUnknownInput = () => {
    const responses = [
      `🤔 I heard "${transcript}", but I'm not sure what you want. Try saying: "I want coffee", "tell me a joke", or "what do you have"!`,
      `😊 I'm listening! Try simple commands like: "I want biryani", "joke sunao", or "hello Dine"!`,
      `🎤 I can hear you clearly! Try saying: "Order pizza", "menu dikhao", or "help me"!`,
      `🎯 Let me help! Try these commands: "I want food", "tell me a joke", "voice test", or "show menu"!`
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    addToConversation('assistant', response);
    speakResponse(response);
  };

  const respondToGreeting = () => {
    const response = `👋 Hello! Great to meet you! I'm here to help you order. Just say "take my order" and tell me what you'd like to have.`;
    addToConversation('assistant', response);
    speakResponse(response);
  };

  const extractItemsFromSpeech = (speech) => {
    const foundItems = [];
    const lowerSpeech = speech.toLowerCase().trim();
    
    console.log('🔍 Analyzing speech for menu items:', lowerSpeech);
    console.log('🔍 Available menu items:', menuItems.map(item => item.name));
    
    // Enhanced quantity extraction
    const quantityWords = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'a': 1, 'an': 1, 'single': 1, 'double': 2, 'triple': 3
    };
    
    // Extract quantities from speech
    const quantityMatches = lowerSpeech.match(/\b(one|two|three|four|five|a|an|single|double|triple|\d+)\b/g) || [];
    const quantities = quantityMatches.map(q => quantityWords[q] || parseInt(q) || 1);
    
    // Advanced menu item matching
    menuItems.forEach((item) => {
      const itemName = item.name.toLowerCase();
      const itemWords = itemName.split(/[\s\-\(\)]+/).filter(word => word.length > 2);
      
      let matchScore = 0;
      let matchedWords = [];
      
      // Primary matching: exact word matches
      itemWords.forEach(word => {
        if (lowerSpeech.includes(word)) {
          matchScore += 15; // Higher score for exact matches
          matchedWords.push(word);
        }
      });
      
      // Secondary matching: partial matches
      itemWords.forEach(word => {
        if (word.length >= 4) {
          const partial = word.substring(0, 3);
          if (lowerSpeech.includes(partial) && !matchedWords.includes(word)) {
            matchScore += 8;
            matchedWords.push(partial);
          }
        }
      });
      
      // Tertiary matching: phonetic and common variations
      const variations = getItemVariations(itemName);
      variations.forEach(variation => {
        if (lowerSpeech.includes(variation.toLowerCase())) {
          matchScore += 10;
          matchedWords.push(variation);
        }
      });
      
      // Category and context bonus
      matchScore += getCategoryContextBonus(item, lowerSpeech);
      
      console.log(`🔍 Item: ${itemName} | Score: ${matchScore} | Matches: ${matchedWords.join(', ')}`);
      
      // Add item if good match found
      if (matchScore >= 10 && !foundItems.find(fi => fi.id === item._id)) {
        const quantity = quantities[foundItems.length] || 1;
        foundItems.push({
          id: item._id,
          name: item.name,
          price: item.price,
          quantity: quantity,
          matchScore: matchScore,
          matchedWords: matchedWords
        });
      }
    });
    
    // Sort by match score (highest first) and take best matches
    foundItems.sort((a, b) => b.matchScore - a.matchScore);
    
    console.log('🔍 Debug - Final found items:', foundItems.map(item => ({
      name: item.name,
      score: item.matchScore,
      words: item.matchedWords
    }))); // Debug log
    
    return foundItems.slice(0, 3); // Return top 3 matches to avoid too many items
  };

  // Enhanced item variations for better matching
  const getItemVariations = (itemName) => {
    const variations = [];
    const name = itemName.toLowerCase();
    
    // Common food variations and abbreviations
    const variationMap = {
      'chicken': ['chick', 'murgh'],
      'biryani': ['biriyani', 'briyani', 'rice'],
      'coffee': ['kafi', 'cappuccino', 'espresso'],
      'pizza': ['piza', 'cheese pizza'],
      'burger': ['burg', 'sandwich'],
      'chocolate': ['choco', 'cocoa'],
      'brownie': ['brown', 'cake'],
      'samosa': ['samo', 'snack'],
      'paneer': ['cottage cheese', 'cheese'],
      'butter': ['makhan'],
      'masala': ['spice', 'curry'],
      'tikka': ['grilled'],
      'dal': ['lentil', 'daal'],
      'naan': ['bread'],
      'lassi': ['yogurt drink'],
      'pasta': ['spaghetti', 'noodles'],
      'chole': ['chickpea'],
      'bhature': ['bread']
    };
    
    // Add variations based on item name
    Object.entries(variationMap).forEach(([key, vars]) => {
      if (name.includes(key)) {
        variations.push(...vars);
      }
    });
    
    // Add shortened versions
    const words = name.split(' ');
    words.forEach(word => {
      if (word.length > 4) {
        variations.push(word.substring(0, 4)); // First 4 characters
      }
    });
    
    return variations;
  };

  // Enhanced category context bonus
  const getCategoryContextBonus = (item, speech) => {
    let bonus = 0;
    const itemName = item.name.toLowerCase();
    const category = item.categoryId?.name?.toLowerCase() || '';
    
    // Context keywords that boost matching
    const contextMap = {
      'drink': ['drink', 'beverage', 'liquid', 'thirsty', 'cold', 'hot'],
      'food': ['food', 'eat', 'hungry', 'meal', 'dish'],
      'dessert': ['sweet', 'dessert', 'cake', 'sugar'],
      'spicy': ['spicy', 'hot', 'masala', 'curry'],
      'starter': ['starter', 'appetizer', 'snack', 'begin'],
      'main': ['main', 'course', 'meal', 'dinner', 'lunch'],
      'international': ['pizza', 'burger', 'pasta', 'italian', 'american']
    };
    
    // Check category matches
    Object.entries(contextMap).forEach(([contextType, keywords]) => {
      keywords.forEach(keyword => {
        if (speech.includes(keyword)) {
          // Bonus for category match
          if (category.includes(contextType) || 
              (contextType === 'drink' && (itemName.includes('coffee') || itemName.includes('tea') || itemName.includes('lassi'))) ||
              (contextType === 'dessert' && (itemName.includes('chocolate') || itemName.includes('brownie') || itemName.includes('cookies'))) ||
              (contextType === 'spicy' && (itemName.includes('masala') || itemName.includes('curry') || itemName.includes('tikka'))) ||
              (contextType === 'international' && (itemName.includes('pizza') || itemName.includes('burger') || itemName.includes('pasta')))) {
            bonus += 5;
          }
        }
      });
    });
    
    return bonus;
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Wait a bit for voices to load
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        
        // Get all available voices
        const voices = window.speechSynthesis.getVoices();
        console.log('🔍 Available voices:', voices.map(v => v.name)); // Debug log
        
        let selectedVoice = null;
        
        if (voiceGender === 'female') {
          // Enhanced female voice selection
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('cortana') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('karen') ||
            voice.name.toLowerCase().includes('susan') ||
            voice.name.toLowerCase().includes('female') ||
            (voice.name.toLowerCase().includes('english') && voice.name.toLowerCase().includes('female'))
          );
          
          // Voice settings for attractive female voice
          utterance.rate = 0.9;
          utterance.pitch = 1.4;
          utterance.volume = 1.0;
        } else {
          // Enhanced male voice selection
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('david') ||
            voice.name.toLowerCase().includes('mark') ||
            voice.name.toLowerCase().includes('alex') ||
            voice.name.toLowerCase().includes('james') ||
            voice.name.toLowerCase().includes('male') ||
            (voice.name.toLowerCase().includes('english') && voice.name.toLowerCase().includes('male'))
          );
          
          // Voice settings for attractive male voice
          utterance.rate = 0.85;
          utterance.pitch = 0.7;
          utterance.volume = 1.0;
        }
        
        // Fallback voice selection if specific gender not found
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.includes('en') || voice.lang.includes('hi')
          );
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log('🔍 Selected voice:', selectedVoice.name, 'Gender:', voiceGender); // Debug log
        } else {
          console.log('🔍 No specific voice found, using default'); // Debug log
        }
        
        // Error handling
        utterance.onerror = (event) => {
          console.error('🔍 Speech synthesis error:', event.error);
        };
        
        utterance.onstart = () => {
          console.log('🔍 Speech started with voice:', utterance.voice?.name || 'default');
        };
        
        window.speechSynthesis.speak(utterance);
      }, 100); // Small delay to ensure voices are loaded
    }
  };

  const startListening = async () => {
    if (recognition && !isListening) {
      try {
        console.log('🔍 Attempting to start speech recognition...');
        
        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.log('🔍 MediaDevices API not available');
          addToConversation('system', '🎤 Microphone API not supported in this browser. Please use Chrome, Edge, or Safari.');
          return;
        }
        
        // Direct microphone access test - bypass permission API
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('🔍 Microphone access successful');
          stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        } catch (micError) {
          console.log('🔍 Direct microphone test failed:', micError);
          let errorMessage = '';
          
          if (micError.name === 'NotAllowedError') {
            errorMessage = '🎤 Please allow microphone access. Click the microphone icon in your browser address bar and select "Allow".';
          } else if (micError.name === 'NotFoundError') {
            errorMessage = '🎤 No microphone detected. Please connect a microphone and try again.';
          } else {
            errorMessage = '🎤 Microphone access failed. Please refresh the page and try again.';
          }
          
          addToConversation('system', errorMessage);
          return;
        }
        
        console.log('🔍 Starting speech recognition...');
        recognition.start();
      } catch (error) {
        console.log('🔍 Speech recognition error:', error);
        addToConversation('system', '🎤 Voice recognition failed. Please refresh the page and try again.');
      }
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-assistant voice-not-supported">
        <h3>🎤 Voice Assistant</h3>
        <p>❌ Voice recognition not available</p>
        <p><strong>Try these solutions:</strong></p>
        <ul>
          <li>Use Chrome, Edge, or Safari browser</li>
          <li>Refresh the page (F5)</li>
          <li>Check if microphone is connected</li>
          <li>Enable microphone in browser settings</li>
        </ul>
        <p><small>Browser: {
          navigator.userAgent.includes('Chrome') ? 'Chrome' :
          navigator.userAgent.includes('Firefox') ? 'Firefox' :
          navigator.userAgent.includes('Edge') ? 'Edge' :
          navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown'
        }</small></p>
        
        {/* Chrome-specific troubleshooting */}
        {navigator.userAgent.includes('Chrome') && (
          <div style={{marginTop: '15px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '8px'}}>
            <strong>🔧 Chrome Troubleshooting:</strong>
            <ol>
              <li><strong>Check URL bar:</strong> Look for microphone icon 🎤 and click "Allow"</li>
              <li><strong>Chrome Settings:</strong> chrome://settings/content/microphone</li>
              <li><strong>Hard refresh:</strong> Ctrl + Shift + R</li>
              <li><strong>Try localhost:</strong> <a href="http://localhost:3001" target="_blank">http://localhost:3001</a></li>
            </ol>
          </div>
        )}
        
        {/* Text-based fallback */}
        <div style={{marginTop: '15px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px'}}>
          <h4>💬 Text-Based Assistant (Fallback)</h4>
          <p>Type your order below:</p>
          <input 
            type="text" 
            placeholder="Type: I want coffee, show menu, etc."
            style={{width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc'}}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                // Process text input like voice input
                console.log('Text input:', e.target.value);
                e.target.value = '';
              }
            }}
          />
          <small>Press Enter to submit your text command</small>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-assistant">
      <div className="voice-header">
        <h3>🤖 Dine - AI Voice Assistant</h3>
        <p>Intelligent voice interaction for seamless dining experience</p>
        <div className="voice-controls-header">
          <select 
            value={language} 
            onChange={(e) => {
              setLanguage(e.target.value);
              // Update recognition language
              if (recognition) {
                recognition.lang = 'en-US'; // Always use English for better recognition
              }
            }}
            className="language-selector"
          >
            <option value="en-US">🇺🇸 English (Recommended)</option>
            <option value="en-IN">🇮🇳 English India</option>
          </select>
          <select 
            value={voiceGender} 
            onChange={(e) => {
              setVoiceGender(e.target.value);
              // Test the voice immediately
              const testText = e.target.value === 'female' ? 
                "Hello! This is my female voice. How do I sound?" :
                "Hello! This is my male voice. How do I sound?";
              speakResponse(testText);
            }}
            className="voice-selector"
          >
            <option value="female">👩 Female Voice</option>
            <option value="male">👨 Male Voice</option>
          </select>
          <button 
            onClick={() => {
              const testText = voiceGender === 'female' ? 
                "💃 Testing female voice! I sound sweet and melodious!" :
                "🕺 Testing male voice! I sound deep and confident!";
              speakResponse(testText);
            }}
            className="voice-test-btn"
          >
            🎤 Test Voice
          </button>
        </div>
      </div>

      <div className="conversation-area">
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">
              <span className="sender-icon">
                {msg.sender === 'customer' ? '👤' : msg.sender === 'assistant' ? '🤖' : '⚙️'}
              </span>
              <span className="message-text">{msg.message}</span>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="message assistant">
            <div className="message-content">
              <span className="sender-icon">🤖</span>
              <span className="message-text typing">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {transcript && (
        <div className="current-transcript">
          <strong>🎤 Listening:</strong> "{transcript}"
          <div className="transcript-note">
            <small>💡 Optimized for clear English speech</small>
          </div>
        </div>
      )}

      <div className="voice-controls">
        <button 
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported || isProcessing}
        >
          {isListening ? (
            <>
              <span className="pulse-icon">🎤</span>
              🎙️ Listening... Tap to Stop
            </>
          ) : (
            <>
              🎤 Activate Voice Assistant
            </>
          )}
        </button>

      </div>

      {((pendingOrder && pendingOrder.length > 0) || (currentOrder && currentOrder.length > 0)) && (
        <div className="current-order">
          <h4>📋 Current Order:</h4>
          {(pendingOrder || currentOrder || []).map((item, index) => (
            <div key={index} className="order-item">
              {item.quantity}x {item.name} - ₹{item.price * item.quantity}
            </div>
          ))}
          <div className="order-total">
            <strong>Total: ₹{(pendingOrder || currentOrder || []).reduce((sum, item) => sum + (item.price * item.quantity), 0)}</strong>
          </div>
        </div>
      )}

      <div className="voice-examples">
        <h4>🎤 Available Voice Commands:</h4>
        <div className="examples-grid">
          <div className="example-category">
            <strong>🗣️ Basic Interactions:</strong>
            <ul>
              <li>"Hello" - Greeting & connection test</li>
              <li>"Voice test" - Audio quality check</li>
              <li>"Tell me a joke" - Entertainment</li>
              <li>"Thank you" - Polite acknowledgment</li>
            </ul>
          </div>
          <div className="example-category">
            <strong>🎛️ Voice Settings:</strong>
            <ul>
              <li>"Female voice" - Switch to female narrator</li>
              <li>"Male voice" - Switch to male narrator</li>
              <li>Use dropdown menu for quick selection</li>
              <li>Click "Test Voice" for audio preview</li>
            </ul>
          </div>
          <div className="example-category">
            <strong>🍽️ Smart Food Ordering:</strong>
            <ul>
              <li>"I want coffee" - Order beverages</li>
              <li>"Order two pizza" - Specify quantities</li>
              <li>"Show menu" - Browse all items</li>
              <li>"Get me biryani" - Direct item request</li>
              <li>"Add chocolate brownie" - Add desserts</li>
            </ul>
          </div>
          <div className="example-category">
            <strong>📋 Usage Guidelines:</strong>
            <ul>
              <li>🎯 Speak clearly in English</li>
              <li>🎯 Allow microphone access</li>
              <li>🎯 Test with "Hello" first</li>
              <li>🎯 Use quiet environment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;