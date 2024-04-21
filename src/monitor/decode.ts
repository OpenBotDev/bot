// 0 => LogType::Init,
// 1 => LogType::Deposit,
// 2 => LogType::Withdraw,
// 3 => LogType::SwapBaseIn,
// 4 => LogType::SwapBaseOut,


export function decodeRayLogInit(encodedLog: string): any {
    // pub struct InitLog {
    //     pub log_type: u8,
    //     pub time: u64,
    //     pub pc_decimals: u8,
    //     pub coin_decimals: u8,
    //     pub pc_lot_size: u64,
    //     pub coin_lot_size: u64,
    //     pub pc_amount: u64,
    //     pub coin_amount: u64,
    //     pub market: Pubkey,
    // }

    try {
        //console.log(encodedLog);

        // Base64 decode the string to get back the original byte array
        const buffer = Buffer.from(encodedLog, 'base64');
        const log_type = buffer[0];
        //console.log("?? " + log_type);
        let offset = 0;
        let buf_logtype = (buffer.buffer.slice(offset, offset + 1));
        offset += 1;
        let buf_time = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_pcd = (buffer.buffer.slice(offset, offset + 1));
        offset += 1;
        let buf_cd = (buffer.buffer.slice(offset, offset + 1));
        offset += 1;
        let buf_pclot = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_clot = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_pc_amount = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_coin_amount = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_coi = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        //pubkey

        const ltime = new DataView(buf_time).getBigUint64(0, true);;

        return {
            log_type,
            time: ltime.toString(),
        };


    } catch (error) {
        console.error('Failed to decode and parse the log:', error);
        return null;
    }

}
export function decodeRayLogSwap(encodedLog: string): any {
    //console.log(">> " + encodedLog);
    try {
        //console.log(encodedLog);

        // Base64 decode the string to get back the original byte array
        const buffer = Buffer.from(encodedLog, 'base64');
        const log_type = buffer[0];
        //console.log("?? " + log_type);
        let offset = 0;
        let buf_logtype = (buffer.buffer.slice(offset, offset + 1));
        offset += 1;
        let buf_amount_in = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_minimum_out = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_direction = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_user_source = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_pool_coin = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_pool_pc = (buffer.buffer.slice(offset, offset + 8));
        offset += 8;
        let buf_out_amount = (buffer.buffer.slice(offset, offset + 8));

        //console.log(new Uint8Array(buf_logtype));
        //console.log();

        const amount_in = new DataView(buf_amount_in).getBigUint64(0, true);;
        const minimum_out = new DataView(buf_minimum_out).getBigUint64(0, true);;
        const direction = new DataView(buf_direction).getBigUint64(0, true);;
        const user_source = new DataView(buf_user_source).getBigUint64(0, true);;
        const pool_coin = new DataView(buf_pool_coin).getBigUint64(0, true);;
        const pool_pc = new DataView(buf_pool_pc).getBigUint64(0, true);;
        const out_amount = new DataView(buf_out_amount).getBigUint64(0, true);;



        //const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        //const log_type = dataView.getUint8(offset); offset += 1;

        let sdirection = '';
        if (direction.toString() == '1') {
            sdirection = 'buy';
        }
        else {
            sdirection = 'sell';
        }

        //TODO decimals

        return {
            log_type,
            amount_in: amount_in.toString(),
            amount_ind: amount_in.toString(),
            minimum_out: minimum_out.toString(),
            direction: direction.toString(),
            user_source: user_source.toString(),
            pool_coin: pool_coin.toString(),
            pool_pc: pool_pc.toString(),
            out_amount: out_amount.toString(),
            sdirection: sdirection
        };


    } catch (error) {
        console.error('Failed to decode and parse the log:', error);
        return null;
    }
}

// let s = 'A6g39QIAAAAAab8C9sqFAAABAAAAAAAAAKg39QIAAAAAl8AbU1GQiwEq7bBzBwAAALSigFBgnAAA';

//buy
//2wSWUVh142CE9GWNbP4ppnNJDAw5nv5adcEcsdniJDtbQ7sJ4CzgA6T25roAoHVmgB9Tbg8iYd21BmTM25MSq6FQ
//Swap 1.2 SOL for 40,771.36114 MEW
//let s = 'BP//////////AOQLVAIAAAABAAAAAAAAANIQja4AAAAAykVxTXAcAQDq7gAfFlMAAJkQja4AAAAA';
//let s = 'A/CKy+tIAgAAAAAAAAAAAAACAAAAAAAAAJQYl9eRBAAAX+86//97QQDuJhiqBAAAAM6NKQAAAAAA';
//let s = 'A/yFQA0AAAAAAAAAAAAAAAABAAAAAAAAAPyFQA0AAAAA0cxAds9AAAAXo9ImGwAAALc3TX4fAAAA';

//let s = 'AzQIAAAAAAAAIzSiAzlyEgABAAAAAAAAADQIAAAAAAAADGvwP26MJgBpAAAAAAAAALcQZCM5tSQA';
// //3RdeRSmgaSyko8vETPSeCc7DgqnCQaKd5S4fqEc24Xi1miAWA7HCT54D3Ay2jZLQQvTNjcJhfy1nhX2EUEWFSBun
//let info = decodeRayLogSwap(s)
// console.log(info.amount_in / 10 ** 9);
// console.log(info.out_amount / 10 ** 9);
// console.log(info.sdirection);

//sell
//28fnV4wg4L7rZ45F1xxh2hbnUAqHEw1SFLb8PpGeuRxyXAxqgB8uTgj3RPGQ7zEjqNjMcQEuvpP7sTnphTPNqsE4
//Swap
//40,000 MEW for 1.170626487 SOL


// {
//     log_type: 4,
//     amount_in: "18446744073709551615",
//     minimum_out: "10000000000",
//     direction: "1",
//     user_source: "2928480466",
//     pool_coin: "312743637894602",
//     pool_pc: "91354474540778",
//     out_amount: "2928480409",
//   }