/**
 * Reddit AI Comment Helper - Options Page Script
 * 
 * This script handles the options page functionality including:
 * - API key management (save, test, clear)
 * - Settings validation
 * - User interface interactions
 */

// DOM elements
const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const clearBtn = document.getElementById('clearBtn');
const statusMessage = document.getElementById('statusMessage');
const testResults = document.getElementById('testResults');
const testOutput = document.getElementById('testOutput');

// State
let currentApiKey = '';
let isTesting = false;

/**
 * Initialize the options page
 */
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
});

/**
 * Set up event listeners
 */
function setupEventListeners() {
    saveBtn.addEventListener('click', handleSaveApiKey);
    testBtn.addEventListener('click', handleTestApiKey);
    clearBtn.addEventListener('click', handleClearApiKey);
    
    // Auto-save on input change (with debounce)
    let saveTimeout;
    apiKeyInput.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if (apiKeyInput.value.trim() && apiKeyInput.value !== currentApiKey) {
                showStatus('API key has been modified. Click "Save API Key" to save changes.', 'warning');
            }
        }, 1000);
    });
    
    // Show/hide API key on focus/blur for easier editing
    apiKeyInput.addEventListener('focus', () => {
        apiKeyInput.type = 'text';
    });
    
    apiKeyInput.addEventListener('blur', () => {
        apiKeyInput.type = 'password';
    });
}

/**
 * Load settings from storage
 */
async function loadSettings() {
    try {
        const result = await chrome.storage.local.get(['apiKey']);
        if (result.apiKey) {
            currentApiKey = result.apiKey;
            apiKeyInput.value = result.apiKey;
            showStatus('API key loaded successfully.', 'success');
        } else {
            showStatus('No API key configured. Please enter your Google Gemini API key.', 'warning');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showStatus('Error loading settings from storage.', 'error');
    }
}

/**
 * Handle save API key button click
 */
async function handleSaveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        showStatus('Please enter an API key.', 'error');
        apiKeyInput.focus();
        return;
    }
    
    if (!isValidApiKeyFormat(apiKey)) {
        showStatus('Invalid API key format. Please check your key and try again.', 'error');
        apiKeyInput.focus();
        return;
    }
    
    try {
        await chrome.storage.local.set({ apiKey: apiKey });
        currentApiKey = apiKey;
        showStatus('API key saved successfully!', 'success');
        
        // Hide the save button temporarily to indicate success
        saveBtn.style.opacity = '0.5';
        saveBtn.textContent = '✅ Saved!';
        setTimeout(() => {
            saveBtn.style.opacity = '1';
            saveBtn.textContent = '💾 Save API Key';
        }, 2000);
        
    } catch (error) {
        console.error('Error saving API key:', error);
        showStatus('Error saving API key to storage.', 'error');
    }
}

/**
 * Handle test API key button click
 */
async function handleTestApiKey() {
    if (isTesting) return;
    
    const apiKey = apiKeyInput.value.trim() || currentApiKey;
    
    if (!apiKey) {
        showStatus('Please enter an API key first.', 'error');
        apiKeyInput.focus();
        return;
    }
    
    isTesting = true;
    testBtn.disabled = true;
    testBtn.textContent = '⏳ Testing...';
    
    try {
        const result = await testApiConnection(apiKey);
        
        testResults.style.display = 'block';
        
        if (result.success) {
            testOutput.innerHTML = `
                <h4 style="color: #28a745; margin-bottom: 12px;">✅ API Test Successful!</h4>
                <p><strong>Response time:</strong> ${result.responseTime}ms</p>
                <p><strong>Model:</strong> ${result.model || 'gemini-2.0-flash'}</p>
                <p><strong>Generated text:</strong> "${result.generatedText}"</p>
            `;
            showStatus('API key test successful!', 'success');
        } else {
            testOutput.innerHTML = `
                <h4 style="color: #dc3545; margin-bottom: 12px;">❌ API Test Failed</h4>
                <p><strong>Error:</strong> ${result.error}</p>
                <p><strong>Status:</strong> ${result.status || 'Unknown'}</p>
            `;
            showStatus('API key test failed. Please check your key.', 'error');
        }
        
    } catch (error) {
        console.error('Error testing API:', error);
        testResults.style.display = 'block';
        testOutput.innerHTML = `
            <h4 style="color: #dc3545; margin-bottom: 12px;">❌ Test Error</h4>
            <p><strong>Error:</strong> ${error.message}</p>
        `;
        showStatus('Error testing API connection.', 'error');
    } finally {
        isTesting = false;
        testBtn.disabled = false;
        testBtn.textContent = '🧪 Test API Key';
    }
}

/**
 * Handle clear API key button click
 */
async function handleClearApiKey() {
    if (!confirm('Are you sure you want to clear your API key? This will prevent the extension from working until you enter a new key.')) {
        return;
    }
    
    try {
        await chrome.storage.local.remove(['apiKey']);
        currentApiKey = '';
        apiKeyInput.value = '';
        showStatus('API key cleared successfully.', 'success');
        testResults.style.display = 'none';
    } catch (error) {
        console.error('Error clearing API key:', error);
        showStatus('Error clearing API key from storage.', 'error');
    }
}

/**
 * Test API connection with the provided key
 */
async function testApiConnection(apiKey) {
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    const testPrompt = 'Generate a simple test response in one sentence to verify the API is working.';
    
    const requestBody = {
        contents: [{
            parts: [{
                text: testPrompt
            }]
        }],
        generationConfig: {
            maxOutputTokens: 50,
            temperature: 0.3
        }
    };

    const startTime = Date.now();
    
    try {
        const response = await fetch(`${endpoint}?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        const responseTime = Date.now() - startTime;
        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
                status: response.status,
                responseTime
            };
        }

        if (!data.candidates || data.candidates.length === 0) {
            return {
                success: false,
                error: 'No response generated. The request might have been filtered by safety settings.',
                status: response.status,
                responseTime
            };
        }

        const candidate = data.candidates[0];
        if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            return {
                success: false,
                error: 'Invalid response format from API.',
                status: response.status,
                responseTime
            };
        }

        return {
            success: true,
            generatedText: candidate.content.parts[0].text.trim(),
            model: 'gemini-2.0-flash',
            responseTime
        };

    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return {
                success: false,
                error: 'Network error. Please check your internet connection.',
                responseTime
            };
        }
        
        return {
            success: false,
            error: error.message,
            responseTime
        };
    }
}

/**
 * Validate API key format (basic validation)
 */
function isValidApiKeyFormat(apiKey) {
    // Google API keys are typically long alphanumeric strings
    // This is a basic format check - the actual validation happens on the API side
    return apiKey.length >= 20 && /^[A-Za-z0-9_-]+$/.test(apiKey);
}

/**
 * Show status message
 */
function showStatus(message, type = 'default') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
    
    // Auto-hide warning messages after 8 seconds
    if (type === 'warning') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 8000);
    }
}

/**
 * Utility function to format bytes
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Utility function to get storage usage info
 */
async function getStorageInfo() {
    try {
        const usage = await chrome.storage.local.getBytesInUse();
        const quota = await chrome.storage.local.getBytesInUse ? 
            await chrome.storage.local.getBytesInUse() : null;
        
        return {
            used: usage,
            quota: quota,
            formatted: `${formatBytes(usage)}${quota ? ` / ${formatBytes(quota)}` : ''}`
        };
    } catch (error) {
        console.error('Error getting storage info:', error);
        return null;
    }
}
