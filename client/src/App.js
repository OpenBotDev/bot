import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import LogMessagesTable from './LogMessagesTable'; // Import the MessagesTable component
import PoolTable from './pooltable'; // Import the MessagesTable component
//TODO
//import connectWebSocket from './websocketService';
import Main from './main';

function App() {
  const [poolCounter, setPoolCounter] = useState(0);
  const [messages, setMessages] = useState([]);
  const [pools, setPools] = useState([]);
  const [ws, setWs] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const connectingRef = useRef(false);

  useEffect(() => {
    //connectingRef prevent connect twice

    if (!connected && !connectingRef.current) {
      connectingRef.current = true;
      console.log('Starting connection...');

      const wss_srv_port = 8888;
      let ws = new WebSocket('ws://localhost:' + wss_srv_port);
      setWs(websocket);

      ws.onopen = () => {
        console.log('Connected to WebSocket server');
        setConnected(true);
        connectingRef.current = false;
      };

      websocket.onmessage = (event) => {
        const msgObj = JSON.parse(event.data);
        //console.log('msgobj ' + msgObj);
        //console.log('topic: ' + msgObj.topic);

        if (msgObj.topic == 'newPool') {
          console.log('>> newpool ' + msgObj.msg);
          setPools((prevPools) => [...prevPools, msgObj.msg]);
        } else if (msgObj.topic == 'lastpools') {
          console.log('lastpools');
          console.log(msgObj.msg);
          setPools(msgObj.msg);

        } else if (msgObj.topic == 'log') {
          //TODO parse newpools

          // Log the parsed object for debugging
          //console.log('Parsed message from server:', msgObj);
          setMessages((prevMessages) => [...prevMessages, msgObj.msg]);
        } else if (msgObj.topic == 'count_pools') {
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
        //websocket.close();
        if (websocket.readyState === WebSocket.OPEN) {
          console.log('return');
          websocket.close();
        }
      };
    } else {
      if (connecting) {
        console.log('Connection attempt already in progress...');
      }
    }

  }, []);

  return (
    <Main poolCounter={poolCounter} pools={pools} messages={messages} />
  );
}

export default App;
