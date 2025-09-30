# Reddit AI Comment Helper

A Chrome Extension that uses Google Gemini AI to generate thoughtful, contextual comments for Reddit posts. **Never auto-posts** - only suggests comments for manual review and copy-paste.

![Extension Icon](icons/icon128.svg)

## 🚀 Features

- **AI-Powered Comments**: Uses Google Gemini 1.5 Flash to generate contextual, thoughtful comments
- **Smart Content Extraction**: Automatically extracts post titles and content from Reddit pages
- **Manual Review**: All generated comments require manual review - never auto-posts
- **Clean UI**: Modern, intuitive interface with loading states and error handling
- **Secure Storage**: API keys stored locally in browser storage
- **Privacy-Focused**: Only sends post content to Google's official API

## 📋 Requirements

- Google Chrome browser
- Google Gemini API key (free tier available)
- Active internet connection

## 🛠️ Installation

### Step 1: Download the Extension

1. Clone or download this repository
2. Extract the files to a local directory

### Step 2: Load as Unpacked Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the extension directory containing `manifest.json`
5. The extension should now appear in your extensions list

### Step 3: Get Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 4: Configure the Extension

1. Click the extension icon in your browser toolbar
2. Click "⚙️ Settings & API Key"
3. Paste your API key in the "Google Gemini API Key" field
4. Click "💾 Save API Key"
5. Click "🧪 Test API Key" to verify it works

## 🎯 Usage

### Basic Usage

1. Navigate to any Reddit post (e.g., `https://www.reddit.com/r/AskReddit/comments/...`)
2. Click the extension icon in your browser toolbar
3. Click "Generate Comment" button
4. Wait for the AI to generate a comment (usually 2-5 seconds)
5. Review the generated comment in the text area
6. Click "📋 Copy" to copy the comment to clipboard
7. Paste the comment manually into Reddit's comment box

### Supported Post Types

- **Text Posts**: Extracts title and body text
- **Link Posts**: Extracts title and link information
- **Image/Video Posts**: Extracts title and adds context note
- **Cross-posts**: Works with most Reddit post formats

## 🔧 Configuration

### API Settings

The extension uses Google Gemini 1.5 Flash model with the following settings:

- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Authentication**: API key via query parameter
- **Max Tokens**: 256 (configurable)
- **Temperature**: 0.7 (for balanced creativity/consistency)
- **Safety Settings**: Medium threshold for all harm categories

### Storage Options

- **Chrome Storage Local**: API keys stored locally (recommended)
- **Chrome Storage Sync**: Available but not recommended for API keys (size limits)

## 🔒 Security & Privacy

### What Data is Sent to Google

- **Post Title**: The Reddit post title
- **Post Body**: The main post content (truncated to 8000 chars)
- **No Personal Data**: No user information, browsing history, or other data

### Data Storage

- **Local Storage**: API keys stored using Chrome's secure storage API
- **No Third-Party Servers**: Data only sent to Google's official Gemini API
- **No Auto-Posting**: Extension never posts to Reddit automatically

### API Key Security

- Store your API key securely
- Don't share screenshots containing your API key
- Rotate your API key periodically
- Use Chrome's developer mode responsibly

## 🐛 Troubleshooting

### Common Issues

**"Could not extract post content"**

- Make sure you're on a Reddit post page (not the homepage)
- Refresh the page and try again
- Check if Reddit has updated their layout

**"API key not found"**

- Go to extension settings and verify your API key is saved
- Test your API key using the "Test API Key" button
- Make sure you're using a valid Gemini API key

**"Network error"**

- Check your internet connection
- Verify you can access `https://generativelanguage.googleapis.com`
- Try again after a few minutes

**"API request failed"**

- Check your API key quota and billing
- Verify the API key has Gemini API access enabled
- Check Google Cloud Console for any restrictions

### Debug Mode

1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Look for error messages when using the extension
4. Check the Network tab for failed API requests

## 🧪 Testing

### Manual Testing Procedure

1. **Install Extension**: Load as unpacked extension
2. **Configure API**: Set up API key in settings
3. **Test API Connection**: Use "Test API Key" button
4. **Test on Reddit**: Navigate to various Reddit posts
5. **Generate Comments**: Test different post types
6. **Verify Output**: Check comment quality and relevance

### Sample Test Cases

**Text Post**: Navigate to `r/AskReddit` and find a text-based question
**Link Post**: Find a post linking to an external article
**Image Post**: Find an image post in `r/pics` or similar
**Video Post**: Find a video post in `r/videos`

### Expected Behavior

- ✅ Extracts post title and content
- ✅ Generates relevant, contextual comments
- ✅ Shows loading states during generation
- ✅ Handles errors gracefully
- ✅ Copies comments to clipboard

## 📚 API Documentation

### Google Gemini API

- **Official Docs**: [Google Generative AI Documentation](https://cloud.google.com/docs/generative-ai)
- **API Reference**: [Generative AI API Reference](https://cloud.google.com/docs/generative-ai/reference)
- **Getting Started**: [Quickstart Guide](https://cloud.google.com/docs/generative-ai/quickstart)
- **Pricing**: [Generative AI Pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing)

### Request Format

```javascript
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY

{
  "contents": [{
    "parts": [{
      "text": "Your prompt here..."
    }]
  }],
  "generationConfig": {
    "maxOutputTokens": 256,
    "temperature": 0.7,
    "topP": 0.8,
    "topK": 40
  },
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
}
```

## 🔄 Updates & Maintenance

### Updating the Extension

1. Download the latest version
2. Replace the extension files
3. Reload the extension in `chrome://extensions/`
4. Test with your existing API key

### API Key Rotation

1. Generate a new API key in Google AI Studio
2. Update the key in extension settings
3. Test the new key
4. Revoke the old key (optional but recommended)

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Load as unpacked extension in Chrome
3. Make changes to the code
4. Reload the extension to test changes
5. Test thoroughly before submitting

### Code Structure

```
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
├── content.js            # Reddit content extraction
├── options.html          # Settings page
├── options.js            # Settings functionality
├── icons/                # Extension icons
│   ├── icon16.png        # 16x16 toolbar icon
│   ├── icon48.png        # 48x48 management icon
│   ├── icon128.png       # 128x128 store icon
│   ├── *.svg             # Vector versions
│   └── generate_png.html # Icon generator tool
└── README.md             # This file
```

### Key Functions

- **`extractPostContent()`**: Extracts Reddit post data
- **`generateCommentWithGemini()`**: Calls Google Gemini API
- **`handleGenerateComment()`**: Main popup interaction handler
- **`testApiConnection()`**: Validates API key functionality

## 📄 License

This project is open source and available under the MIT License.

## ⚠️ Disclaimer

- This extension is not affiliated with Reddit or Google
- Generated comments are suggestions only - always review before posting
- Users are responsible for their own comments and Reddit account usage
- API usage may incur costs according to Google's pricing
- The extension is provided "as is" without warranty

## 🆘 Support

### Getting Help

1. Check the troubleshooting section above
2. Review the API documentation links
3. Test with the sample test cases
4. Check Chrome DevTools for error messages

### Reporting Issues

When reporting issues, please include:

- Chrome version
- Extension version
- Steps to reproduce
- Error messages from DevTools console
- Type of Reddit post being tested

---

**Happy commenting! 🚀**

Remember: This extension helps you generate ideas for Reddit comments, but you should always review and edit the suggestions before posting. Be respectful, follow Reddit's rules, and contribute meaningfully to discussions.
