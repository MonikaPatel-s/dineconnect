import React, { useState, useEffect } from 'react';
import './VoiceOrdering.css';

const VoiceOrdering = ({ menuItems, onAddToCart, onVoiceSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition();
      
      // Configuration
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'hi-IN'; // Hindi + English
      
      // Event handlers
      recognitionInstance.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setFeedback('🎤 Listening... Speak now!');
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
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        setIsListening(false);
        setFeedback(`❌ Error: ${event.error}`);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    setFeedback(`🔍 Processing: "${command}"`);
    
    // Extract numbers and items
    const numbers = lowerCommand.match(/\d+/g) || [];
    const items = findMenuItems(lowerCommand);
    
    if (items.length > 0) {
      let totalAdded = 0;
      let totalPrice = 0;
      let addedItems = [];
      
      items.forEach((item, index) => {
        const quantity = numbers[index] ? parseInt(numbers[index]) : 1;
        
        // Add to cart
        for (let i = 0; i < quantity; i++) {
          onAddToCart(item);
        }
        
        totalAdded += quantity;
        totalPrice += item.price * quantity;
        addedItems.push(`${quantity} ${item.name}`);
      });
      
      // Voice feedback
      const feedbackText = `✅ Added ${addedItems.join(', ')} to cart. Total: ₹${totalPrice}`;
      setFeedback(feedbackText);
      speakFeedback(feedbackText);
      
    } else if (lowerCommand.includes('show') || lowerCommand.includes('search')) {
      // Voice search
      onVoiceSearch(lowerCommand);
      setFeedback(`🔍 Searching for: "${command}"`);
    } else {
      setFeedback(`❓ Sorry, couldn't understand. Try saying "2 biryani" or "show me drinks"`);
    }
  };

  const findMenuItems = (command) => {
    const foundItems = [];
    
    menuItems.forEach(item => {
      const itemName = item.name.toLowerCase();
      const itemWords = itemName.split(' ');
      
      // Check if any word from item name is in command
      const hasMatch = itemWords.some(word => 
        command.includes(word) || 
        command.includes(word.substring(0, 4)) // Partial match
      );
      
      // Also check for common Hindi/English food terms
      const foodTerms = {
        'biryani': ['biryani', 'biriyani', 'rice'],
        'chicken': ['chicken', 'murgh'],
        'mutton': ['mutton', 'goat', 'bakra'],
        'dal': ['dal', 'lentil'],
        'roti': ['roti', 'chapati', 'bread'],
        'lassi': ['lassi', 'drink'],
        'tea': ['tea', 'chai'],
        'coffee': ['coffee', 'kafi']
      };
      
      Object.entries(foodTerms).forEach(([key, terms]) => {
        if (itemName.includes(key) && terms.some(term => command.includes(term))) {
          if (!foundItems.includes(item)) {
            foundItems.push(item);
          }
        }
      });
      
      if (hasMatch && !foundItems.includes(item)) {
        foundItems.push(item);
      }
    });
    
    return foundItems;
  };

  const speakFeedback = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-ordering voice-not-supported">
        <p>❌ Voice ordering not supported in this browser</p>
        <p>Try Chrome, Edge, or Safari</p>
      </div>
    );
  }

  return (
    <div className="voice-ordering">
      <div className="voice-controls">
        <button 
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={!isSupported}
        >
          {isListening ? (
            <>
              <span className="pulse-icon">🎤</span>
              Stop Listening
            </>
          ) : (
            <>
              🎤 Voice Order
            </>
          )}
        </button>
      </div>
      
      {transcript && (
        <div className="voice-transcript">
          <strong>You said:</strong> "{transcript}"
        </div>
      )}
      
      {feedback && (
        <div className="voice-feedback">
          {feedback}
        </div>
      )}
      
      <div className="voice-examples">
        <h4>💡 Try saying:</h4>
        <ul>
          <li>"2 chicken biryani"</li>
          <li>"1 mango lassi aur 2 roti"</li>
          <li>"Show me drinks"</li>
          <li>"Add dal to cart"</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceOrdering;