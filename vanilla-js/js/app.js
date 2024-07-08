import {WebSocketManager} from "./modules/websocket-manager.js";
import {LogDisplayComponent} from "./components/log-display.js";

// Explicitly reference LogDisplayComponent to avoid unused import warning
if (typeof LogDisplayComponent === "undefined") {
  console.warn("LogDisplayComponent is not defined");
}

// Function for connecting UI elements
function setupUIListeners(webSocketManager) {
  document.getElementById("sendButton").addEventListener("click", () => {
    webSocketManager.sendMessage("Hello, server!");
  });
  document.getElementById("connectButton").addEventListener("click", () => {
    webSocketManager.toggleConnection();
  });
}

// Wait for the log-display component to load
document.addEventListener('log-display-loaded', () => {
  // Initialize WebSocketManager and set up UI listeners
  const webSocketManager = new WebSocketManager("ws://localhost:8765");
  setupUIListeners(webSocketManager);
});

// Setup UI state based on WebSocket connection status
document.addEventListener("websocket-status-update", (event) => {
  const connectButton = document.getElementById("connectButton");
  const sendButton = document.getElementById("sendButton");
  switch (event.detail.status) {
    case WebSocketManager.Status.CLOSED:
      connectButton.textContent = "Connect";
      connectButton.disabled = false;
      sendButton.disabled = true;
      break;
    case WebSocketManager.Status.RETRYING || WebSocketManager.Status.CONNECTING:
      connectButton.textContent = "Connecting...";
      connectButton.disabled = true;
      sendButton.disabled = true;
      break;
    case WebSocketManager.Status.CONNECTED:
      connectButton.textContent = "Disconnect";
      connectButton.disabled = false;
      sendButton.disabled = false;
      break;
    case WebSocketManager.Status.ERROR:
      connectButton.textContent = "Error";
      connectButton.disabled = true;
      sendButton.disabled = true;
      break;
    default:
      connectButton.textContent = "Unknown";
      connectButton.disabled = true;
      sendButton.disabled = true;
  }
});

// Listen to 'message-received' events and update "messageDisplay" element
document.addEventListener('websocket-message-received', (event) => {
  const messageDisplay = document.getElementById("messageDisplay");
  messageDisplay.textContent = "Message from server: " + event.detail.message;
});
