/**
 * Reddit AI Comment Helper - Popup Script
 * 
 * This script handles the popup UI interactions and communicates with:
 * - Content script to extract Reddit post data
 * - Google Gemini API to generate comments
 * - Chrome storage to retrieve API keys
 */

// DOM elements
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const commentOutput = document.getElementById('commentOutput');
const statusBar = document.getElementById('statusBar');
const statusText = document.getElementById('statusText');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');
const closeError = document.getElementById('closeError');
const errorOk = document.getElementById('errorOk');

// State management
let isGenerating = false;
let currentComment = '';

/**
 * Initialize the popup
 */
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await checkApiKeyStatus();
});

/**
 * Set up event listeners
 */
function setupEventListeners() {
    generateBtn.addEventListener('click', handleGenerateComment);
    copyBtn.addEventListener('click', handleCopyComment);
    closeError.addEventListener('click', hideError);
    errorOk.addEventListener('click', hideError);
    
    // Close modal on outside click
    errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) {
            hideError();
        }
    });
}

/**
 * Check if API key is configured
 */
async function checkApiKeyStatus() {
    try {
        const result = await chrome.storage.local.get(['apiKey']);
        if (!result.apiKey) {
            updateStatus('API key not configured', 'error');
            generateBtn.disabled = true;
            showError('Please configure your Google Gemini API key in the settings first.');
        } else {
            updateStatus('Ready to generate comment', 'success');
        }
    } catch (error) {
        console.error('Error checking API key:', error);
        updateStatus('Error checking configuration', 'error');
    }
}

/**
 * Handle generate comment button click
 */
async function handleGenerateComment() {
    if (isGenerating) return;
    
    try {
        isGenerating = true;
        setLoadingState(true);
        updateStatus('Extracting post content...', 'loading');
        
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.url || !tab.url.includes('reddit.com')) {
            throw new Error('Please navigate to a Reddit post first.');
        }
        
        // Extract post content using content script
        const postData = await extractPostContent(tab.id);
        
        if (!postData || !postData.title) {
            throw new Error('Could not extract post content. Please make sure you are on a Reddit post page.');
        }
        
        updateStatus('Generating comment with AI...', 'loading');
        
        // Get API key and generate comment
        const apiKey = await getApiKey();
        if (!apiKey) {
            throw new Error('API key not found. Please configure it in settings.');
        }
        
        const comment = await generateCommentWithGemini(postData, apiKey);
        
        // Display the generated comment
        commentOutput.value = comment;
        currentComment = comment;
        copyBtn.disabled = false;
        
        updateStatus('Comment generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating comment:', error);
        showError(error.message || 'Failed to generate comment. Please try again.');
        updateStatus('Error occurred', 'error');
    } finally {
        isGenerating = false;
        setLoadingState(false);
    }
}

/**
 * Extract post content from Reddit page
 */
async function extractPostContent(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, { action: 'getPost' }, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error('Could not communicate with Reddit page. Please refresh and try again.'));
                return;
            }
            
            if (!response || !response.title) {
                reject(new Error('Could not extract post content. Make sure you are viewing a Reddit post.'));
                return;
            }
            
            resolve(response);
        });
    });
}

/**
 * Generate comment using Google Gemini API
 * 
 * Based on official Google Generative AI documentation:
 * https://cloud.google.com/docs/generative-ai
 * 
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
 * Authentication: API key via query parameter
 */
async function generateCommentWithGemini(postData, apiKey) {
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    // Truncate very long content to respect API limits
    const maxContentLength = 8000; // Conservative limit
    let title = postData.title.substring(0, maxContentLength);
    let body = postData.body ? postData.body.substring(0, maxContentLength) : '';
    
    if (postData.title.length > maxContentLength) {
        title += '\n\n[Content truncated for length]';
    }
    if (postData.body && postData.body.length > maxContentLength) {
        body += '\n\n[Content truncated for length]';
    }
    
    // Get custom system prompt from storage
    const systemPrompt = await getSystemPrompt();
    
    // Replace placeholders in the prompt with actual content
    const prompt = systemPrompt
        .replace(/\{title\}/g, title)
        .replace(/\{body\}/g, body);

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            maxOutputTokens: 256,
            temperature: 0.7,
            topP: 0.8,
            topK: 40
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };

    try {
        const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response generated. The content might have been filtered by safety settings.');
        }

        const candidate = data.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            throw new Error('Invalid response format from API.');
        }

        return candidate.content.parts[0].text.trim();

    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection and try again.');
        }
        throw error;
    }
}

/**
 * Handle copy button click
 */
async function handleCopyComment() {
    if (!currentComment) return;
    
    try {
        await navigator.clipboard.writeText(currentComment);
        
        // Show success feedback
        const originalText = copyBtn.querySelector('.btn-text').textContent;
        copyBtn.querySelector('.btn-text').textContent = 'Copied!';
        copyBtn.querySelector('.btn-success').style.display = 'inline';
        
        setTimeout(() => {
            copyBtn.querySelector('.btn-text').textContent = originalText;
            copyBtn.querySelector('.btn-success').style.display = 'none';
        }, 2000);
        
        updateStatus('Comment copied to clipboard!', 'success');
        
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        showError('Failed to copy to clipboard. You can manually select and copy the text.');
    }
}

/**
 * Get API key from storage
 */
async function getApiKey() {
    try {
        const result = await chrome.storage.local.get(['apiKey']);
        return result.apiKey;
    } catch (error) {
        console.error('Error retrieving API key:', error);
        return null;
    }
}

/**
 * Get system prompt from storage
 */
async function getSystemPrompt() {
    try {
        const result = await chrome.storage.local.get(['systemPrompt']);
        if (result.systemPrompt) {
            return result.systemPrompt;
        } else {
            // Return default prompt if none is stored
            return `You are a helpful Reddit commenter. Generate a concise, thoughtful, polite comment that adds value to this Reddit post. Keep it natural and tailored to the post context.

Post Title: {title}

Post Body: {body}

Instructions: 
- Write a comment between 30-120 words
- Add value to the discussion
- Be respectful and constructive
- Optionally ask a follow-up question
- Avoid profanity, abuse, or controversial topics
- Keep the tone conversational and natural
- Don't mention that you're an AI

Generate only the comment text, no additional formatting or explanations.`;
        }
    } catch (error) {
        console.error('Error retrieving system prompt:', error);
        // Return default prompt on error
        return `You are a helpful Reddit commenter. Generate a concise, thoughtful, polite comment that adds value to this Reddit post. Keep it natural and tailored to the post context.

Post Title: {title}

Post Body: {body}

Instructions: 
- Write a comment between 30-120 words
- Add value to the discussion
- Be respectful and constructive
- Optionally ask a follow-up question
- Avoid profanity, abuse, or controversial topics
- Keep the tone conversational and natural
- Don't mention that you're an AI

Generate only the comment text, no additional formatting or explanations.`;
    }
}

/**
 * Update status bar
 */
function updateStatus(message, type = 'default') {
    statusText.textContent = message;
    statusBar.className = `status-bar ${type}`;
}

/**
 * Set loading state for generate button
 */
function setLoadingState(loading) {
    generateBtn.disabled = loading;
    const btnText = generateBtn.querySelector('.btn-text');
    const btnSpinner = generateBtn.querySelector('.btn-spinner');
    
    if (loading) {
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline';
    } else {
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
    }
}

/**
 * Show error modal
 */
function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
}

/**
 * Hide error modal
 */
function hideError() {
    errorModal.style.display = 'none';
}
