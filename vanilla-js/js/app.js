class WebSocketManager {
  #url;
  #socket;
  #reconnectDelay = 5; // Initial reconnect delay in seconds
  #currentReconnectDelay;
  #maxRetries = 3; // Maximum number of retries
  #retryCount = 0; // Current retry attempt

  constructor(url) {
    this.#url = url;
    this.#updateStatus('Connecting...');
    this.#initializeWebSocket();
  }

  #initializeWebSocket = () => {
    console.log('Initializing WebSocket...');
    this.#socket = new WebSocket(this.#url);
    this.#socket.onerror = this.#handleError;
    this.#socket.onclose = this.#handleClose;
    this.#socket.onopen = this.#handleOpen;
    this.#socket.onmessage = this.#handleMessage;
    this.#retryCount = 0; // Reset retry count on successful connection
    console.log('WebSocket initialized');
  }

  #handleError = (error) => {
    console.log('WebSocket Error:', error);
    this.#updateStatus('Error');
  }

  #handleClose = (event) => {
    console.log(`WebSocket closed (code: ${event.code}). Attempting to reconnect...`);
    if (this.#retryCount < this.#maxRetries) {
      this.#retryCount++;
      this.#currentReconnectDelay = this.#reconnectDelay;
      this.#startReconnectCountdown();
    } else {
      this.#updateStatus('Max retries reached. Connection closed.');
    }
  }

  #handleOpen = () => {
    console.log('WebSocket connection established');
    this.#updateStatus('Connected');
  }

  #handleMessage = (event) => {
    const messageDisplay = document.getElementById('messageDisplay');
    messageDisplay.textContent = 'Message from server: ' + event.data;
  }

  #updateStatus = (status) => {
    const statusDisplay = document.getElementById('connectionStatus');
    if (this.#retryCount > 0 && this.#retryCount <= this.#maxRetries) {
      status += ` | Retry ${this.#retryCount}/${this.#maxRetries}`;
    }
    statusDisplay.textContent = 'Connection Status: ' + status;
  }

  #startReconnectCountdown = () => {
    const countdown = () => {
      if (this.#currentReconnectDelay > 0) {
        this.#updateStatus(`Closed. Reconnecting in ${this.#currentReconnectDelay}...`);
        this.#currentReconnectDelay--;
        setTimeout(countdown, 1000);
      } else {
        this.#initializeWebSocket();
      }
    };
    countdown();
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
