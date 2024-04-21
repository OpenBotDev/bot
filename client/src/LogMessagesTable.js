import React, { useEffect, useRef } from 'react';

// const MessagesTable = ({ messages }) => {
//     const [currentPage, setCurrentPage] = useState(1);
//     const messagesPerPage = 10;

//     // Calculate the index of the first and last message on the current page
//     const indexOfLastMessage = currentPage * messagesPerPage;
//     const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;

//     // Slice out the messages for the current page
//     const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);

//     // Change page handlers
//     const nextPage = () => {
//         if (currentPage < Math.ceil(messages.length / messagesPerPage)) {
//             setCurrentPage(currentPage + 1);
//         }
//     };

//     const prevPage = () => {
//         if (currentPage > 1) {
//             setCurrentPage(currentPage - 1);
//         }
//     };

//     return (
//         <div>
//             <table className="table table-striped">
//                 <thead>
//                     <tr>
//                         <th>#</th>
//                         <th>Message Text</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {currentMessages.map((message, index) => (
//                         <tr key={index}>
//                             <td>{indexOfFirstMessage + index + 1}</td>
//                             <td>{message}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//             <div className="pagination">
//                 <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
//                 <button onClick={nextPage} disabled={currentPage >= Math.ceil(messages.length / messagesPerPage)}>Next</button>
//             </div>
//         </div>
//     );
// };


const LogMessagesTable = ({ messages }) => {
    //const bottomRef = useRef(null);  // Create a ref

    useEffect(() => {
        // Scroll to the bottom ref element every time messages update
        //bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);  // Dependency array to trigger effect when messages change

    return (
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Message Text</th>
                    </tr>
                </thead>
                <tbody>
                    {messages.map((message, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{message}</td>
                        </tr>
                    ))}
                    {/* Invisible element at the bottom */}
                    {/* <tr ref={bottomRef} /> */}
                </tbody>
            </table>
        </div>
    );
};

export default LogMessagesTable;
