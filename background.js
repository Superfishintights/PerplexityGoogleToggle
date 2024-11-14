chrome.webNavigation.onCommitted.addListener(function (details) {
  const url = new URL(details.url);

  // Check if the URL is a Google search
  if (url.hostname.includes('google.') && url.pathname === '/search') {
    const params = new URLSearchParams(url.search);
    const query = params.get('q');

    if (query) {
      const words = query.trim().split(/\s+/);
      const firstWord = words[0].toLowerCase();

      // If -goo prefix, stay on Google by returning early
      if (firstWord === '-goo') {
        words.shift(); // Remove the prefix
        const newQuery = words.join(' ');
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(newQuery)}`;
        chrome.tabs.update(details.tabId, { url: googleUrl });
        return;
      }

      if (firstWord === '-pr' || firstWord === '-p' || firstWord === '-c') {
        words.shift(); // Remove the prefix
        const newQuery = words.join(' ');

        if (firstWord === '-c') {
          // Redirect to ChatGPT
          const chatgptUrl = 'https://chatgpt.com';
          chrome.tabs.update(details.tabId, { url: chatgptUrl }, function (tab) {
            // Wait for the tab to finish loading
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
              if (tabId === tab.id && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                // Inject the content script
                chrome.scripting.executeScript(
                  {
                    target: { tabId: tab.id },
                    files: ['chatgpt_inject.js'],
                  },
                  function () {
                    // Send the query to the content script
                    chrome.tabs.sendMessage(tab.id, { query: newQuery });
                  }
                );
              }
            });
          });
        } else {
          // Redirect to Perplexity
          let perplexityUrl =
            'https://www.perplexity.ai/search?q=' + encodeURIComponent(newQuery);

          if (firstWord === '-pr') {
            perplexityUrl += '&copilot=true';
          }

          chrome.tabs.update(details.tabId, { url: perplexityUrl });
        }
      } else {
        // Default to Perplexity Pro for all other searches
        const perplexityUrl = 'https://www.perplexity.ai/search?q=' + 
          encodeURIComponent(query) + '&copilot=true';
        chrome.tabs.update(details.tabId, { url: perplexityUrl });
      }
    }
  }
});
