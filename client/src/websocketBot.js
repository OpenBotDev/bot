// useWebSocket.js
import { useEffect, useState, useRef } from 'react';

/** */
function useWebSocketBot(url) {
    const [ws, setWs] = useState(null);
    const [connected, setConnected] = useState(false);
    const [messagesBot, setMessages] = useState([]);
    const connectingRef = useRef(false);

    useEffect(() => {
        if (!connected && !connectingRef.current) {
            connectingRef.current = true;
            console.log('Starting connection to bot');

            const websocket = new WebSocket(url);
            setWs(websocket);

            websocket.onopen = () => {
                console.log('Connected to bot server');
                setConnected(true);
                connectingRef.current = false;
            };

            websocket.onmessage = (event) => {
                //console.log('bot onmessage');
                const msgObj = JSON.parse(event.data);
                //console.log(msgObj);
                setMessages(prevMessages => [...prevMessages, msgObj.msg]);
            };

            websocket.onerror = (error) => {
                console.error('WebSocket error: ', error);
                connectingRef.current = false;
            };

            websocket.onclose = () => {
                console.log('Disconnected from bot server');
                connectingRef.current = false;
            };

            return () => {
                if (websocket.readyState === WebSocket.OPEN) {
                    websocket.close();
                }
            };
        }
    }, [url]);

    return { ws, connected, messagesBot };
}

export default useWebSocketBot;
