class LogLevel {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  toString() {
    return this.name;
  }

  valueOf(){
    return this.value;
  }

  static DEBUG = new LogLevel("DEBUG", 0);
  static INFO = new LogLevel("INFO", 1);
  static NOTICE = new LogLevel("NOTICE", 2);
  static WARNING = new LogLevel("WARNING", 3);
  static ERROR = new LogLevel("ERROR", 4);
  static CRITICAL = new LogLevel("CRITICAL", 5);
  static ALERT = new LogLevel("ALERT", 6);
  static EMERGENCY = new LogLevel("EMERGENCY", 7);
}


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

export {LogLevel, RetryManager};
