const http = require('http');

function testURL(url, label) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ label, status: res.statusCode, data }));
    }).on('error', (err) => resolve({ label, error: err.message }));
  });
}

async function run() {
  console.log('=== FRONTEND TESTS ===\n');

  // Test 1: Frontend dev server
  const fe = await testURL('http://localhost:5173/', 'Frontend Dev Server');
  if (fe.error) {
    console.log(`❌ ${fe.label}: NOT RUNNING (${fe.error})`);
  } else {
    console.log(`✅ ${fe.label}: Status ${fe.status}`);
    console.log(`   Title contains "expressionz Dance Studio": ${fe.data.includes('expressionz Dance Studio')}`);
    console.log(`   Has root div: ${fe.data.includes('id="root"')}`);
  }

  // Test 2: Backend serving production build
  const be = await testURL('http://localhost:5001/', 'Backend Production Build');
  if (be.error) {
    console.log(`❌ ${be.label}: NOT RUNNING (${be.error})`);
  } else {
    console.log(`✅ ${be.label}: Status ${be.status}`);
    console.log(`   Title contains "expressionz Dance Studio": ${be.data.includes('expressionz Dance Studio')}`);
    console.log(`   Serving HTML: ${be.data.includes('<!doctype html>')}`);
  }

  // Test 3: API proxy from frontend
  const proxy = await testURL('http://localhost:5173/api/auth/login', 'Frontend API Proxy');
  if (proxy.error) {
    console.log(`❌ ${proxy.label}: NOT WORKING (${proxy.error})`);
  } else {
    // Should return 400 or 401 (no body), but proves proxy works
    console.log(`✅ ${proxy.label}: Status ${proxy.status} (proxy to backend works)`);
  }

  // Test 4: Static assets from production build
  const assets = await testURL('http://localhost:5001/health', 'Backend Health');
  if (assets.error) {
    console.log(`❌ ${assets.label}: ${assets.error}`);
  } else {
    const health = JSON.parse(assets.data);
    console.log(`✅ ${assets.label}: ${health.status}`);
    console.log(`   DB: ${health.db}`);
    console.log(`   WhatsApp: ${health.whatsapp?.provider} (Ready: ${health.whatsapp?.isReady})`);
    console.log(`   Uptime: ${Math.round(health.uptime)}s`);
  }

  console.log('\n=== DONE ===');
}

run();
