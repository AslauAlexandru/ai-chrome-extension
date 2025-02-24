document.getElementById('saveButton').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({groqApiKey: apiKey}, () => {
      alert('API key saved');
    });
  });
  
  // Load saved API key
  chrome.storage.sync.get(['groqApiKey'], (result) => {
    if (result.groqApiKey) {
      document.getElementById('apiKey').value = result.groqApiKey;
    }
  });
