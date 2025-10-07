// sidepanel.js - Handles communication between the iframe and Chrome storage.

console.log("Side Panel script loaded.");

const targetOrigin = "https://6000-firebase-studio-1759686915025.cluster-44kx2eiocbhe2tyk3zoyo3ryuo.cloudworkstations.dev";
const iframe = document.querySelector('iframe');

// Listen for messages from the Next.js app inside the iframe
window.addEventListener("message", (event) => {
    // Security: only accept messages from the trusted iframe origin
    if (event.origin !== targetOrigin) {
        console.warn("Message from untrusted origin ignored:", event.origin);
        return;
    }

    const { action, key, value } = event.data;

    if (action === 'get') {
        chrome.storage.local.get(key, (result) => {
            // Send the data back to the iframe
            if (iframe && iframe.contentWindow) {
                 iframe.contentWindow.postMessage({ action: 'get_response', key, value: result[key] }, targetOrigin);
            }
        });
    } else if (action === 'set') {
        chrome.storage.local.set({ [key]: value });
    }
});
