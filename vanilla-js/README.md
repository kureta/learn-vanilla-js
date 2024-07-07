# Notes to self

## Decouple

WebSocketManager and StatusDisplay are completely decoupled.
WebsocketManager doesn't have to know anything about StatusDisplay.
It just broadcasts a message with type `STATUS` and the StatusDisplay listens for that message type.

> TODO: add more information to status messages
> Other components can also send status messages, so they should at least identify themselves

However, WebSocketManager is still coupled with the UI.
It has its own internal state/status.
Some outside code should manage the button states according to the WebSocketManager status.
(Should I broadcast all WebSocketManager status changes?)

So far RetryManager seems fully decoupled.
