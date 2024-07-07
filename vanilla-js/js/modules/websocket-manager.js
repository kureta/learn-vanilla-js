import {LogLevel, RetryManager} from "../utils";

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

  return errorDescriptions[code] || `Unknown Error: ${code}`;
}

class WebSocketManager {
  // static properties
  static Status = Object.freeze({
    CONNECTING: "CONNECTING",
    CONNECTED: "CONNECTED",
    ERROR: "ERROR",
    CLOSED: "CLOSED",
    RETRYING: "RETRYING",
  });
  static instance = null;
  // parameters
  #url;
  #socket;
  #retryManager;
  // State variables
  #status;

  constructor(url) {
    if (WebSocketManager.instance) {
      console.warn("WebSocketManager instance already exists. Returning existing instance...");
      return WebSocketManager.instance;
    }

    this.status = WebSocketManager.Status.CLOSED;
    this.#url = url;
    this.#retryManager = new RetryManager(
      3,
      5,
      this.#initializeWebSocket,
      this.#onMaxRetriesReached,
      this.#onRetryCountdown
    );

    this.#initializeWebSocket();
    WebSocketManager.instance = this;
  }

  // yes
  #initializeWebSocket = () => {
    console.log("Initializing WebSocket...");
    this.#broadcastLog(LogLevel.INFO, "Initializing WebSocket...");
    this.status = WebSocketManager.Status.CONNECTING;
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
    this.#broadcastLog(
      LogLevel.INFO,
      `Retrying... ${this.#retryManager.currentRetryCount}/${
        this.#retryManager.maxRetries
      } in ${this.#retryManager.currentReconnectDelay} seconds`
    );
  };

  #onMaxRetriesReached = () => {
    console.log("Max retries reached. Closing WebSocket connection...");
    this.#broadcastLog(
      LogLevel.ERROR,
      "Max retries reached. Closing WebSocket connection..."
    );
    this.#socket.close();
  };

  // yes
  #handleError = (error) => {
    console.log("WebSocket Error: ", error);
    this.status = WebSocketManager.Status.ERROR;
    const message = error.message || "Unknown Error";
    this.#broadcastLog(LogLevel.ERROR, message);
  };

  // yes
  #handleClose = (event) => {
    if (event.code === 1000) {
      this.#broadcastLog(LogLevel.INFO, getWebSocketErrorDescription(event.code));
      console.log(`WebSocket closed normally`);
      this.status = WebSocketManager.Status.CLOSED;
    } else {
      this.#broadcastLog(LogLevel.ERROR, getWebSocketErrorDescription(event.code));
      console.log(`WebSocket closed (code: ${event.code}). Attempting to reconnect...`);
      this.status = WebSocketManager.Status.RETRYING;
      this.#retryManager.attemptRetry();
    }
  };

  // yes
  #handleOpen = () => {
    console.log("WebSocket connection established");
    this.status = WebSocketManager.Status.CONNECTED;
    this.#broadcastLog(
      LogLevel.INFO,
      "WebSocket connection established"
    );
    this.#retryManager.reset();
  };

  #handleMessage = (event) => {
    document.dispatchEvent(new CustomEvent('message-received', {
      detail: {
        message: event.data
      }
    }));
  };

  #broadcastLog = (log_level, message) => {
    document.dispatchEvent(new CustomEvent('log-update', {
      detail: {
        message: {
          type: 'LOG_MESSAGE',
          content: {
            log_level: log_level,
            text: message
          }
        }
      }
    }));
  };

  get status() {
    return this.#status;
  }

  set status(newStatus) {
    this.#status = newStatus;
    document.dispatchEvent(new CustomEvent('websocket-status-update', {
      detail: {
        status: newStatus
      }
    }));
  }

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

export {WebSocketManager};
