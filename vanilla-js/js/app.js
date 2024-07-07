import {
  MessageTypes,
} from "./components/status-display.js";

class RetryManager {
  maxRetries;
  retryDelay;
  #onRetry;
  #onMaxRetriesReached;
  #onRetryCountdown;
  currentRetryCount;
  currentReconnectDelay;

  constructor(
    maxRetries,
    retryDelay,
    onRetry,
    onMaxRetriesReached,
    onRetryCountdown
  ) {
    // Configuration
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    // Callbacks
    this.#onRetry = onRetry;
    this.#onMaxRetriesReached = onMaxRetriesReached;
    this.#onRetryCountdown = onRetryCountdown;
    // State variables
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
      this.#onMaxRetriesReached();
    }
  }

  #startRetryCountdown = () => {
    const countdown = () => {
      if (this.currentReconnectDelay > 0) {
        // Set 1-second timout every second while decrementing reconnect delay until it reaches 0
        this.#onRetryCountdown(this.currentReconnectDelay);
        this.currentReconnectDelay--;
        setTimeout(countdown, 1000);
      } else {
        this.#onRetry();
      }
    };
    countdown();
  };
}

function getWebSocketErrorDescription(code) {
  const errorDescriptions = {
    1000: "Normal Closure",
    1001: "Going Away",
    1002: "Protocol Error",
    1003: "Unsupported Data",
    1005: "No Status Received",
    1006: "Abnormal Closure",
    1007: "Invalid frame payload data",
    1008: "Policy Violation",
    1009: "Message too big",
    1010: "Missing Extension",
    1011: "Internal Error",
    1015: "TLS Handshake",
  };

  return errorDescriptions[code] || "Unknown Error";
}

const Status = Object.freeze({
  CONNECTING: "Connecting...",
  CONNECTED: "Connected",
  ERROR: "Error",
  CLOSED: "Closed",
  RETRYING: "Retrying...",
});

class WebSocketManager {
  #url;
  #socket;
  #retryManager;
  // State variables
  status;

  constructor(url) {
    this.#url = url;
    this.#retryManager = new RetryManager(
      3,
      5,
      this.#initializeWebSocket,
      this.#onMaxRetriesReached,
      this.#onRetryCountdown
    );

      document.addEventListener('status-display-loaded', () => {
        this.#initializeWebSocket();
      });
  }

  #initializeWebSocket = () => {
    console.log("Initializing WebSocket...");
    this.#broadcastStatus(MessageTypes.INFO, "Initializing WebSocket...");
    this.status = Status.CONNECTING;
    this.#socket = new WebSocket(this.#url);
    this.#socket.onerror = this.#handleError;
    this.#socket.onclose = this.#handleClose;
    this.#socket.onopen = this.#handleOpen;
    this.#socket.onmessage = this.#handleMessage;
    console.log("WebSocket initialized");
  };

  #onRetryCountdown = (reconnectDelay) => {
    console.log(
      `Retrying WebSocket connection in ${reconnectDelay} seconds...`
    );
    this.#broadcastStatus(
      MessageTypes.LIVE_UPDATE,
      `Retrying... ${this.#retryManager.currentRetryCount}/${
        this.#retryManager.maxRetries
      } in ${this.#retryManager.currentReconnectDelay} seconds`
    );
  };

  #onMaxRetriesReached = () => {
    // make button connect
    document.getElementById("connect").disabled = false;
    document.getElementById("connect").textContent = "Connect";
    console.log("Max retries reached. Closing WebSocket connection...");
    this.#broadcastStatus(
      MessageTypes.ERROR,
      "Max retries reached. Closing WebSocket connection..."
    );
    this.#socket.close();
  };

  #handleError = (error) => {
    console.log("WebSocket Error: ", error);
    this.status = Status.ERROR;
    const message = error.message || "Unknown Error";
    this.#broadcastStatus(MessageTypes.ERROR, message);
  };

  #handleClose = (event) => {
    // make button disabled
    document.getElementById("connect").disabled = false;
    document.getElementById("connect").textContent = "Connect";
    console.log(
      `WebSocket closed (code: ${event.code}). Attempting to reconnect...`
    );
    this.status = Status.CLOSED;
    this.#broadcastStatus(
      MessageTypes.WARNING,
      getWebSocketErrorDescription(event.code)
    );
    if (event.code !== 1000) {
      this.status = Status.RETRYING;
      document.getElementById("connect").disabled = true;
      this.#retryManager.attemptRetry();
    }
  };

  #handleOpen = () => {
    // make button disconnect
    document.getElementById("connect").disabled = false;
    document.getElementById("connect").textContent = "Disconnect";
    console.log("WebSocket connection established");
    this.status = Status.CONNECTED;
    this.#broadcastStatus(
      MessageTypes.SUCCESS,
      "WebSocket connection established"
    );
    this.#retryManager.reset();
  };

  #handleMessage = (event) => {
    const messageDisplay = document.getElementById("messageDisplay");
    messageDisplay.textContent = "Message from server: " + event.data;
  };

  #broadcastStatus = (message_type, message) => {
    document.dispatchEvent(new CustomEvent('status-update', {
      detail: {
        message_type: message_type,
        message: message
      }
    }));
  };

  sendMessage = (message) => {
    if (this.#socket.readyState === WebSocket.OPEN) {
      this.#socket.send(message);
    } else {
      console.log(
        "WebSocket is not open. ReadyState:",
        this.#socket.readyState
      );
    }
  };

  toggle = () => {
    if (this.#socket.readyState === WebSocket.OPEN) {
      console.log("Closing WebSocket connection...");
      this.#socket.close(1000, "Closing connection by user request");
    } else {
      console.log("Opening WebSocket connection...");
      this.#retryManager.reset();
      this.#initializeWebSocket();
    }
  };
}

function setupUIListeners(webSocketManager) {
  document.getElementById("sendMessage").addEventListener("click", () => {
    webSocketManager.sendMessage("Hello, server!");
  });
  // Make it disconnect if already connected
  document.getElementById("connect").addEventListener("click", () => {
    webSocketManager.toggle();
  });
}

const webSocketManager = new WebSocketManager("ws://localhost:8765");
setupUIListeners(webSocketManager);
