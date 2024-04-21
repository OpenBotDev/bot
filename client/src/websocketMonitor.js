// useWebSocket.js
import { useEffect, useState, useRef } from 'react';

/** 
 * connect to monitor WS
*/
function useWebSocketMonitor(url) {
    const [ws, setWs] = useState(null);
    const [connected, setConnected] = useState(false);
    const [messagesMonitor, setMessages] = useState([]);
    const [pools, setPools] = useState([]);
    const [poolCounter, setPoolCounter] = useState(0);
    const connectingRef = useRef(false);

    useEffect(() => {
        if (!connected && !connectingRef.current) {
            connectingRef.current = true;
            console.log('Starting connection...');

            const websocket = new WebSocket(url);
            setWs(websocket);

            websocket.onopen = () => {
                console.log('Connected to monitor WebSocket server');
                setConnected(true);
                connectingRef.current = false;
            };

            websocket.onmessage = (event) => {
                const msgObj = JSON.parse(event.data);
                if (msgObj.topic === 'newPool') {
                    setPools(prevPools => [...prevPools, msgObj.msg]);
                } else if (msgObj.topic === 'lastpools') {
                    setPools(msgObj.msg);
                } else if (msgObj.topic === 'log') {
                    setMessages(prevMessages => [...prevMessages, msgObj.msg]);
                } else if (msgObj.topic === 'count_pools') {
                    setPoolCounter(msgObj.msg);
                }
            };

            websocket.onerror = (error) => {
                console.error('WebSocket error: ', error);
                connectingRef.current = false;
            };

            websocket.onclose = () => {
                console.log('Disconnected from WebSocket server');
                connectingRef.current = false;
            };

            return () => {
                if (websocket.readyState === WebSocket.OPEN) {
                    websocket.close();
                }
            };
        }
    }, [url]);

    return { ws, connected, messagesMonitor, pools, poolCounter };
}

export default useWebSocketMonitor;
