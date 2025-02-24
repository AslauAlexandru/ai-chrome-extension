let currentField = null;
let suggestion = '';
let suggestionElement = null;

document.addEventListener('focusin', (e) => {
  if (e.target.tagName === 'TEXTAREA' || (e.target.tagName === 'INPUT' && e.target.type === 'text')) {
    currentField = e.target;
    attachListeners(currentField);
  }
});

function attachListeners(field) {
  field.addEventListener('input', debounce(handleInput, 300));
  field.addEventListener('keydown', handleKeydown);
  field.addEventListener('scroll', updateSuggestionPosition);
  field.addEventListener('select', updateSuggestionPosition);
  window.addEventListener('resize', updateSuggestionPosition);
}

async function handleInput(e) {
  const text = e.target.value;
  suggestion = await getSuggestion(text);
  displaySuggestion(suggestion);
}

function handleKeydown(e) {
  if (e.key === 'Tab' && suggestion) {
    e.preventDefault();
    const cursorPos = e.target.selectionStart;
    const textBefore = e.target.value.slice(0, cursorPos);
    const textAfter = e.target.value.slice(cursorPos);
    e.target.value = textBefore + suggestion + textAfter;
    e.target.selectionStart = e.target.selectionEnd = cursorPos + suggestion.length;
    suggestion = '';
    hideSuggestion();
  } else if (e.key === 'Escape') {
    hideSuggestion();
  }
}

function displaySuggestion(text) {
  if (!currentField || !text) return;

  hideSuggestion();

  suggestionElement = document.createElement('div');
  suggestionElement.className = 'ai-autocomplete-suggestion';
  suggestionElement.textContent = text;

  document.body.appendChild(suggestionElement);
  updateSuggestionPosition();
}

function updateSuggestionPosition() {
  if (!currentField || !suggestionElement) return;

  const rect = currentField.getBoundingClientRect();
  const style = window.getComputedStyle(currentField);
  const lineHeight = parseInt(style.lineHeight);
  const paddingLeft = parseInt(style.paddingLeft);
  const paddingTop = parseInt(style.paddingTop);

  const textBeforeCursor = currentField.value.substring(0, currentField.selectionStart);
  const lines = textBeforeCursor.split('\n');
  const currentLineNumber = lines.length - 1;
  const currentLineText = lines[currentLineNumber];

  const measurer = document.createElement('span');
  measurer.style.visibility = 'hidden';
  measurer.style.position = 'absolute';
  measurer.style.whiteSpace = 'pre';
  measurer.style.font = style.font;
  measurer.textContent = currentLineText;
  document.body.appendChild(measurer);

  const cursorX = measurer.offsetWidth + paddingLeft;
  const cursorY = currentLineNumber * lineHeight + paddingTop - currentField.scrollTop;

  document.body.removeChild(measurer);

  suggestionElement.style.left = `${rect.left + cursorX}px`;
  suggestionElement.style.top = `${rect.top + cursorY}px`;
}

function hideSuggestion() {
  if (suggestionElement && suggestionElement.parentNode) {
    suggestionElement.parentNode.removeChild(suggestionElement);
  }
  suggestionElement = null;
}

async function getSuggestion(text) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({action: "getSuggestion", text}, (response) => {
      resolve(response.suggestion);
    });
  });
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
