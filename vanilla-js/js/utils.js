function makeEnum(properties) {
  const obj = {};
  for (const property of properties) {
    obj[property] = Symbol(property);
  }
  return Object.freeze(obj);
}

const LogLevel = makeEnum(["ERROR", "INFO", "WARNING", "SUCCESS"]);

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

export {LogLevel, makeEnum, RetryManager};
