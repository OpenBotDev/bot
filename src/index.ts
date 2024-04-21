import { logger } from './monitor/logger';
import { PoolMonitor } from './monitor/monitor'


(async () => {
  logger.info('start monitor');
  try {
    let monitor = new PoolMonitor();
    await monitor.init();
    //await monitor.subscribeToPoolCreate();

    //9548101793880775430??
    // let d = await monitor.getPoolInfo('7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5');
    // console.log(d.poolOpenTime);
    // console.log(d.status);
  } catch (error) {
    logger.error('An error occurred:', error);
  }
})();
