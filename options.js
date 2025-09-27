// Saves options to chrome.storage
function save_options() {
  const apiKey = document.getElementById('api-key').value;

  // Using chrome.storage.local is preferred for sensitive data like API keys
  // as it's not synced across devices, reducing the exposure risk if one
  // device is compromised. chrome.storage.sync is better for user settings
  // that are convenient to have on all devices.
  chrome.storage.local.set({
    apiKey: apiKey
  }, function() {
    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.textContent = 'API Key saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });
}

// Restores input box state using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get({
    apiKey: '' // Default to empty string
  }, function(items) {
    document.getElementById('api-key').value = items.apiKey;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('options-form').addEventListener('submit', function(event) {
  event.preventDefault();
  save_options();
});