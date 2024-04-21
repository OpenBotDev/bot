import { logger } from './monitor/logger';
import { PoolMonitor } from './monitor/monitor'
import express from 'express';
import { createServer } from 'http';
import path from 'path';

//const wwwPath = path.resolve(__dirname, 'www');

(async () => {
  logger.info('start monitor');
  try {
    let monitor = new PoolMonitor();
    await monitor.init();

    // const app = express();
    // const server = createServer(app);

    // // Serve a simple HTML file
    // app.get('/', (req, res) => {
    //   res.sendFile('index.html', { root: wwwPath });
    // });

    // const PORT = process.env.PORT || 3000;
    // server.listen(PORT, () => {
    //   logger.info(`Server running on port ${PORT}`);
    // });

  } catch (error) {
    logger.error('An error occurred:', error);
  }
})();
