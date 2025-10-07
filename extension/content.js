// content.js

function addCourseGenButton() {
    // Find the container for YouTube's action buttons (like, share, etc.)
    const actionsContainer = document.querySelector('#actions #top-level-buttons-computed');

    if (actionsContainer && !document.getElementById('course-gen-button')) {
        const courseGenButton = document.createElement('button');
        courseGenButton.id = 'course-gen-button';
        courseGenButton.className = 'course-gen-button';
        
        courseGenButton.appendChild(document.createTextNode('GitCourseGen'));

        courseGenButton.onclick = () => {
            chrome.runtime.sendMessage({ action: 'toggleSidePanel' });
        };
        
        // Prepend the button to the actions container
        actionsContainer.prepend(courseGenButton);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleSidePanel') {
     chrome.runtime.sendMessage({ action: 'openSidePanelFromContent' });
  }
});

// YouTube uses a lot of dynamic loading (SPA), so we need to observe for changes
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
            addCourseGenButton();
            break; 
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
});

// Initial attempt to add the button on script injection
addCourseGenButton();

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "openSidePanel") {
    // This logic would be more complex if we were creating a custom panel,
    // but we are using the built-in sidePanel API.
    // The background script handles opening it. We just need to trigger it.
    console.log("Request to open side panel received.");
  }
});
