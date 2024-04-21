
import 'dotenv/config';

import { logger } from './logger';
import { decodeRayLogSwap } from './decode'
const util = require('util');
import { Connection, PublicKey } from '@solana/web3.js';
//import { BorshCoder, Idl } from '@coral-xyz/anchor';
import { MAINNET_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import { Idl } from "@project-serum/anchor";
import { LIQUIDITY_STATE_LAYOUT_V4, MARKET_STATE_LAYOUT_V3, Token, TokenAmount } from '@raydium-io/raydium-sdk';
import WebSocket, { Server } from 'ws';

import { BN } from 'bn.js';
import {
    SolanaParser,
    parseTransactionAccounts,
} from '@debridge-finance/solana-transaction-parser';

export const RAYDIUM_LIQUIDITY_PROGRAM_ID_V4 = MAINNET_PROGRAM_ID.AmmV4;

export const RAY_FEE = new PublicKey(
    '7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5'
);

logger.info(`connect ${process.env.RPC_HOST} ${process.env.WSS_HOST}`)

import { PoolCreationTx } from './types'

// const io = require('@pm2/io')

/**
 * monitor pools
 */
export class PoolMonitor {

    private rpc_connection: Connection | null = null;
    //private coder: RaydiumAmmCoder | null = null;
    private node_ws: WebSocket;
    private wss_server: WebSocket.Server;

    private counter_tx = 0;
    private counter_msg = 0;
    private counter_blocks = 0;
    private last_slot = 0;

    /**
     * Initializes a new instance of the PoolMonitor class.
     * Private constructor to enforce singleton pattern.
     */
    public constructor() {
        let rpc = process.env.RPC_HOST;
        let wss = process.env.WSS_HOST!;
        logger.info("init connection " + `${rpc}`);
        logger.info("init connection " + `${wss}`);
        this.rpc_connection = new Connection(`${process.env.RPC_HOST}`, { wsEndpoint: `${process.env.WSS_HOST}` });

        this.node_ws = new WebSocket(wss);
        this.wss_server = new WebSocket.Server({ port: 8080 });
        this.setupWebSocketServer();

        //this.coder = new RaydiumAmmCoder(IDL as Idl);
    }

    /**
     * Initializes the PoolMonitor by subscribing to logs.
     */
    public async init() {
        if (!this.rpc_connection) return;

        try {
            const currentSlot = await this.rpc_connection.getSlot();

            logger.info('currentSlot:' + currentSlot);
            this.setupWebSocketServer();
            await this.subscribeToPoolCreate();

        } catch (error) {
            logger.error('Failed to fetch the blockheight');
            console.log(error);
        }

    }

    private setupWebSocketServer() {
        this.wss_server.on('connection', ws => {
            logger.info('Client connected to the server.');
            ws.on('message', message => {
                logger.info(`Received message: ${message}`);
                this.counter_msg++;
                // Echo the received message to all connected clients
                //this.broadcast(`Echo: ${message}`);
            });

            ws.on('close', () => {
                logger.info('Client disconnected.');
            });
        });
    }

    public async subscribeToPoolCreate() {
        logger.info('subscribeToPoolCreate');
        if (!this.rpc_connection) {
            logger.error('no rpc_connection');
            return;
        }

        logger.info('track pools');

        const reportTime = 5000;
        const currentDate = new Date();
        const runTimestamp = currentDate.getTime() / 1000;
        let count_pools = 0;

        setInterval(() => {
            try {
                const currentDate = new Date();
                const t = currentDate.getTime() / 1000;
                const delta = (t - runTimestamp);

                logger.info('Seconds since start: ' + delta.toFixed(0));
                logger.info('count_pools ' + count_pools);
            } catch (error) {
                logger.error('Error in setInterval:', error);
            }
        }, reportTime); // seconds

        const subscriptionId = this.rpc_connection.onLogs(new PublicKey(RAY_FEE), async (rlog) => {
            try {
                //let lastlog: string = rlog.logs[rlog.logs.length - 1];
                logger.info('sig found ' + rlog.signature);
                count_pools++;

                logger.info('get info');
                let tx = await this.getPoolTransaction(rlog.signature);

                if (tx != null) {
                    logger.info('pool create tx ' + tx);
                    let bt = tx.tx.blockTime;
                    logger.info('tx blocktime: ' + bt);

                    logger.info('tx poolAddress ' + tx.poolAddress);

                    //const key = updatedAccountInfo.accountId.toString();                

                    const poolInfo = await this.getPoolInfo(tx.poolAddress);
                    logger.info('poolOpenTime: ' + poolInfo.poolOpenTime);

                    const currentDate = new Date();
                    const t = currentDate.getTime() / 1000;
                    const delta_seconds = (t - poolInfo.poolOpenTime);
                    logger.info('delay to now: ' + delta_seconds.toFixed(0));

                    //TODO 
                    // await rabbitMQPublisher.publish('pool', JSON.stringify({
                    //     blockTime: Date.now(),
                    //     pool_address: tx?.poolAddress,
                    //     tx_signature: rlog.signature
                    // }));


                } else {
                    logger.info('tx is null');
                }
            } catch (error) {
                logger.error('Error in onLogs callback:', error);
            }

        });

        logger.info('subscribe. id: ' + subscriptionId);
    }

    private async getPoolTransaction(signature: string): Promise<PoolCreationTx | null> {
        try {
            if (!this.rpc_connection) return null;
            const tx = await this.rpc_connection.getParsedTransaction(signature, {
                maxSupportedTransactionVersion: 0,
            });
            const accounts = tx?.transaction?.message?.accountKeys;
            if (accounts) {
                // logger.info('pool create tx accounts > ');
                // logger.info(accounts[0].pubkey.toBase58());
                // logger.info(accounts[1].pubkey.toBase58());
                // logger.info(accounts[2].pubkey.toBase58());
                return { poolAddress: accounts[2].pubkey.toBase58(), tx: tx };
            } else {
                return null;
            }
        } catch (error) {
            logger.error('Failed to get pool transaction');
            return null;
        }
    }

    private parseBnValues(obj: any): any {
        const parsedObj: any = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                let value = obj[key];

                if (value instanceof PublicKey) {
                    // PublicKey -> base58 string
                    parsedObj[key] = value.toBase58();
                } else if (value instanceof BN) {
                    // BN -> string
                    parsedObj[key] = value.toString();
                } else if (typeof value === 'object' && value !== null) {
                    // Recursively parse object properties
                    parsedObj[key] = this.parseBnValues(value);
                } else {
                    parsedObj[key] = value;
                }
            }
        }
        return parsedObj;
    }

    public async getPoolInfo(address: string): Promise<any | null> {

        try {
            const info = await this.rpc_connection!.getAccountInfo(new PublicKey(address));
            if (!info) {
                logger.info('failed to get account');
                return null;
            }
            const result = LIQUIDITY_STATE_LAYOUT_V4.decode(info.data);
            const poolState = this.parseBnValues(result);
            return poolState;
        } catch (error) {
            logger.error('error getPoolInfo ' + error);
            return null;
        }
    }

}