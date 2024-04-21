import React, { useEffect, useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import LogMessagesTable from './LogMessagesTable'; // Import the MessagesTable component
import PoolTable from './pooltable'; // Import the MessagesTable component
//TODO
import useWebSocketMonitor from './websocketMonitor';
import useWebSocketBot from './websocketBot';
import Main from './main';

function App() {
  let wsport_monitor = 8888;
  let wsport_bot = 9999;
  const { poolCounter, pools, messagesMonitor } = useWebSocketMonitor('ws://localhost:' + wsport_monitor);
  const { messagesBot } = useWebSocketBot('ws://localhost:' + wsport_bot);

  return (
    <Main poolCounter={poolCounter} pools={pools} messages={messagesMonitor} messagesBot={messagesBot} />
  );
}

export default App;
