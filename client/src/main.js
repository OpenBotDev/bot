import React from 'react';
import PoolTable from './pooltable';
import LogMessagesTable from './LogMessagesTable';
import BotInfo from './botinfo'

function Main({ poolCounter, pools, messages, messagesBot }) {
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
                <BotInfo messagesBot={messagesBot} />
            </div>
            <div className="container mt-5">
                poolCounter: {poolCounter}
            </div>

            <div className="flex-container" style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div className="container">
                    <header className="App-header">
                        <h1 className="mb-3">Pool</h1>
                        <PoolTable pools={pools} />
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

export default Main;

