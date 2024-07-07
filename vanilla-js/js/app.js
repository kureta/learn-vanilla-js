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
