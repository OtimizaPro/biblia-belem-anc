
import { strict as assert } from 'assert';

// Mock minimal request/env for local testing if running as raw typescript
// But better to use fetch if we can assume the worker is running.
// Since I can't guarantee the worker is running, I'll assume this script is for the user to run or for me to run in a compatible environment.

// However, seeing `test-workers-direct.mjs` in the file list suggests there is a testing pattern.
// Let's create a simple standalone script that uses `fetch` assuming the dev server is up, 
// OR simpler: just unit test the logic if I could import the handler, but binding D1 is hard in node.

// So I will create a script that attempts to hit the local dev server.
async function testSearch() {
  const baseUrl = 'http://localhost:8787'; // Default wrangler dev port
  console.log(`Testing search API at ${baseUrl}...`);

  try {
    // 0. Test DB Health via existing endpoint
    console.log('0. Testing DB health (GET /api/v1/verses/JOAO/1)...');
    // Using JOAO 1 since I don't know if 3:16 is populated in local mock DB
    const healthRes = await fetch(`${baseUrl}/api/v1/verses/JOAO/1`); 
    if (!healthRes.ok) {
        console.warn('⚠️  Health check failed: Local DB might be empty or missing tables.');
        const text = await healthRes.text();
        console.warn('Response:', text);
    } else {
        console.log('✅ DB Health check passed');
    }

    // 1. Basic search
    console.log('1. Testing basic search "amor"...');
    let res = await fetch(`${baseUrl}/api/v1/search?q=amor&limit=5`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    let data = await res.json();
    
    assert.equal(data.query, 'amor');
    assert(Array.isArray(data.results));
    assert(data.results.length <= 5);
    assert(data.total > 0, 'Should find results for "amor"');
    assert(data.results[0].highlight.includes('<mark>'), 'Should have highlighting');
    console.log('✅ Basic search passed');

    // 2. Book filter
    console.log('2. Testing book filter "JOAO"...');
    res = await fetch(`${baseUrl}/api/v1/search?q=amor&book=JOAO`);
    data = await res.json();
    assert(data.results.every(r => r.book === 'joao'), 'All results should be from Joao');
    console.log('✅ Book filter passed');

    // 3. Limit
    console.log('3. Testing limit...');
    res = await fetch(`${baseUrl}/api/v1/search?q=deus&limit=2`);
    data = await res.json();
    assert.equal(data.results.length, 2);
    assert(data.total > 2, 'Total should be greater than limit');
    console.log('✅ Limit passed');

    console.log('\nAll tests passed!');
  } catch (err) {
    console.error('Test failed:', err);
    console.log('Note: Ensure the worker is running locally with `npm run dev` or `wrangler dev`');
  }
}

testSearch();
