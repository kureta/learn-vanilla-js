class StatusDisplayComponent extends HTMLDivElement {
  textArea;

  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.loadTemplate().then(() => {
      console.log("Template loaded: status-display");
      this.dispatchEvent(new CustomEvent('status-display-loaded', {bubbles: true}));
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
    }
  }

  init() {
    this.textArea = this.shadowRoot.querySelector("#statusMessage");
    this.textArea.rows = 10;
    this.textArea.cols = 50;
    this.textArea.value = "";
    document.addEventListener("status-update", (event) => {
      this.updateStatus(event.detail.message);
    });
  }

  updateStatus(message) {
    if (message.type !== "STATUS_MESSAGE") return
    this.textArea.value += `${message.content.log_level.description}: ${message.content.text}\n`;
    this.textArea.scrollTop = this.textArea.scrollHeight; // Auto-scroll to bottom
  }
}

customElements.define("status-display", StatusDisplayComponent, {extends: "div"});

export {StatusDisplayComponent};
