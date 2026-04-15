const API = require('../services/apiService');
const logger = require('../utils/logger');

async function runRiskMonitor() {
  try {
    logger.info('Starting Risk Monitor Job...');
    
    const response = await API.get('/routes');
    const routes = response.data.data || [];
    
    logger.info(`Found ${routes.length} routes to analyze`);
    
    const highRiskRoutes = routes.filter(route => route.risk_score > 70);
    
    if (highRiskRoutes.length === 0) {
      logger.info('No high-risk routes detected. All routes are within safe limits.');
    } else {
      logger.alert(`Found ${highRiskRoutes.length} high-risk route(s)!`);
      
      highRiskRoutes.forEach(route => {
        logger.alert(`Route ID: ${route.id} | ${route.origin} → ${route.destination} | Risk Score: ${route.risk_score}`);
      });
    }
    
    logger.info('Risk Monitor Job completed.');
    return { highRiskCount: highRiskRoutes.length, routes: highRiskRoutes };
    
  } catch (error) {
    logger.error(`Risk Monitor failed: ${error.message}`);
    return { highRiskCount: 0, routes: [], error: error.message };
  }
}

module.exports = { runRiskMonitor };