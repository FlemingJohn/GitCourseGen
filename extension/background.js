// background.js

// Toggles the side panel when the action icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Listen for a message from the content script to open the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleSidePanel') {
    chrome.sidePanel.open({ tabId: sender.tab.id });
  }
});
