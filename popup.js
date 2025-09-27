document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-btn');
  const copyBtn = document.getElementById('copy-btn');
  const loadingSpinner = document.getElementById('loading-spinner');
  const resultContainer = document.getElementById('result-container');
  const commentResultTextarea = document.getElementById('comment-result');
  const errorMessageDiv = document.getElementById('error-message');
  const copyStatus = document.getElementById('copy-status');

  /**
   * Handles the main logic when the "Generate Comment" button is clicked.
   */
  generateBtn.addEventListener('click', async () => {
    clearState();
    showLoading(true);

    try {
      // 1. Get API Key from storage
      const { apiKey } = await chrome.storage.local.get('apiKey');
      if (!apiKey) {
        throw new Error('API Key not found. Please set your Google Gemini API key in the options page.');
      }

      // 2. Get post content from the active tab
      const postContent = await getPostContentFromActiveTab();
      if (postContent.error) {
        throw new Error(postContent.error);
      }

      // 3. Call the Gemini API to generate the comment
      const generatedComment = await callGeminiApi(apiKey, postContent.title, postContent.body);

      // 4. Display the result
      showResult(generatedComment);

    } catch (error) {
      console.error('Error generating comment:', error);
      showError(error.message);
    } finally {
      showLoading(false);
    }
  });

  /**
   * Handles copying the generated comment to the clipboard.
   */
  copyBtn.addEventListener('click', () => {
    commentResultTextarea.select();
    navigator.clipboard.writeText(commentResultTextarea.value)
      .then(() => {
        copyStatus.textContent = 'Copied to clipboard!';
        setTimeout(() => {
          copyStatus.textContent = '';
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        copyStatus.textContent = 'Failed to copy.';
      });
  });

  /**
   * Communicates with the content script to get the post details.
   * @returns {Promise<{title: string, body: string}|{error: string}>}
   */
  function getPostContentFromActiveTab() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          return reject(new Error("Could not find active tab."));
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: "getPost" }, (response) => {
          if (chrome.runtime.lastError) {
            // This can happen if the content script is not injected, e.g., on a non-Reddit page.
            return reject(new Error("Could not connect to the page. Make sure you are on a Reddit post page and reload if necessary."));
          }
          resolve(response);
        });
      });
    });
  }

  /**
   * Calls the Google Gemini API.
   * @param {string} apiKey - The user's API key.
   * @param {string} title - The title of the Reddit post.
   * @param {string} body - The body of the Reddit post.
   * @returns {Promise<string>} The generated comment text.
   */
  async function callGeminiApi(apiKey, title, body) {
    // TODO: This endpoint and model should be confirmed from official Google AI docs.
    // As of late 2025, `gemini-1.5-flash` is a good choice for this use case.
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = "You are a helpful Reddit commenter. Generate a concise, thoughtful, polite comment that adds value to this Reddit post. Keep it natural and tailored to the post context.";
    const userPrompt = `Post Title: ${title}\n\nPost Body: ${body}\n\nInstructions: Write a comment between 30-120 words that adds value, optionally asks a follow-up question, and avoids profanity or abuse.`;

    const requestBody = {
      "contents": [
        {
          "parts": [
            { "text": systemPrompt },
            { "text": userPrompt }
          ]
        }
      ],
      "generationConfig": {
        "maxOutputTokens": 256,
        "temperature": 0.7,
        "topP": 1.0,
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Safely access the generated text
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('Invalid response structure from Gemini API:', data);
      throw new Error('Could not parse the response from the AI. The response format might have changed.');
    }

    return text.trim();
  }

  // --- UI Helper Functions ---

  function showLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? 'block' : 'none';
    generateBtn.disabled = isLoading;
  }

  function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
  }

  function showResult(comment) {
    commentResultTextarea.value = comment;
    resultContainer.style.display = 'flex';
  }

  function clearState() {
    errorMessageDiv.style.display = 'none';
    resultContainer.style.display = 'none';
    commentResultTextarea.value = '';
    copyStatus.textContent = '';
  }
});