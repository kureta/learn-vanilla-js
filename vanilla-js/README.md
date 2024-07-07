# Notes to self

## Decoupled

WebSocketManager and LogDisplayComponent are completely decoupled.
WebsocketManager doesn't have to know anything about LogDisplayComponent.
It just broadcasts a message with type `LOG_MESSAGE` and the LogDisplayComponent listens for that message type.

UI state and message box are also decoupled from WebSocketManager.

So far RetryManager seems fully decoupled.
