class WebSocketManager {
  #url;
  #socket;

  constructor(url) {
    this.#url = url;
    this.#initializeWebSocket();
  }

  #initializeWebSocket = () => {
    console.log('Initializing WebSocket...');
    this.#socket = new WebSocket(this.#url);
    this.#socket.onerror = this.#handleError;
    this.#socket.onclose = this.#handleClose;
    this.#socket.onmessage = this.#handleMessage;
    console.log('WebSocket initialized');
  }

  #handleError = (error) => {
    console.log('WebSocket Error:', error);
  }

  #handleClose = (event) => {
    console.log(`WebSocket closed (code: ${event.code}). Attempting to reconnect...`);
    setTimeout(() => this.#initializeWebSocket(), 1000);
  }

  #handleMessage = (event) => {
    const messageDisplay = document.getElementById('messageDisplay');
    messageDisplay.textContent = 'Message from server: ' + event.data;
  }

  sendMessage = (message) => {
    if (this.#socket.readyState === WebSocket.OPEN) {
      this.#socket.send(message);
    } else {
      console.log('WebSocket is not open. ReadyState:', this.#socket.readyState);
    }
  }
}

function setupUIListeners(webSocketManager) {
  document.getElementById('sendMessage').addEventListener('click', () => {
    webSocketManager.sendMessage('Hello, server!');
  });
}

// Usage
const webSocketManager = new WebSocketManager('ws://localhost:8765');
setupUIListeners(webSocketManager);
