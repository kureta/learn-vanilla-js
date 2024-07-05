class RetryManager {
  maxRetries;
  retryDelay;
  onRetry;
  onMaxRetriesReached;
  onRetryCountdown;
  currentRetryCount;
  currentReconnectDelay;

  constructor(maxRetries, retryDelay, onRetry, onMaxRetriesReached, onRetryCountdown) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.onRetry = onRetry;
    this.onMaxRetriesReached = onMaxRetriesReached;
    this.onRetryCountdown = onRetryCountdown;
    this.currentRetryCount = 0;
    this.currentReconnectDelay = retryDelay;
  }

  reset() {
    this.currentRetryCount = 0;
  }

  attemptRetry() {
    if (this.currentRetryCount < this.maxRetries) {
      this.currentRetryCount++;
      this.currentReconnectDelay = this.retryDelay;
      this.#startRetryCountdown();
    } else {
      this.onMaxRetriesReached();
    }
  }

  #startRetryCountdown = () => {
    const countdown = () => {
      if (this.currentReconnectDelay > 0) {
        // take an onRetryCountdown callback as a parameter
        // find the correct place to reset reconnect delay
        // we are setting a 1-second timout every second while decrementing reconnect delay until it reaches 0
        this.onRetryCountdown(this.currentReconnectDelay);
        this.currentReconnectDelay--;
        setTimeout(countdown, 1000);
      } else {
        this.onRetry();
      }
    };
    countdown();
  }
}

// Some status changes happen one after the other, so previous status is overwritten
// Determine where to set status
// Define a data structure for status where possible states are connected, connecting, error, closed, retrying

const Status = Object.freeze({
  CONNECTING: 'Connecting...',
  CONNECTED: 'Connected',
  ERROR: 'Error',
  CLOSED: 'Closed',
  RETRYING: 'Retrying...'
});

class WebSocketManager {
  #url;
  #socket;
  #retryManager;
  status;

  constructor(url) {
    this.#url = url;
    this.#retryManager = new RetryManager(3, 5, this.#onRetry, this.#onMaxRetriesReached, this.#onRetryCountdown);
    // set status to connecting
    this.#initializeWebSocket();
  }

  #initializeWebSocket = () => {
    console.log('Initializing WebSocket...');
    this.#updateStatus('Connecting...');
    this.status = Status.CONNECTING;
    this.#socket = new WebSocket(this.#url);
    this.#socket.onerror = this.#handleError;
    this.#socket.onclose = this.#handleClose;
    this.#socket.onopen = this.#handleOpen;
    this.#socket.onmessage = this.#handleMessage;
    console.log('WebSocket initialized');
  }

  #onRetryCountdown = (reconnectDelay) => {
    console.log(`Retrying WebSocket connection in ${reconnectDelay} seconds...`);
    this.#updateStatus(`Retrying in ${reconnectDelay} seconds...`);
  }

  #onRetry = () => {
    console.log('Retrying WebSocket connection...');
    this.#initializeWebSocket();
  }

  #onMaxRetriesReached = () => {
    console.log('Max retries reached. Closing WebSocket connection...');
    this.#updateStatus('Max retries reached');
    this.#socket.close();
  }

  #handleError = (error) => {
    console.log('WebSocket Error:', error);
    this.#updateStatus('Error');
  }

  #handleClose = (event) => {
    console.log(`WebSocket closed (code: ${event.code}). Attempting to reconnect...`);
    this.#updateStatus(`Retrying... ${this.#retryManager.currentRetryCount + 1}/${this.#retryManager.maxRetries}`);
    this.#retryManager.attemptRetry();
  }

  #handleOpen = () => {
    console.log('WebSocket connection established');
    this.#updateStatus('Connected');
    this.#retryManager.reset();
  }

  #handleMessage = (event) => {
    const messageDisplay = document.getElementById('messageDisplay');
    messageDisplay.textContent = 'Message from server: ' + event.data;
  }

  #updateStatus = (status) => {
    const statusDisplay = document.getElementById('connectionStatus');
    statusDisplay.textContent = 'Connection Status: ' + status;
  }

  sendMessage = (message) => {
    if (this.#socket.readyState === WebSocket.OPEN) {
      this.#socket.send(message);
    } else {
      console.log('WebSocket is not open. ReadyState:', this.#socket.readyState);
    }
  }

  connect = () => {
    this.#retryManager.reset();
    this.#initializeWebSocket();
  }
}

function setupUIListeners(webSocketManager) {
  document.getElementById('sendMessage').addEventListener('click', () => {
    webSocketManager.sendMessage('Hello, server!');
  });
  // Make it disconnect if already connected
  document.getElementById('connect').addEventListener('click', () => {
    webSocketManager.connect();
  });
}

const webSocketManager = new WebSocketManager('ws://localhost:8765');
setupUIListeners(webSocketManager);
