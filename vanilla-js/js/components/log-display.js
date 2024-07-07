class LogDisplayComponent extends HTMLDivElement {
  textArea;

  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.loadTemplate().then(() => {
      console.log("Template loaded: log-display");
      this.dispatchEvent(new CustomEvent('log-display-loaded', {bubbles: true}));
    });
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
    this.textArea = this.shadowRoot.querySelector("#logDisplay");
    this.textArea.rows = 10;
    this.textArea.cols = 50;
    this.textArea.value = "";
    document.addEventListener("log-update", (event) => {
      this.updateLogs(event.detail.message);
    });
  }

  updateLogs(message) {
    if (message.type !== "LOG_MESSAGE") return
    this.textArea.value += `${message.content.log_level.toString()} (${message.sender}): ${message.content.text}\n`;
    this.textArea.scrollTop = this.textArea.scrollHeight; // Auto-scroll to bottom
  }
}

customElements.define("log-display", LogDisplayComponent, {extends: "div"});

export {LogDisplayComponent};
