class LogDisplayComponent extends HTMLDivElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.loadTemplate().then(() => {
      console.log("Template loaded: log-display");
      this.dispatchEvent(new CustomEvent('log-display-loaded', {bubbles: true}));
    });
  }

  clearLogMessages() {
    const logMessages = this.shadowRoot.getElementById('log-messages');
    logMessages.innerHTML = '';
  }

  async loadTemplate() {
    const response = await fetch("js/components/log-display.html");
    if (!response.ok) {
      console.error("Failed to load template:");
    } else {
      const templateElement = document.createElement('template');
      templateElement.innerHTML = await response.text();
      this.shadowRoot.appendChild(templateElement.content.cloneNode(true)); // Append to shadowRoot

      this.init();
    }
  }

  init() {
    this.clearLogMessages();
    document.addEventListener("log-update", (event) => {
      this.updateLogs(event.detail.message);
    });
  }

  addLogMessage(level, message) {
    const logMessages = this.shadowRoot.getElementById('log-messages');
    const logMessage = document.createElement('div');
    logMessage.className = `log-message ${level}`;
    logMessage.textContent = `[${level.toUpperCase()}] ${message}`;
    logMessages.appendChild(logMessage);

    logMessage.scrollIntoView({behavior: "smooth"});
  }

  updateLogs(message) {
    if (message.type !== "LOG_MESSAGE") return
    const log_level = message.content.log_level.toString().toLowerCase();
    const content = `(${message.sender}}) ${message.content.text}`;

    this.addLogMessage(log_level, content);
  }
}

customElements.define("log-display", LogDisplayComponent, {extends: "div"});

export {LogDisplayComponent};
