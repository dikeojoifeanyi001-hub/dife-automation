/**
 * runAllJobs.js - Central Job Runner for DIFE Automation System
 * 
 * This file contains the core automation logic:
 * 1. Fetch all routes from the API
 * 2. Detect high-risk routes (risk_score > 70)
 * 3. Calculate billing ($5 per route)
 * 4. Return structured results with logs
 */

async function runAllJobs(env) {
  const results = {
    routesChecked: 0,
    highRiskRoutes: 0,
    highRiskDetails: [],
    billingAmount: 0,
    logs: [],
    timestamp: new Date().toISOString(),
    success: true
  };

  try {
    // Step 1: Fetch routes from API
    results.logs.push('Starting DIFE Automation Jobs...');
    results.logs.push(`API URL: ${env.API_URL || 'https://dife-saas-api-production.up.railway.app/api'}`);
    
    const response = await fetch(`${env.API_URL || 'https://dife-saas-api-production.up.railway.app/api'}/routes`, {
      headers: {
        'Authorization': `Bearer ${env.AUTH_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const routes = data.data || [];
    
    results.routesChecked = routes.length;
    results.logs.push(`✅ Fetched ${routes.length} routes from API`);

    // Step 2: Detect high-risk routes (risk_score > 70)
    results.logs.push(`🔍 Scanning ${routes.length} routes for high-risk conditions...`);
    
    routes.forEach(route => {
      if (route.risk_score > 70) {
        results.highRiskRoutes++;
        results.highRiskDetails.push({
          id: route.id,
          origin: route.origin,
          destination: route.destination,
          risk_score: route.risk_score,
          driver: route.driver_name || 'Unknown'
        });
        results.logs.push(`⚠️ HIGH RISK: Route ${route.id} (${route.origin} → ${route.destination}) | Risk Score: ${route.risk_score}`);
      }
    });

    if (results.highRiskRoutes === 0) {
      results.logs.push(`✅ No high-risk routes detected. All ${routes.length} routes are within safe limits.`);
    } else {
      results.logs.push(`🚨 TOTAL HIGH RISK ROUTES: ${results.highRiskRoutes}`);
    }

    // Step 3: Calculate billing ($5 per route)
    const COST_PER_ROUTE = 5;
    results.billingAmount = routes.length * COST_PER_ROUTE;
    results.logs.push(`💰 Billing calculated: ${routes.length} routes × $${COST_PER_ROUTE} = $${results.billingAmount}`);

    // Step 4: Group billing by company (bonus detail)
    const companyBilling = {};
    routes.forEach(route => {
      const companyName = route.driver_name ? `${route.driver_name}'s Company` : 'Unknown Company';
      if (!companyBilling[companyName]) {
        companyBilling[companyName] = { routeCount: 0, totalCost: 0 };
      }
      companyBilling[companyName].routeCount++;
      companyBilling[companyName].totalCost = companyBilling[companyName].routeCount * COST_PER_ROUTE;
    });
    
    results.companyBilling = companyBilling;
    results.logs.push(`📊 Billing breakdown: ${Object.keys(companyBilling).length} company(ies) billed`);

    results.logs.push(`✅ All jobs completed successfully at ${results.timestamp}`);
    
    // Console logging for Cloudflare dashboard visibility
    console.log('='.repeat(60));
    console.log(`[${results.timestamp}] DIFE AUTOMATION JOBS EXECUTED`);
    console.log(`📊 Routes Checked: ${results.routesChecked}`);
    console.log(`🚨 High Risk Routes: ${results.highRiskRoutes}`);
    console.log(`💰 Total Billing: $${results.billingAmount}`);
    console.log('='.repeat(60));

  } catch (error) {
    results.success = false;
    results.error = error.message;
    results.logs.push(`❌ ERROR: ${error.message}`);
    console.error(`[ERROR] runAllJobs failed: ${error.message}`);
  }

  return results;
}

module.exports = { runAllJobs };