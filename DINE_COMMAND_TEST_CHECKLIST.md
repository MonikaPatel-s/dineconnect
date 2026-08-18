# 🧪 Dine Voice Assistant - Complete Command Test Checklist

## 🎯 **Testing All Dine Commands**

### **🔧 Pre-Test Setup:**
1. **✅ Server Running:** `http://100.102.185.246:5001`
2. **✅ Client Running:** `http://100.102.185.246:3001`
3. **✅ Open Customer Dashboard → Click "🎤 Dine" tab**
4. **✅ Open Browser Console (F12) for debug logs**

---

## 🎤 **Voice Command Tests:**

### **1. 🎯 Basic Recognition Test**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "hello" | "Hello! I can hear you perfectly!" | ⏳ Test |
| "hi" | "Hello! I can hear you perfectly!" | ⏳ Test |
| "test" | "Hello! I can hear you perfectly!" | ⏳ Test |

### **2. 🎤 Voice Control Tests**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "female voice" | Switches to female + test message | ⏳ Test |
| "male voice" | Switches to male + test message | ⏳ Test |
| "voice test" | Tests current voice | ⏳ Test |
| Click "🎤 Test Voice" button | Tests current voice | ⏳ Test |

### **3. 🌐 Language Control Tests**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "english" | "Switched to English!" | ⏳ Test |
| "hindi" | "Hindi mein switch ho gaya!" | ⏳ Test |

### **4. 🍽️ Menu Item Tests**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "I want coffee" | Adds coffee to cart | ⏳ Test |
| "I want biryani" | Adds biryani to cart | ⏳ Test |
| "I want pizza" | Adds pizza to cart | ⏳ Test |
| "Order samosa" | Adds samosa to cart | ⏳ Test |
| "Chocolate chahiye" | Adds chocolate item to cart | ⏳ Test |
| "Paneer butter masala" | Adds paneer dish to cart | ⏳ Test |

### **5. 🎪 Fun Commands Tests**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "joke" | Tells a food joke | ⏳ Test |
| "tell me a joke" | Tells a food joke | ⏳ Test |
| "funny" | Tells a food joke | ⏳ Test |

### **6. 🔍 Menu Inquiry Tests**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "what do you have" | Lists menu categories/items | ⏳ Test |
| "show all items" | Lists all menu items | ⏳ Test |
| "menu dikhao" | Shows menu in Hindi | ⏳ Test |
| "kya available hai" | Shows available items | ⏳ Test |

### **7. 🌅 Time-based Greetings Tests**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "good morning" | Morning greeting + breakfast suggestion | ⏳ Test |
| "good evening" | Evening greeting + dinner suggestion | ⏳ Test |
| "suprabhat" | Hindi morning greeting | ⏳ Test |

### **8. 🙏 Social Interaction Tests**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "thank you" | "You're most welcome!" | ⏳ Test |
| "thanks" | "You're most welcome!" | ⏳ Test |
| "shukriya" | Hindi thank you response | ⏳ Test |

### **9. 🔍 Recommendation Tests**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "recommend" | Suggests popular items | ⏳ Test |
| "kya khau" | Hindi recommendation | ⏳ Test |
| "what should i eat" | Food recommendations | ⏳ Test |

### **10. 🎭 Greeting Tests**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "hey dine" | Greeting response | ⏳ Test |
| "hi dine" | Greeting response | ⏳ Test |
| "hello dine" | Greeting response | ⏳ Test |

---

## 🔧 **Debug Console Tests:**

### **Expected Console Logs:**
```
🔍 Debug - Processing input: "[command]"
🔍 Available voices: [list of voices]
🔍 Selected voice: [voice name] Gender: [male/female]
🔍 Debug - Analyzing speech: "[command]"
🔍 Debug - Available menu items: [list of items]
🔍 Debug - Final found items: [matched items]
```

---

## 🚨 **Error Scenarios Tests:**

### **Fallback Tests:**
| Command | Expected Response | Status |
|---------|------------------|--------|
| "blah blah blah" | "I heard you, but I'm not sure..." | ⏳ Test |
| Random gibberish | Fallback response | ⏳ Test |
| Unclear speech | Helpful suggestion | ⏳ Test |

---

## 📊 **Test Results Summary:**

### **✅ Working Commands:**
- [ ] Basic Recognition (hello, hi, test)
- [ ] Voice Control (male/female voice)
- [ ] Language Control (English/Hindi)
- [ ] Menu Items (coffee, biryani, pizza, etc.)
- [ ] Fun Commands (jokes)
- [ ] Menu Inquiry (show items, menu)
- [ ] Greetings (good morning/evening)
- [ ] Social (thank you, recommendations)
- [ ] Dine Greetings (hey dine, hi dine)
- [ ] Error Handling (fallback responses)

### **❌ Issues Found:**
- [ ] None (hopefully!)

### **🔧 Debug Info:**
- [ ] Console logs working
- [ ] Voice selection working
- [ ] Menu item recognition working
- [ ] Error handling working

---

## 🎯 **Quick Test Script:**

**Run these commands in sequence:**
1. "hello" → Should respond
2. "male voice" → Should switch voice
3. "I want coffee" → Should add to cart
4. "joke" → Should tell joke
5. "show all items" → Should list menu
6. "thank you" → Should respond politely

**If all 6 work, Dine is fully functional!** ✅

---

## 📱 **Mobile Test:**
- [ ] Test on mobile browser
- [ ] Voice recognition works on mobile
- [ ] Touch controls work
- [ ] Cart integration works

**Status: 🧪 READY FOR COMPREHENSIVE TESTING**