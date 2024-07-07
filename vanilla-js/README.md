# Notes to self

## Decouple

WebSocketManager and StatusDisplay are completely decoupled.
WebsocketManager doesn't have to know anything about StatusDisplay.
It just broadcasts a message with type `STATUS` and the StatusDisplay listens for that message type.

> TODO: add more information to status messages
> Other components can also send status messages, so they should at least identify themselves

UI state and message box are also decoupled from WebSocketManager.

So far RetryManager seems fully decoupled.

## Code hygiene

> TODO: check all names. for example 'message-received' event should be
> 'websocket-message-received' to prevent name clashes.
