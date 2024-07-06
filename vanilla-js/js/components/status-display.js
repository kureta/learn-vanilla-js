// instead of live-update, use message id. same id overwrites previous message
const MessageTypes = Object.freeze({
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
  LIVE_UPDATE: 'live-update'
});

class StatusDisplayComponent extends HTMLElement {
  statusMessageBuffer;

  constructor() {
    super();
    this.statusMessageBuffer = new Array(5).fill("");
    this.loadTemplate().then(() => {
      console.log('Template loaded: status-display');
    });
  }

  async loadTemplate() {
    const response = await fetch('js/components/status-display.html');
    this.innerHTML = await response.text();
    this.init();
  }

  init() {
    this.innerHTML = this.statusMessageBuffer.join('<br>');
  }

  updateStatus(message_type, message) {
    if (this.statusMessageBuffer[4].includes('live-update') && message_type === MessageTypes.LIVE_UPDATE) {
      this.statusMessageBuffer[4] = `${message_type}, ${message}`;
    } else {
      this.statusMessageBuffer.shift();
      this.statusMessageBuffer.push(`${message_type}, ${message}`);
    }

    this.innerHTML = this.statusMessageBuffer.join('<br>');
  }
}

export {StatusDisplayComponent, MessageTypes};
