chrome.webNavigation.onCommitted.addListener(function(details) {
    const url = new URL(details.url);
  
    // Check if the URL is a Google search
    if (url.hostname.includes('google.') && url.pathname === '/search') {
      const params = new URLSearchParams(url.search);
      const query = params.get('q');
  
      if (query) {
        const words = query.trim().split(/\s+/);
        const firstWord = words[0].toLowerCase();
  
        if (firstWord === '-pr' || firstWord === '-p') {
          words.shift(); 
          const newQuery = words.join(' ');
  
          let perplexityUrl = 'https://www.perplexity.ai/search?q=' + encodeURIComponent(newQuery);
  
          if (firstWord === '-pr') {
            perplexityUrl += '&copilot=true'; 
          }
  
          chrome.tabs.update(details.tabId, { url: perplexityUrl });
        }
      }
    }
  });
  