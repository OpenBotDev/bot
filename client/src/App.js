import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MessagesTable from './MessagesTable'; // Import the MessagesTable component
//TODO
//import connectWebSocket from './websocketService';

function App() {
  const [poolCounter, setPoolCounter] = useState(0);
  const [messages, setMessages] = useState([]);
  const [messagesNewPool, setMessagesNewPool] = useState([]);
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);


  useEffect(() => {
    if (!connected) {
      //TOOD this will try connect twice for some reason
      console.log('connect...');

      const wss_srv_port = 8888;
      const websocket = new WebSocket('ws://localhost:' + wss_srv_port);
      setWs(websocket);

      websocket.onopen = () => {
        console.log('Connected to WebSocket server');
        setConnected(true);
      };

      websocket.onmessage = (event) => {
        //console.log('Message from server ', event.data);
        const msgObj = JSON.parse(event.data);
        console.log('msgobj ' + msgObj);
        console.log('topic: ' + msgObj.topic);

        if (msgObj.topic == 'newPool') {
          console.log('>> newpool ' + msgObj.msg);
          setMessagesNewPool((prevMessages) => [...prevMessages, msgObj.msg]);
        } else if (msgObj.topic == 'lastpools') {
          console.log('lastpools');
          console.log(msgObj.msg);

        } else if (msgObj.topic == 'log') {
          //TODO parse newpools

          // Log the parsed object for debugging
          console.log('Parsed message from server:', msgObj);
          setMessages((prevMessages) => [...prevMessages, msgObj.msg]);
        } else if (msgObj.topic == 'count_pools') {
          console.log('>> set count_pools ' + msgObj.msg);
          setPoolCounter(msgObj.msg);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error: ', error);
      };

      websocket.onclose = () => {
        console.log('Disconnected from WebSocket server');
      };

      return () => {
        //websocket.close();
        if (websocket.readyState === WebSocket.OPEN) {
          console.log('return');
          websocket.close();
        }
      };
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

      <div className="container mt-5">
        <header className="App-header">
          <h1 className="mb-3">Pool</h1>
          <MessagesTable messages={messagesNewPool} />
        </header>
      </div>

      <div className="container mt-5">
        <header className="App-header">
          <h1 className="mb-3">Logs</h1>
          <MessagesTable messages={messages} />
        </header>
      </div>
    </div>
  );
}

export default App;
