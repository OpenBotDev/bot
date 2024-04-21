import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import LogMessagesTable from './LogMessagesTable'; // Import the MessagesTable component
import PoolTable from './pooltable'; // Import the MessagesTable component
//TODO
//import connectWebSocket from './websocketService';

function App() {
  const [poolCounter, setPoolCounter] = useState(0);
  const [messages, setMessages] = useState([]);
  const [lastpools, setLastpools] = useState([]);
  const [messagesNewPool, setMessagesNewPool] = useState([]);
  const [ws, setWs] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const connectingRef = useRef(false);


  useEffect(() => {
    console.log("Component did mount or update.");
  }, []);

  useEffect(() => {
    //connectingRef prevent connect twice

    if (!connected && !connectingRef.current) {
      connectingRef.current = true;
      console.log('Starting connection...');


      const wss_srv_port = 8888;
      const websocket = new WebSocket('ws://localhost:' + wss_srv_port);
      setWs(websocket);

      websocket.onopen = () => {
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
          setMessagesNewPool((prevMessages) => [...prevMessages, msgObj.msg]);
        } else if (msgObj.topic == 'lastpools') {
          console.log('lastpools');
          console.log(msgObj.msg);
          setLastpools(msgObj.msg);

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
    <div className="App">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand" href="#">Openbot</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <a className="nav-link" href="#">Bot</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Wallet</a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="container mt-5">
        poolCounter: {poolCounter}
      </div>

      <div className="flex-container" style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div className="container">
          <header className="App-header">
            <h1 className="mb-3">Pool</h1>
            <PoolTable messages={lastpools} />
          </header>
        </div>

        <div className="container">
          <header className="App-header">
            <h1 className="mb-3">Logs</h1>
            <LogMessagesTable messages={messages} />
          </header>
        </div>
      </div>
    </div>


  );
}

export default App;
