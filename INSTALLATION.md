# 🚀 Quick Installation Guide

## Reddit AI Comment Helper Chrome Extension

This guide will help you install and configure the Reddit AI Comment Helper extension in just a few minutes.

## 📦 Files Included

```
reddit-ai-comment-generator/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality & API integration
├── popup.css             # Modern UI styling
├── content.js            # Reddit content extraction
├── options.html          # Settings page
├── options.js            # Settings functionality
├── icons/                # Extension icons (PNG & SVG)
│   ├── icon16.png        # Browser toolbar icon
│   ├── icon48.png        # Extension management icon
│   ├── icon128.png       # Chrome Web Store icon
│   ├── *.svg             # Vector versions
│   └── generate_png.html # Icon generator tool
├── README.md             # Comprehensive documentation
├── test.html             # Testing page
└── INSTALLATION.md       # This file
```

## ⚡ Quick Start (5 minutes)

### 1. Install Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `reddit-ai-comment-generator` folder
5. ✅ Extension should appear in your toolbar

### 2. Get API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

### 3. Configure Extension

1. Click the extension icon in toolbar
2. Click "⚙️ Settings & API Key"
3. Paste your API key
4. Click "💾 Save API Key"
5. Click "🧪 Test API Key" to verify

### 4. Test It Out

1. Go to any Reddit post (e.g., r/AskReddit)
2. Click the extension icon
3. Click "Generate Comment"
4. Copy the generated comment
5. Paste it into Reddit manually

## 🔧 Google Gemini API Setup

### Official Documentation

- **Get API Key**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **API Docs**: [Generative AI Documentation](https://cloud.google.com/docs/generative-ai)
- **Pricing**: [Generative AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)

### API Endpoint Used

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY
```

### Request Format

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Your prompt here..."
        }
      ]
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 256,
    "temperature": 0.7
  }
}
```

## 🧪 Testing

### Test Page

Open `test.html` in your browser for a comprehensive testing interface with sample Reddit links.

### Manual Testing Steps

1. **Text Posts**: Navigate to r/AskReddit and test with question posts
2. **Link Posts**: Test with r/technology or r/science posts
3. **Image Posts**: Test with r/pics posts
4. **Error Cases**: Test with Reddit homepage (should show error)

### Expected Results

- ✅ Extracts post title and content
- ✅ Generates relevant comments (30-120 words)
- ✅ Shows loading states
- ✅ Handles errors gracefully
- ✅ Copies comments to clipboard

## 🐛 Troubleshooting

### Common Issues

**"Could not extract post content"**

- Make sure you're on a Reddit post page
- Refresh the page and try again
- Check if Reddit layout has changed

**"API key not found"**

- Go to extension settings
- Verify API key is saved
- Test API key using the test button

**"Network error"**

- Check internet connection
- Verify API endpoint accessibility
- Check Chrome DevTools Console

### Debug Mode

1. Press F12 to open DevTools
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

## 🔒 Security Notes

### What Data is Sent

- **Only**: Reddit post title and body text
- **Never**: Personal info, browsing history, or other data

### API Key Security

- Stored locally in Chrome storage
- Only sent to Google's official API
- Never shared with third parties

### Privacy

- Extension never auto-posts to Reddit
- All comments require manual review
- User maintains full control

## 📱 Browser Compatibility

- ✅ Chrome (Manifest V3)
- ❌ Firefox (different manifest format)
- ❌ Safari (different extension system)
- ❌ Edge (may work with modifications)

## 🆘 Support

### Getting Help

1. Check the troubleshooting section
2. Review the comprehensive README.md
3. Test with the provided test.html
4. Check Chrome DevTools for errors

### Key Files for Debugging

- `popup.js` - Main functionality and API calls
- `content.js` - Reddit content extraction
- `options.js` - API key management
- `manifest.json` - Extension configuration

## 🎯 Next Steps

1. **Install and Configure**: Follow the quick start guide above
2. **Test Thoroughly**: Use the test page and sample Reddit posts
3. **Customize**: Modify prompts in `popup.js` if desired
4. **Share**: Help others by sharing this extension

## ⚠️ Important Reminders

- **Never auto-posts**: Always review generated comments
- **Follow Reddit rules**: Be respectful and constructive
- **API costs**: Monitor your Google AI usage
- **Update regularly**: Keep the extension updated

---

**Ready to generate thoughtful Reddit comments with AI? Let's get started! 🚀**
