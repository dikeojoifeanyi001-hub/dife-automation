const { initScheduler } = require('./config/scheduler');
const logger = require('./utils/logger');

console.log('\n' + '='.repeat(60));
console.log('   DIFE AUTOMATION SYSTEM v1.0.0');
console.log('   Background Jobs & Scheduled Tasks');
console.log('='.repeat(60) + '\n');

logger.info('Starting DIFE Automation System...');
logger.info('Connecting to API: https://dife-saas-api-production.up.railway.app/api\n');

const scheduler = initScheduler();

process.on('SIGINT', () => {
  console.log('\n');
  logger.info('Shutting down DIFE Automation System...');
  logger.info('All scheduled jobs stopped.');
  process.exit(0);
});

setTimeout(async () => {
  logger.info('Running initial jobs on startup...');
  const { runRiskMonitor } = require('./jobs/riskMonitor');
  const { runBillingJob } = require('./jobs/billingJob');
  
  await runRiskMonitor();
  await runBillingJob();
}, 2000);