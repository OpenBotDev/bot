import React, { useEffect, useRef } from 'react';


const PoolTable = ({ pools }) => {
    //console.log('pools ' + pools);
    const bottomRef = useRef(null);  // Create a ref

    useEffect(() => {
        // Scroll to the bottom ref element every time messages update
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [pools]);  // Dependency array to trigger effect when messages change

    return (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>poolOpenTime</th>
                        {/* <th>lpMint</th> */}
                        {/* <th>baseVault</th> */}
                        {/* <th>marketId</th> */}
                        <th>Dexscreener</th>
                    </tr>
                </thead>
                <tbody>
                    {pools.map((pool, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{pool.poolOpenTime}</td>
                            {/* <td>{pool.lpMint}</td> */}
                            {/* <td>{pool.baseVault}</td> */}
                            {/* <td>{pool.marketId}</td> */}
                            <td><a href={`https://dexscreener.com/solana/${pool.lpMint}`} target="_blank" rel="noopener noreferrer">
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
