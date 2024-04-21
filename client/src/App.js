import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MessagesTable from './MessagesTable'; // Import the MessagesTable component

function App() {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!connected) {
      console.log('connect...');
      console.log('connected ' + connected);

      const wss_srv_port = 8888;
      const websocket = new WebSocket('ws://localhost:' + wss_srv_port);
      //const websocket = new WebSocket('wss://echo.websocket.org');
      setWs(websocket);

      websocket.onopen = () => {
        console.log('Connected to WebSocket server');
        setConnected(true);
      };

      websocket.onmessage = (event) => {
        console.log('Message from server ', event.data);
        setMessages((prevMessages) => [...prevMessages, event.data]);
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
        <a className="navbar-brand" href="#">WebSocketApp</a>
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
        <header className="App-header">
          <h1 className="mb-3">WebSocket Messages</h1>
          <MessagesTable messages={messages} />
        </header>
      </div>
    </div>
  );
}

export default App;
