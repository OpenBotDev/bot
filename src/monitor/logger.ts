import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Custom log format
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let formattedMessage = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        formattedMessage += ` ${JSON.stringify(metadata)}`;
    }
    return formattedMessage;
});

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Shorter timestamp format
    winston.format((info) => {
        delete info.pid;
        delete info.hostname;
        // Adjust the deletion of 'level' based on the transport requirements
        return info;
    })(),
    customFormat // Ensure this is enabled to use the custom log format
);

// Ensure the logs directory exists
const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Configure the Winston logger
export const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            ),
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'app.log')
        }),
    ],
});

// Example log statement
logger.info('This is an info level message', { additional: 'data' });
