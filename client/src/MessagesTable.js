import React from 'react';

const MessagesTable = ({ messages }) => {
    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Message</th>
                </tr>
            </thead>
            <tbody>
                {messages.map((message, index) => (
                    <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{message}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MessagesTable;
