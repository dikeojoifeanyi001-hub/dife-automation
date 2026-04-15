const cron = require('node-cron');
const { runRiskMonitor } = require('../jobs/riskMonitor');
const { runBillingJob } = require('../jobs/billingJob');
const { sendNotification } = require('../jobs/notificationJob');
const logger = require('../utils/logger');

function initScheduler() {
  logger.info('🚀 Initializing DIFE Automation Scheduler...');
  
  const riskJob = cron.schedule('*/2 * * * *', async () => {
    logger.info('-'.repeat(50));
    const result = await runRiskMonitor();
    
    if (result.highRiskCount > 0) {
      await sendNotification('HIGH_RISK', result);
    }
    logger.info('-'.repeat(50));
  });
  
  const billingJob = cron.schedule('*/5 * * * *', async () => {
    logger.info('='.repeat(50));
    const result = await runBillingJob();
    
    if (result.totalBilling > 0) {
      await sendNotification('BILLING_SUMMARY', result);
    }
    logger.info('='.repeat(50));
  });
  
  logger.info('✅ Scheduler initialized!');
  logger.info('   - Risk Monitor: Every 2 minutes');
  logger.info('   - Billing Job: Every 5 minutes');
  logger.info('');
  logger.info('⏰ Waiting for scheduled jobs to run...');
  logger.info('   Press Ctrl+C to stop the automation system\n');
  
  return { riskJob, billingJob };
}

module.exports = { initScheduler };