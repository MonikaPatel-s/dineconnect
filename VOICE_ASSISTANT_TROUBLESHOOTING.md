# 🎤 Voice Assistant Troubleshooting Guide

## ❌ Common Issues & Solutions

### 1. "Sorry, I couldn't hear you clearly" Error

**Possible Causes:**
- Microphone permission denied
- No microphone connected
- Browser not supported
- Network issues

**Solutions:**
1. **Check Microphone Permission:**
   - Look for microphone icon in browser address bar
   - Click and select "Allow"
   - Refresh the page

2. **Browser Compatibility:**
   - ✅ Chrome (Recommended)
   - ✅ Edge
   - ✅ Safari
   - ❌ Firefox (Limited support)

3. **HTTPS Requirement:**
   - Voice recognition only works on HTTPS or localhost
   - Current setup: `http://10.235.195.51:3001` ✅

### 2. Microphone Not Working

**Check Steps:**
1. **Hardware:**
   - Ensure microphone is connected
   - Test microphone in other apps
   - Check volume levels

2. **Browser Settings:**
   - Go to browser settings
   - Find "Privacy & Security" → "Site Settings"
   - Check microphone permissions

3. **Windows Settings:**
   - Go to Settings → Privacy → Microphone
   - Ensure browser has microphone access

### 3. Voice Commands Not Recognized

**Tips for Better Recognition:**
1. **Speak Clearly:**
   - Use normal speaking pace
   - Avoid background noise
   - Speak directly into microphone

2. **Use Simple Commands:**
   - ✅ "I want coffee"
   - ✅ "Order two pizza"
   - ✅ "Show menu"
   - ❌ Complex sentences

3. **Wait for Response:**
   - Let assistant finish speaking
   - Wait for microphone icon to be ready

## 🔧 Debug Mode

**Open Browser Console (F12) to see:**
- Microphone permission status
- Speech recognition errors
- Available voices
- Recognition results

## 🎯 Test Commands

**Basic Commands:**
- "Hello Dine"
- "Show menu"
- "I want coffee"
- "Tell me a joke"
- "Voice test"

**Ordering Commands:**
- "I want [item name]"
- "Order two [item name]"
- "Add [item name] to cart"
- "Place my order"

## 📱 Mobile Considerations

**Mobile Browser Support:**
- ✅ Chrome Mobile
- ✅ Safari Mobile
- ❌ Firefox Mobile
- ❌ In-app browsers (Instagram, Facebook)

**Mobile Tips:**
- Use external browser (not in-app)
- Ensure microphone permission granted
- Speak close to device microphone

## 🆘 Still Not Working?

1. **Refresh the page**
2. **Clear browser cache**
3. **Try different browser**
4. **Check browser console for errors**
5. **Test on different device**

## ✅ Success Indicators

**Voice Assistant is working when:**
- Microphone icon appears in browser
- "Listening..." animation shows
- Console shows recognition results
- Assistant responds to commands

---

**Need Help?** Check browser console (F12) for detailed error messages!