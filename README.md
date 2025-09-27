# Reddit AI Comment Helper

Reddit AI Comment Helper is a Chrome Extension that uses Google's Gemini AI to generate thoughtful, context-aware comment suggestions for Reddit posts. It helps you draft comments quickly without ever auto-posting, giving you full control.

![Extension Popup Screenshot](https://i.imgur.com/your-screenshot-url.png) <!-- TODO: Replace with an actual screenshot -->

## Features

- **AI-Powered Suggestions**: Extracts the title and body of a Reddit post and sends it to Google Gemini for a relevant comment suggestion.
- **User-Controlled**: **Does not auto-post.** Generated comments are displayed in a textarea for you to review, copy, and paste manually.
- **Secure**: Your Google Gemini API key is stored locally and securely using `chrome.storage.local` and is only sent directly to Google's servers.
- **Customizable**: A dedicated options page to manage your API key.
- **Error Handling**: Provides clear feedback if the API key is missing, if there's a network error, or if content can't be extracted from the page.

---

## Installation

Since this extension is not on the Chrome Web Store, you need to install it as an unpacked extension.

1.  **Download the code**: Clone this repository or download it as a ZIP file and unzip it to a permanent location on your computer.
2.  **Open Chrome Extensions**: Open Google Chrome and navigate to `chrome://extensions`.
3.  **Enable Developer Mode**: In the top-right corner of the Extensions page, toggle the "Developer mode" switch to **On**.
4.  **Load the Extension**:
    *   Click the **"Load unpacked"** button that appears on the top-left.
    *   In the file dialog, navigate to the folder where you saved the extension files.
    *   Select the entire folder (the one containing `manifest.json`).
5.  The "Reddit AI Comment Helper" should now appear in your list of extensions.

---

## Configuration: Getting Your Google Gemini API Key

To use this extension, you must provide your own Google Gemini API key.

### Step 1: Get an API Key

1.  **Go to Google AI Studio**: Visit the official site to get your key: **[https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)**.
2.  **Create a New API Key**:
    *   You may need to sign in with your Google account.
    *   Click the "**Create API key in new project**" button.
    *   Your new API key will be generated and displayed. Copy this key to your clipboard.

**Security Warning**: Treat your API key like a password. Do not share it publicly. If you suspect it has been compromised, you should immediately go back to the Google AI Studio, revoke the old key, and generate a new one.

### Step 2: Save the API Key in the Extension

1.  **Open Extension Options**:
    *   Right-click the Reddit AI Comment Helper icon in your Chrome toolbar.
    *   Select "Options" from the menu.
    *   Alternatively, go to `chrome://extensions`, find the extension, and click "Details", then "Extension options".
2.  **Paste Your Key**: In the settings page, paste your copied API key into the input box.
3.  **Save**: Click the "Save" button.

You are now ready to use the extension!

---

## How to Use

1.  Navigate to any Reddit post page (e.g., `https://www.reddit.com/r/some-subreddit/comments/...`).
2.  Click the Reddit AI Comment Helper icon in your Chrome toolbar to open the popup.
3.  Click the **"Generate Comment"** button.
4.  A loading spinner will appear while the AI generates a suggestion.
5.  The suggested comment will appear in the text area.
6.  Click the **"Copy to Clipboard"** button and paste the comment into the Reddit comment box.

---

## Technical Details & API Information

This extension uses the official Google Generative AI REST API.

-   **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
-   **Model**: `gemini-1.5-flash` was chosen for its balance of speed and capability, making it ideal for this interactive use case.
-   **Authentication**: The API key is sent in the `?key=` query parameter, as per the REST API documentation for simple use cases.
-   **Official Documentation**: For more details on the API, refer to the [Google AI for Developers documentation](https://ai.google.dev/gemini-api/docs).

### How to Test Manually

1.  Ensure your API key is set in the extension options.
2.  Open a Reddit post in your browser.
3.  Open the developer tools (F12 or Ctrl+Shift+I).
4.  Open the extension popup and click "Generate Comment".
5.  Observe the "Network" tab in the developer tools for a `POST` request to the `generativelanguage.googleapis.com` endpoint.
6.  Check the "Console" tab for any errors logged by the extension.
7.  Verify that a suggested comment appears in the popup UI.