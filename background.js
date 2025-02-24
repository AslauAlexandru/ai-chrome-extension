chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSuggestion") {
      fetchSuggestionFromGroq(request.text)
        .then(suggestion => sendResponse({suggestion}));
      return true; // Indicates async response
    }
  });
  
  async function fetchSuggestionFromGroq(text) {
    const API_KEY = await getApiKey();
    const response = await fetch('https://api.groq.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        prompt: text,
        max_tokens: 50,
        temperature: 0.7
      })
    });
    const data = await response.json();
    return data.choices[0].text;
  }
  
  async function getApiKey() {
    
    return new Promise((resolve) => {
      chrome.storage.sync.get(['groqApiKey'], (result) => {
        resolve(result.groqApiKey);
      });
    });
    
    /** 
    return new Promise((resolve) => {
      chrome.storage.sync.get(`${process.env.GROQ_API_KEY}`, (result) => {
        resolve(result.groqApiKey);
      });
    });
    */
  }
