/**
 * DIFE Automation System - Cloudflare Worker
 * 
 * Features:
 * - /health - Health check endpoint
 * - /run-jobs - Main automation endpoint (returns full results)
 * - /run/risk - Legacy risk monitor endpoint
 * - /run/billing - Legacy billing endpoint
 * - Scheduled cron jobs (every 5 minutes)
 */

const { runAllJobs } = require('./runAllJobs');

// Helper function for logging
function log(level, message) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: level,
    message: message
  }));
}

async function runRiskMonitor(env) {
  try {
    log('INFO', 'Starting Risk Monitor Job...');
    
    const response = await fetch(`${env.API_URL || 'https://dife-saas-api-production.up.railway.app/api'}/routes`, {
      headers: {
        'Authorization': `Bearer ${env.AUTH_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    const routes = data.data || [];
    
    log('INFO', `Found ${routes.length} routes to analyze`);
    
    const highRiskRoutes = routes.filter(route => route.risk_score > 70);
    
    if (highRiskRoutes.length === 0) {
      log('INFO', 'No high-risk routes detected.');
    } else {
      log('ALERT', `Found ${highRiskRoutes.length} high-risk route(s)!`);
      
      highRiskRoutes.forEach(route => {
        log('ALERT', `Route ${route.id}: ${route.origin} → ${route.destination} | Risk: ${route.risk_score}`);
      });
    }
    
    log('INFO', 'Risk Monitor Job completed.');
    return { highRiskCount: highRiskRoutes.length };
    
  } catch (error) {
    log('ERROR', `Risk Monitor failed: ${error.message}`);
    return { highRiskCount: 0, error: error.message };
  }
}

async function runBillingJob(env) {
  try {
    log('INFO', 'Starting Billing Job...');
    
    const response = await fetch(`${env.API_URL || 'https://dife-saas-api-production.up.railway.app/api'}/routes`, {
      headers: {
        'Authorization': `Bearer ${env.AUTH_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    const routes = data.data || [];
    
    const COST_PER_ROUTE = 5;
    const companyBilling = {};
    
    routes.forEach(route => {
      const companyName = route.driver_name ? `${route.driver_name}'s Company` : 'Unknown';
      if (!companyBilling[companyName]) {
        companyBilling[companyName] = { routeCount: 0, totalCost: 0 };
      }
      companyBilling[companyName].routeCount++;
      companyBilling[companyName].totalCost = companyBilling[companyName].routeCount * COST_PER_ROUTE;
    });
    
    const companyNames = Object.keys(companyBilling);
    let totalBilling = 0;
    
    companyNames.forEach(name => {
      totalBilling += companyBilling[name].totalCost;
      log('BILLING', `${name}: ${companyBilling[name].routeCount} route(s) → Billed $${companyBilling[name].totalCost}`);
    });
    
    log('BILLING', `💰 TOTAL BILLING: $${totalBilling}`);
    log('INFO', 'Billing Job completed.');
    
    return { companies: companyNames.length, totalBilling: totalBilling };
    
  } catch (error) {
    log('ERROR', `Billing Job failed: ${error.message}`);
    return { companies: 0, totalBilling: 0, error: error.message };
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // MAIN DEBUG ENDPOINT - PROVES YOUR SYSTEM WORKS
    if (url.pathname === '/run-jobs') {
      log('INFO', 'Manual job trigger via /run-jobs endpoint');
      const result = await runAllJobs(env);
      
      return new Response(JSON.stringify(result, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'DIFE Automation System'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Legacy endpoints (kept for backward compatibility)
    if (url.pathname === '/run/risk') {
      const result = await runRiskMonitor(env);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/run/billing') {
      const result = await runBillingJob(env);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Root endpoint
    return new Response('DIFE Automation System Running', { status: 200 });
  },
  
  // AUTOMATIC JOB RUNNER - Runs on schedule
  async scheduled(event, env, ctx) {
    const cron = event.cron;
    
    log('INFO', `========================================`);
    log('INFO', `Scheduled job triggered: ${cron}`);
    
    // Run the complete job suite
    const result = await runAllJobs(env);
    
    log('INFO', `Scheduled job completed:`);
    log('INFO', `  - Routes Checked: ${result.routesChecked}`);
    log('INFO', `  - High Risk Routes: ${result.highRiskRoutes}`);
    log('INFO', `  - Total Billing: $${result.billingAmount}`);
    log('INFO', `========================================`);
    
    // If high-risk routes were found, log an extra alert
    if (result.highRiskRoutes > 0) {
      log('ALERT', `🚨 ${result.highRiskRoutes} HIGH RISK ROUTES DETECTED! Action required.`);
      result.highRiskDetails.forEach(route => {
        log('ALERT', `  - Route ${route.id}: ${route.origin} → ${route.destination} (Risk: ${route.risk_score})`);
      });
    }
  }
};