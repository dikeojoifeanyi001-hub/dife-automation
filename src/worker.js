// DIFE Automation System - Cloudflare Worker

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
    
    const response = await fetch(`${env.API_URL}/routes`, {
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
    
    const response = await fetch(`${env.API_URL}/routes`, {
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
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
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
    
    return new Response('DIFE Automation System Running', { status: 200 });
  },
  
  async scheduled(event, env, ctx) {
    const cron = event.cron;
    
    log('INFO', `Scheduled job triggered: ${cron}`);
    
    if (cron === '*/2 * * * *') {
      await runRiskMonitor(env);
    }
    
    if (cron === '*/5 * * * *') {
      await runBillingJob(env);
    }
  }
};