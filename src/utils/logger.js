const logger = {
  info: (message) => {
    console.log(`[${new Date().toISOString()}] [INFO] ${message}`);
  },
  alert: (message) => {
    console.log(`[${new Date().toISOString()}] [ALERT] ⚠️ ${message}`);
  },
  billing: (message) => {
    console.log(`[${new Date().toISOString()}] [BILLING] 💰 ${message}`);
  },
  error: (message) => {
    console.log(`[${new Date().toISOString()}] [ERROR] ❌ ${message}`);
  },
  warn: (message) => {
    console.log(`[${new Date().toISOString()}] [WARN] ⚠️ ${message}`);
  }
};

module.exports = logger;