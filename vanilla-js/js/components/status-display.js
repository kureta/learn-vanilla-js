// instead of live-update, use message id. same id overwrites previous message
const MessageTypes = Object.freeze({
  ERROR: "error",
  INFO: "info",
  WARNING: "warning",
  SUCCESS: "success",
  LIVE_UPDATE: "live-update",
});

class StatusDisplayComponent extends HTMLDivElement {
  statusMessageBuffer;
  textArea;

  constructor() {
    super();
    this.statusMessageBuffer = new Array(5).fill("");
    this.attachShadow({mode: "open"});
    this.loadTemplate().then(() => {
      console.log("Template loaded: status-display");
    });
  }

  async loadTemplate() {
    const response = await fetch("js/components/status-display.html");
    if (!response.ok) {
      console.error("Failed to load template:");
    } else {
      const templateElement = document.createElement('template');
      templateElement.innerHTML = await response.text();
      this.shadowRoot.appendChild(templateElement.content.cloneNode(true)); // Append to shadowRoot

      this.init();
      this.dispatchEvent(new CustomEvent('status-display-loaded', {bubbles: true}));
    }
  }

  init() {
    this.textArea = this.shadowRoot.querySelector("#statusMessage");
    this.textArea.rows = 10; // Number of rows
    this.textArea.cols = 50; // Number of columns
    this.textArea.value = "";
  }

  updateStatus(message_type, message) {
    if (
      this.statusMessageBuffer[4].includes("live-update") &&
      message_type === MessageTypes.LIVE_UPDATE
    ) {
      this.statusMessageBuffer[4] = `${message_type}, ${message}`;
    } else {
      this.statusMessageBuffer.shift();
      this.statusMessageBuffer.push(`${message_type}, ${message}`);
    }

    this.textArea.value += `${message_type}: ${message}\n`;
    // this.textArea.value = this.statusMessageBuffer.join("\n");
    this.textArea.scrollTop = this.textArea.scrollHeight; // Auto-scroll to bottom
  }
}

customElements.define("status-display", StatusDisplayComponent, {extends: "div"});

export {StatusDisplayComponent, MessageTypes};
