import { logger } from './logger';
import { PoolMonitor } from './monitor'

import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SolanaParser } from "@debridge-finance/solana-transaction-parser";
//import { RaydiumIDL } from "./idl/raydium_idl/idl.json";
import { RaydiumAmm, raydiumAmmProgram } from "./raydium/raydiumidl";
//import { BN, Idl, IdlTypes } from "@coral-xyz/anchor";
import idl from "./raydium/idl/raydium_idl/idl.json";
import { RaydiumAmmCoder } from "./raydium/coder";
import { Idl } from "@coral-xyz/anchor";
import dotenv from "dotenv";


// dotenv.config();


(async () => {
    logger.info('start monitor');
    try {
        let monitor = new PoolMonitor();
        await monitor.init();
        await monitor.subscribeAll();
        //await monitor.subscribeToPoolCreate();

        //9548101793880775430??
        // let d = await monitor.getPoolInfo('7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5');
        // console.log(d.poolOpenTime);
        // console.log(d.status);
    } catch (error) {
        logger.error('An error occurred:', error);
    }
})();
