const logger = require('../utils/logger');

async function sendNotification(alertType, data) {
  try {
    logger.info(`[NOTIFICATION] Preparing ${alertType} alert...`);
    
    if (alertType === 'HIGH_RISK') {
      logger.alert(`[EMAIL SIMULATION] To: admin@logistics.com`);
      logger.alert(`[EMAIL SIMULATION] Subject: HIGH RISK ALERT - ${data.highRiskCount} route(s) detected`);
      logger.alert(`[EMAIL SIMULATION] Body: Please review the following high-risk routes:`);
      
      data.routes.forEach(route => {
        logger.alert(`[EMAIL SIMULATION]   - Route ${route.id}: ${route.origin} → ${route.destination} (Risk: ${route.risk_score})`);
      });
    }
    
    if (alertType === 'BILLING_SUMMARY') {
      logger.billing(`[WEBHOOK SIMULATION] Billing summary sent to accounting system`);
      logger.billing(`[WEBHOOK SIMULATION] Total billed: $${data.totalBilling}`);
    }
    
    logger.info('[NOTIFICATION] Notification sent successfully');
    return true;
    
  } catch (error) {
    logger.error(`Notification failed: ${error.message}`);
    return false;
  }
}

module.exports = { sendNotification };