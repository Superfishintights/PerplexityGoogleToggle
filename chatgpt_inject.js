chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.query) {
      // Wait for the page to load necessary elements
      const interval = setInterval(() => {
        const textarea = document.getElementById('prompt-textarea');
        const sendButton = document.querySelector('button[aria-label="Send prompt"]');
  
        if (textarea && sendButton) {
          clearInterval(interval);
  
          // Set the query in the contenteditable div
          textarea.focus();
  
          // Create a range and select the content inside the div
          const selection = window.getSelection();
          selection.removeAllRanges();
          const range = document.createRange();
          range.selectNodeContents(textarea);
          selection.addRange(range);
  
          // Replace the selected content with the query
          document.execCommand('insertText', false, request.query);
  
          // Dispatch input events to ensure React picks up the change
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
  
          // Click the send button
          sendButton.click();
        }
      }, 500);
    }
  });
  