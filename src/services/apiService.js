const axios = require('axios');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiY29tcGFueUlkIjoxLCJyb2xlIjoiY29tcGFueV91c2VyIiwiaWF0IjoxNzc2Mjc3NjM2LCJleHAiOjE3NzY4ODI0MzZ9.0YLCF_U77rVuLu2j0cPuvDSfabVkTNn_MwBBZ28Ctgk';

const API = axios.create({
  baseURL: 'https://dife-saas-api-production.up.railway.app/api',
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${TOKEN}`
  }
});

module.exports = API;