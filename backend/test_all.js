require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const results = [];
let authToken = null;

function summarize(data, maxLen = 200) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

async function runTest(name, fn) {
  try {
    const { status, data, pass, detail } = await fn();
    const passed = pass !== undefined ? pass : (status >= 200 && status < 300);
    const icon = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${icon} | ${name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Response: ${summarize(data)}`);
    if (detail) console.log(`   Detail: ${detail}`);
    results.push({ name, passed });
  } catch (err) {
    console.log(`\n❌ FAIL | ${name}`);
    if (err.response) {
      console.log(`   Status: ${err.response.status}`);
      console.log(`   Response: ${summarize(err.response.data)}`);
    } else {
      console.log(`   Error: ${err.message}`);
    }
    results.push({ name, passed: false });
  }
}

function authHeaders() {
  return { headers: { Authorization: `Bearer ${authToken}` } };
}

(async () => {
  console.log('=== KJ Dance Studio API Tests ===');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // 1. GET /health
  await runTest('GET /health', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    const pass = res.data && res.data.status === 'healthy';
    return { status: res.status, data: res.data, pass };
  });

  // 2. POST /api/admin/login
  await runTest('POST /api/admin/login', async () => {
    const res = await axios.post(`${BASE_URL}/api/admin/login`, {
      password: 'Ragu8610',
    });
    const pass = res.data && res.data.success === true && !!res.data.token;
    if (pass) authToken = res.data.token;
    return {
      status: res.status,
      data: { success: res.data.success, tokenPresent: !!res.data.token },
      pass,
      detail: pass ? 'Token saved for subsequent requests' : 'Login failed',
    };
  });

  // 3. GET /api/students/dashboard/stats
  await runTest('GET /api/students/dashboard/stats', async () => {
    const res = await axios.get(`${BASE_URL}/api/students/dashboard/stats`, authHeaders());
    return { status: res.status, data: res.data, pass: res.status === 200 };
  });

  // 4. GET /api/students?page=1&limit=10
  await runTest('GET /api/students?page=1&limit=10', async () => {
    const res = await axios.get(`${BASE_URL}/api/students?page=1&limit=10`, authHeaders());
    return { status: res.status, data: res.data, pass: res.status === 200 };
  });

  // 5. GET /api/students/unpaid
  await runTest('GET /api/students/unpaid', async () => {
    const res = await axios.get(`${BASE_URL}/api/students/unpaid`, authHeaders());
    return { status: res.status, data: res.data, pass: res.status === 200 };
  });

  // 6. GET /api/payments?page=1&limit=10
  await runTest('GET /api/payments?page=1&limit=10', async () => {
    const res = await axios.get(`${BASE_URL}/api/payments?page=1&limit=10`, authHeaders());
    return { status: res.status, data: res.data, pass: res.status === 200 };
  });

  // 7. GET /api/registrations
  await runTest('GET /api/registrations', async () => {
    const res = await axios.get(`${BASE_URL}/api/registrations`, authHeaders());
    return { status: res.status, data: res.data, pass: res.status === 200 };
  });

  // 8. POST /api/register (public)
  await runTest('POST /api/register (public)', async () => {
    // Generate a unique phone number so we don't hit duplicate registration key issues
    const uniquePhone = '98765' + Math.floor(10000 + Math.random() * 90000);
    const res = await axios.post(`${BASE_URL}/api/register`, {
      studentName: 'Test Student ' + Date.now(),
      phone: uniquePhone,
      classType: 'Dance Class',
      notes: 'Test registration message',
    });
    return { status: res.status, data: res.data, pass: res.status >= 200 && res.status < 300 };
  });

  // 9. WhatsApp service status via /health
  await runTest('GET /health - WhatsApp status', async () => {
    const res = await axios.get(`${BASE_URL}/health`);
    const wpField = res.data && (res.data.whatsapp !== undefined ? res.data.whatsapp : res.data.whatsappStatus);
    const detail = wpField !== undefined
      ? `WhatsApp field value: ${JSON.stringify(wpField)}`
      : 'No whatsapp field found in health response';
    return {
      status: res.status,
      data: res.data,
      pass: wpField !== undefined,
      detail,
    };
  });

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log('\n\n--- RESULTS ---');
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Failed: ${failed}/${total}`);
  if (failed > 0) {
    console.log('\nFailures:');
    results.filter((r) => !r.passed).forEach((r) => console.log(`  ❌ ${r.name}`));
  } else {
    console.log('\n🎉 All tests passed!');
  }
})();
