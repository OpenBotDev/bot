// src/websocketService.js
let websocket = null;

const connectWebSocket = (onMessage, onError, onOpen, onClose) => {
    const wss_srv_port = 8888;
    console.log('connectWebSocket ');
    websocket = new WebSocket('ws://localhost:' + wss_srv_port);

    websocket.onopen = () => {
        console.log('Connected to WebSocket server');
        if (onOpen) onOpen();
    };

    websocket.onmessage = (event) => {
        console.log('Message from server ', event.data);
        if (onMessage) onMessage(event.data);
    };

    websocket.onerror = (error) => {
        console.error('WebSocket error: ', error);
        if (onError) onError(error);
    };

    websocket.onclose = (event) => {
        console.log('Disconnected from WebSocket server', event.reason);
        if (onClose) onClose();
        setTimeout(connectWebSocket, 1000, onMessage, onError, onOpen, onClose); // Reconnect logic
    };

    return () => {
        websocket.close();
    };
};

export const sendMessage = (message) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(message);
    } else {
        console.log("WebSocket is not connected.");
    }
};

export default connectWebSocket;
