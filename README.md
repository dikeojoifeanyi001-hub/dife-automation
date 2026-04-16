# DIFE Automation System

A production-ready automation engine that monitors logistics routes for high-risk conditions and simulates company billing. Built using Cloudflare Workers with cron-based background job execution.

---

## 🚀 Live Demo

* **Worker URL:** https://dife-automation.dikeojo-ifeanyi001.workers.dev
* **Run Jobs (Proof Endpoint):**
  https://dife-automation.dikeojo-ifeanyi001.workers.dev/run-jobs

---

## 📋 Features

### 🤖 Automated Jobs (Cron-Based)

| Job          | Schedule        | Description                           |
| ------------ | --------------- | ------------------------------------- |
| Risk Monitor | Every 2 minutes | Detects routes with `risk_score > 70` |
| Billing Job  | Every 5 minutes | Calculates $5 per route               |

---

### 🔌 Debug Endpoints

| Endpoint       | Method | Description                                    |
| -------------- | ------ | ---------------------------------------------- |
| `/health`      | GET    | System status + timestamp                      |
| `/run-jobs`    | GET    | Runs all automation jobs (main proof endpoint) |
| `/run/risk`    | GET    | Runs risk monitoring only                      |
| `/run/billing` | GET    | Runs billing logic only                        |

---

## 📊 Sample Response (`/run-jobs`)

```json
{
  "routesChecked": 5,
  "highRiskRoutes": 1,
  "billingAmount": 25,
  "logs": [
    "Fetched 5 routes",
    "High risk detected: Route 5 (Score: 100)",
    "Billing calculated: $25"
  ],
  "success": true
}
```

---

## 🛠️ Tech Stack

* Cloudflare Workers
* Cron Triggers
* JavaScript (ES6)
* Fetch API
* GitHub Actions (CI/CD)

---

## 📁 Project Structure

```
dife-automation/
├── src/
│   ├── jobs/
│   │   ├── riskMonitor.js
│   │   └── billingJob.js
│   ├── runAllJobs.js
│   ├── worker.js
│   └── index.js
├── wrangler.toml
├── package.json
└── README.md
```

---

## 🔗 API Integration

This system connects to the live backend:

**Base URL:**
https://dife-saas-api-production.up.railway.app/api

**Endpoint Used:**

* `GET /routes` → Fetch routes for monitoring and billing

---

## 📊 Business Logic

### Risk Monitoring

* High Risk: `> 70` → Alert
* Medium Risk: `41–70` → Monitor
* Low Risk: `0–40` → Normal

---

### Billing Simulation

```
total_billing = total_routes × $5
```

---

## 📈 Logging & Monitoring

Logs are available in Cloudflare Workers dashboard.

Example:

```
Fetching routes...
High risk detected: Route 5
Billing calculated: $25
```

---

## 🧪 Testing

### Browser

* `/health`
* `/run-jobs`

---

### cURL

```bash
curl https://dife-automation.dikeojo-ifeanyi001.workers.dev/run-jobs
```

---

## 🔐 Environment Variables

| Variable   | Description              |
| ---------- | ------------------------ |
| AUTH_TOKEN | API authentication token |
| API_URL    | Backend API base URL     |

---

## ⏱️ Cron Schedule

| Expression    | Meaning         |
| ------------- | --------------- |
| `*/2 * * * *` | Every 2 minutes |
| `*/5 * * * *` | Every 5 minutes |

---

## 🔗 Related Projects

* **DIFE SaaS API**
  https://dife-saas-api-production.up.railway.app
  https://github.com/dikeojoifeanyi001-hub/dife-saas-api

* **DIFE React Dashboard**
  https://dife-dashboard.pages.dev
  https://github.com/dikeojoifeanyi001-hub/dife-dashboard

---

## 👨‍💻 Author

**D.O.I Henry**
GitHub: https://github.com/dikeojoifeanyi001-hub

---

## 📄 License

MIT License

---

## 🎯 What This Project Demonstrates

* Background job automation
* System design and architecture
* API integration with live data
* Scheduled task execution (cron)
* Logging and monitoring
* Cloud deployment (serverless)

---
