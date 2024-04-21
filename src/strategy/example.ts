
import 'dotenv/config';

import { MAINNET_PROGRAM_ID } from '@raydium-io/raydium-sdk';
import { buy, sell } from '../transact'
import WebSocket, { Server } from 'ws';
import { logger } from '../monitor/logger';

// saveTokenAccount

/**
 * 
 */
export class Example {

    private wss_server: WebSocket.Server;
    private ws_clients;
    //only 1 conn
    private client_connected = false;

    public constructor() {

        let wss_srv_port = 9999;
        this.wss_server = new WebSocket.Server({ port: wss_srv_port });

        const reportTime = 5000;
        const currentDate = new Date();
        const runTimestamp = currentDate.getTime() / 1000;
        // setInterval(() => {
        //     try {
        //         const currentDate = new Date();
        //         const t = currentDate.getTime() / 1000;
        //         const delta = (t - runTimestamp);
        //         logger.info('bot running');
        //     } catch (error) {
        //         //logger.error('Error in setInterval:', error);
        //     }
        // }, reportTime); // seconds

        this.setupWebSocketServer();
        this.runMain();
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

            });

            ws.on('close', () => {
                logger.info('Client disconnected.');
            });
            //}
        });
    }

    public runMain() {
        logger.info('run main');
        setInterval(() => {

            this.broadcast('msg', 'This block runs every second.');

        }, 1000);
    }

    private log(msgtopic: string, msg: string) {
        logger.info(msg);
        this.ws_clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ topic: msgtopic, msg: msg }));
            }
        });
    }

    private broadcast(topic: string, msg: string) {
        logger.info(msg);
        this.ws_clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ topic: topic, msg: msg }));
            }
        });
    }
}


let example = new Example();