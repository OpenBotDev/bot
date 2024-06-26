
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

import { LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk';


import { BN } from 'bn.js';

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

    public rpc_connection: Connection | null = null;
    //private coder: RaydiumAmmCoder | null = null;
    //private node_ws: WebSocket;
    private wss_server: WebSocket.Server;

    private counter_tx = 0;
    private counter_msg = 0;
    private counter_blocks = 0;
    private last_slot = 0;
    private ws_clients;
    //only 1 conn
    private client_connected = false;
    private last_pools: string[] = [];

    /**
     *      
     */
    public constructor() {
        let rpc = process.env.RPC_HOST;
        let wss = process.env.WSS_HOST!;
        logger.info("init rpc connection " + `${rpc}`);
        logger.info("init wss connection " + `${wss}`);
        this.rpc_connection = new Connection(`${process.env.RPC_HOST}`, { wsEndpoint: `${process.env.WSS_HOST}` });

        //this.node_ws = new WebSocket(wss);
        let wss_srv_port = 8888;
        this.wss_server = new WebSocket.Server({ port: wss_srv_port });
        this.setupWebSocketServer();

        //this.coder = new RaydiumAmmCoder(IDL as Idl);
    }

    /**
     * 
     */
    public async init() {
        if (!this.rpc_connection) {
            logger.error('rpc_connection not set');
            return;
        }

        try {
            const currentSlot = await this.rpc_connection.getSlot();

            logger.info('currentSlot:' + currentSlot);

            await this.subscribeToPoolCreate();

        } catch (error) {
            logger.error('Failed to fetch the blockheight');
            console.log(error);
        }

    }

    private setupWebSocketServer() {
        this.ws_clients = new Set();
        this.wss_server.on('connection', ws => {
            if (this.client_connected) {
                logger.info('Client  already connected');
            }
            //else {
            logger.info('Client connected to the server.');
            this.client_connected = true;

            this.ws_clients.add(ws);
            ws.on('message', message => {
                logger.info(`Received message: ${message}`);
                this.counter_msg++;
            });

            ws.send(JSON.stringify({ topic: 'lastpools', msg: this.last_pools }));

            ws.on('close', () => {
                logger.info('Client disconnected.');
            });
            //}
        });
    }

    private loginfo(msg) {
        this.log('log', msg);
    }

    private log(msgtopic: string, msg: string) {
        logger.info(msg);
        this.ws_clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ topic: msgtopic, msg: msg }));
            }
        });
    }

    private broadcast(msg: string) {
        logger.info(msg);
        this.ws_clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        });
    }

    public async subscribeToPoolCreate() {
        this.loginfo('subscribeToPoolCreate');
        if (!this.rpc_connection) {
            logger.error('no rpc_connection');
            return;
        }

        this.loginfo('track pools');

        const reportTime = 5000;
        const currentDate = new Date();
        const runTimestamp = currentDate.getTime() / 1000;
        let count_pools = 0;

        setInterval(() => {
            try {
                const currentDate = new Date();
                const t = currentDate.getTime() / 1000;
                const delta = (t - runTimestamp);

                this.loginfo('monitor heartbeat. time since start: ' + delta.toFixed(0));
                this.loginfo('pool found so far: ' + count_pools);
                this.log('count_pools', '' + count_pools);
            } catch (error) {
                logger.error('Error in setInterval:', error);
            }
        }, reportTime); // seconds

        const subscriptionId = this.rpc_connection.onLogs(new PublicKey(RAY_FEE), async (rlog) => {
            try {
                this.loginfo('sig found ' + rlog.signature);
                count_pools++;

                this.loginfo('get info');
                let tx = await this.getPoolTransaction(rlog.signature);

                if (tx != null) {
                    this.loginfo('pool create tx ' + tx);
                    let bt = tx.tx.blockTime;
                    this.loginfo('tx blocktime: ' + bt);
                    this.loginfo('tx poolAddress ' + tx.poolAddress);

                    //const key = updatedAccountInfo.accountId.toString();                

                    const poolInfo = await this.getPoolInfo(tx.poolAddress);


                    this.loginfo('poolOpenTime: ' + poolInfo.poolOpenTime);

                    const currentDate = new Date();
                    const t = currentDate.getTime() / 1000;
                    const delta_seconds = (t - poolInfo.poolOpenTime);
                    this.loginfo('delay to now: ' + delta_seconds.toFixed(0));
                    this.loginfo('quoteVault ' + poolInfo.quoteVault);

                    poolInfo.poolAddress = tx.poolAddress;
                    poolInfo.delay = delta_seconds;
                    this.loginfo('poolInfo ' + poolInfo);

                    //const poolKeys: LiquidityPoolKeysV4 = createPoolKeys(accountId, poolState, market);
                    if (this.rpc_connection) {
                        //logger.info()
                        const response = await this.rpc_connection.getTokenAccountBalance(poolInfo.quoteVault, this.rpc_connection.commitment);
                        let quoteToken = Token.WSOL;
                        const poolSize = new TokenAmount(quoteToken, response.value.amount, true);
                        logger.info('poolSize ' + poolSize);
                        this.loginfo('poolSize ' + poolSize);
                        poolInfo.poolSize = poolSize;
                    }

                    this.broadcast(JSON.stringify({ topic: 'newpool', msg: poolInfo }));
                    //this.last_pools.push(tx.poolAddress);
                    this.last_pools.push(poolInfo);

                    //TODO 
                    // await rabbitMQPublisher.publish('pool', JSON.stringify({
                    //     blockTime: Date.now(),
                    //     pool_address: tx?.poolAddress,
                    //     tx_signature: rlog.signature
                    // }));


                } else {
                    this.loginfo('tx is null');
                }
            } catch (error) {
                logger.error('Error in onLogs callback:', error);
            }

        });

        this.loginfo('subscribe. id: ' + subscriptionId);
    }



    public async getPoolTransaction(signature: string): Promise<PoolCreationTx | null> {
        try {
            if (!this.rpc_connection) return null;
            const tx = await this.rpc_connection.getParsedTransaction(signature, {
                maxSupportedTransactionVersion: 0,
            });
            const accounts = tx?.transaction?.message?.accountKeys;
            if (accounts) {
                // this.loginfo('pool create tx accounts > ');
                // this.loginfo(accounts[0].pubkey.toBase58());
                // this.loginfo(accounts[1].pubkey.toBase58());
                // this.loginfo(accounts[2].pubkey.toBase58());
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
                this.loginfo('failed to get account');
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