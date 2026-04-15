const API = require('../services/apiService');
const logger = require('../utils/logger');

const COST_PER_ROUTE = 5;

async function runBillingJob() {
  try {
    logger.info('Starting Billing Job...');
    
    const routesResponse = await API.get('/routes');
    const routes = routesResponse.data.data || [];
    
    const companyBilling = {};
    
    routes.forEach(route => {
      const companyName = route.driver_name ? `${route.driver_name}'s Company` : 'Unknown Company';
      
      if (!companyBilling[companyName]) {
        companyBilling[companyName] = { routeCount: 0, totalCost: 0 };
      }
      companyBilling[companyName].routeCount++;
      companyBilling[companyName].totalCost = companyBilling[companyName].routeCount * COST_PER_ROUTE;
    });
    
    const companyNames = Object.keys(companyBilling);
    
    if (companyNames.length === 0) {
      logger.info('No companies with routes found. No billing generated.');
    } else {
      logger.info(`Found ${companyNames.length} company(ies) with routes.`);
      
      companyNames.forEach(companyName => {
        const { routeCount, totalCost } = companyBilling[companyName];
        logger.billing(`${companyName}: ${routeCount} route(s) → Billed $${totalCost}`);
      });
      
      const totalBilling = companyNames.reduce((sum, name) => sum + companyBilling[name].totalCost, 0);
      logger.billing(`💰 TOTAL BILLING THIS CYCLE: $${totalBilling}`);
    }
    
    logger.info('Billing Job completed.');
    return { companies: companyNames.length, totalBilling: companyNames.reduce((sum, name) => sum + companyBilling[name].totalCost, 0) };
    
  } catch (error) {
    logger.error(`Billing Job failed: ${error.message}`);
    return { companies: 0, totalBilling: 0, error: error.message };
  }
}

module.exports = { runBillingJob };