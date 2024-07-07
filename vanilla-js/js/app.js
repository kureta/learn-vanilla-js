import {WebSocketManager} from "./modules/websocket-manager.js";
import {LogDisplayComponent} from "./components/log-display.js";

// Explicitly reference LogDisplayComponent to avoid unused import warning
if (typeof LogDisplayComponent === "undefined") {
  console.warn("LogDisplayComponent is not defined");
}

// Function for connecting UI elements
function setupUIListeners(webSocketManager) {
  document.getElementById("sendMessage").addEventListener("click", () => {
    webSocketManager.sendMessage("Hello, server!");
  });
  document.getElementById("connect").addEventListener("click", () => {
    webSocketManager.toggle();
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
  console.log(event.detail);
  const button = document.getElementById("connect");
  switch (event.detail.status) {
    case WebSocketManager.Status.CLOSED:
      button.textContent = "Connect";
      button.disabled = false;
      break;
    case WebSocketManager.Status.RETRYING || WebSocketManager.Status.CONNECTING:
      button.textContent = "Connecting...";
      button.disabled = true;
      break;
    case WebSocketManager.Status.CONNECTED:
      button.textContent = "Disconnect";
      button.disabled = false;
      break;
    case WebSocketManager.Status.ERROR:
      button.textContent = "Error";
      button.disabled = true;
      break;
    default:
      button.textContent = "Unknown";
      button.disabled = true;
  }
});

// Listen to 'message-received' events and update "messageDisplay" element
document.addEventListener('message-received', (event) => {
  const messageDisplay = document.getElementById("messageDisplay");
  messageDisplay.textContent = "Message from server: " + event.detail.message;
});
