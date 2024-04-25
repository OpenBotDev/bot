
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

    //TODO subscriber to monitor

    private wss_server: WebSocket.Server;
    private ws_clients;
    private wss_monitor_client;
    //only 1 conn
    private client_connected = false;

    public constructor() {

        let wss_srv_port = 9999;
        let wss_monitor_port = 8888;
        this.wss_server = new WebSocket.Server({ port: wss_srv_port });

        this.wss_monitor_client = new WebSocket(`ws://localhost:${wss_monitor_port}`);


        this.setupWebSocketServer();
        this.setupWebSocketClient();
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

                const msgObj = JSON.parse(message.toString());
                if (msgObj.topic === 'newPool') {
                    logger.info('observed new pool ' + msgObj);
                    this.broadcast('msg', 'observed new pool');
                    //setPools(prevPools => [...prevPools, msgObj.msg]);
                }

            });

            ws.on('close', () => {
                logger.info('Client disconnected.');
            });
            //}
        });
    }

    setupWebSocketClient() {
        this.wss_monitor_client.on('open', () => {
            console.log('Client connected to montior');

            // Regularly send a heartbeat or a test message
            // setInterval(() => {
            //     //this.wss_monitor_client.send('Hello from client!');
            // }, 5000);
        });

        this.wss_monitor_client.on('message', message => {
            console.log(`bot received from monitor: ${message}`);
            this.broadcast('msg', `bot received from monitor: ${message}`);
            const msgObj = JSON.parse(message);
            if (msgObj.topic == 'newpool') {
                console.log('evaluate new pool ' + msgObj);
            } else if (msgObj.topic == 'lastpools') {
                console.log('evaluate last pools ' + msgObj);
                let pools = msgObj.msg;
                pools.forEach((pool => {
                    console.log('evaluate ' + pool.poolOpenTime);
                }))
            }

        });

        this.wss_monitor_client.on('close', () => {
            console.log('Client disconnected from port 888');
        });

        this.wss_monitor_client.on('error', error => {
            console.error('WebSocket error:', error);
        });
    }

    public runMain() {
        this.broadcast('msg', 'start bot');
        setInterval(() => {

            //this.broadcast('msg', 'bot heartbeat');

        }, 1000);

        setInterval(() => {

            this.broadcast('msg', 'bot heartbeat');

        }, 10000);
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