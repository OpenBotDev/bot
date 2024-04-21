import React, { useEffect, useRef } from 'react';


const BotInfo = ({ messagesBot }) => {

    return (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <p>Bot info</p>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Message Text</th>
                    </tr>
                </thead>
                <tbody>
                    {messagesBot.length > 0 ? (
                        messagesBot.map((message, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{message}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2">No messages available</td>
                        </tr>
                    )}
                </tbody>
            </table>


        </div >
    );
};


export default BotInfo;
