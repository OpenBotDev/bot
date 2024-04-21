
import 'dotenv/config';

import { MAINNET_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import { buy, sell } from '../transact'

// saveTokenAccount

/**
 * 
 */
export class Example {

    //wsserver for webapp
    //wsclient from monitor
    //processRaydiumPool(id: PublicKey, poolState: LiquidityStateV4) {
    public constructor() {

        const reportTime = 5000;
        const currentDate = new Date();
        const runTimestamp = currentDate.getTime() / 1000;
        setInterval(() => {
            try {
                const currentDate = new Date();
                const t = currentDate.getTime() / 1000;
                const delta = (t - runTimestamp);

            } catch (error) {
                //logger.error('Error in setInterval:', error);
            }
        }, reportTime); // seconds

    }
}
