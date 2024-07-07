import {WebSocketManager} from "./modules/websocket-manager.js";
import {StatusDisplayComponent} from "./components/status-display.js";

// Explicitly reference StatusDisplayComponent to avoid unused import warning
if (typeof StatusDisplayComponent === "undefined") {
  console.warn("StatusDisplayComponent is not defined");
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

// Wait for the status-display component to load
document.addEventListener('status-display-loaded', () => {
  // Initialize WebSocketManager and set up UI listeners
  const webSocketManager = new WebSocketManager("ws://localhost:8765");
  setupUIListeners(webSocketManager);
});
