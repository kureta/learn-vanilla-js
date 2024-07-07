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
  // singleton instance
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
      this.#handleMaxRetriesReached,
      this.#handleRetryCountdown
    );

    this.#initializeWebSocket();
    WebSocketManager.instance = this;
  }

  #initializeWebSocket = () => {
    console.log("Initializing WebSocket...");
    this.#dispatchLogMessage(LogLevel.INFO, "Initializing WebSocket...");
    this.status = WebSocketManager.Status.CONNECTING;

    this.#socket = new WebSocket(this.#url);
    this.#socket.onerror = this.#handleError;
    this.#socket.onclose = this.#handleClose;
    this.#socket.onopen = this.#handleOpen;
    this.#socket.onmessage = this.#handleMessage;
  };

  #handleRetryCountdown = (reconnectDelay) => {
    console.log(`Retrying WebSocket connection in ${reconnectDelay} seconds...`);
    const retries = `${this.#retryManager.currentRetryCount}/${this.#retryManager.maxRetries}`
    this.#dispatchLogMessage(LogLevel.INFO, `Retrying... ${retries} in ${reconnectDelay} seconds`);
  };

  #handleMaxRetriesReached = () => {
    console.log("Max retries reached. Closing WebSocket connection...");
    this.#dispatchLogMessage(LogLevel.ERROR, "Max retries reached. Closing WebSocket connection...");
    this.#socket.close();
  };

  #handleError = (error) => {
    console.log("WebSocket Error: ", error);
    this.status = WebSocketManager.Status.ERROR;
    const message = error.message || "Unknown Error";
    this.#dispatchLogMessage(LogLevel.ERROR, message);
  };

  #handleClose = (event) => {
    if (event.code === 1000) {
      console.log(`WebSocket closed normally`);
      this.#dispatchLogMessage(LogLevel.INFO, getWebSocketErrorDescription(event.code));
      this.status = WebSocketManager.Status.CLOSED;
    } else {
      console.log(`WebSocket closed (code: ${event.code}). Attempting to reconnect...`);
      this.#dispatchLogMessage(LogLevel.ERROR, getWebSocketErrorDescription(event.code));
      this.status = WebSocketManager.Status.RETRYING;
      this.#retryManager.attemptRetry();
    }
  };

  #handleOpen = () => {
    console.log("WebSocket connection established");
    this.status = WebSocketManager.Status.CONNECTED;
    this.#dispatchLogMessage(LogLevel.INFO, "WebSocket connection established");
    this.#retryManager.reset();
  };

  #handleMessage = (event) => {
    document.dispatchEvent(new CustomEvent('websocket-message-received', {
      detail: {
        message: event.data
      }
    }));
  };

  #dispatchLogMessage = (log_level, message) => {
    document.dispatchEvent(new CustomEvent('log-update', {
      detail: {
        message: {
          sender: "WebSocketManager",
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

  toggleConnection = () => {
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
