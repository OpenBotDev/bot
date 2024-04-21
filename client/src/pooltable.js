import React, { useEffect, useRef } from 'react';


const PoolTable = ({ messages }) => {
    const bottomRef = useRef(null);  // Create a ref

    useEffect(() => {
        // Scroll to the bottom ref element every time messages update
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);  // Dependency array to trigger effect when messages change

    return (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Pool Address</th>
                        <th>Dexscreener</th>
                    </tr>
                </thead>
                <tbody>
                    {messages.map((message, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{message}</td>
                            <td><a href={`https://dexscreener.com/solana/${message}`} target="_blank" rel="noopener noreferrer">
                                dexscreener
                            </a>
                            </td>

                        </tr>
                    ))}
                    {/* Invisible element at the bottom */}
                    <tr ref={bottomRef} />
                </tbody>
            </table>
        </div >
    );
};


export default PoolTable;
