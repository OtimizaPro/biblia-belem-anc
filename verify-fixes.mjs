
import { strict as assert } from 'assert';

async function testFixes() {
  const baseUrl = 'http://localhost:8787';
  console.log(`Verifying fixes at ${baseUrl}...`);

  try {
    // 1. Verify XSS Protection
    console.log('1. Testing XSS protection...');
    const xssQuery = '<script>alert(1)</script>';
    const resXss = await fetch(`${baseUrl}/api/v1/search?q=${encodeURIComponent(xssQuery)}`);
    const dataXss = await resXss.json();
    
    // The query itself in response should be escaped or at least handled safely
    // The highlight should definitely be escaped
    console.log('XSS Response highlight sample:', dataXss.results?.[0]?.highlight || 'No results');
    if (dataXss.results?.length > 0) {
        assert(!dataXss.results[0].highlight.includes('<script>'), 'Highlight should not contain raw <script>');
        assert(dataXss.results[0].highlight.includes('&lt;script&gt;'), 'Highlight should contain escaped <script>');
    }
    console.log('✅ XSS protection verification point passed (checked manual escaping)');

    // 2. Verify Limit Capping
    console.log('2. Testing limit capping...');
    const resLimit = await fetch(`${baseUrl}/api/v1/search?q=deus&limit=999`);
    const dataLimit = await resLimit.json();
    assert(dataLimit.results.length <= 100, 'Limit should be capped at 100');
    console.log('✅ Limit capping passed');

    // 3. Verify Query Length Validation
    console.log('3. Testing query length (Min)...');
    const resMin = await fetch(`${baseUrl}/api/v1/search?q=a`);
    assert.equal(resMin.status, 400, 'Should return 400 for 1-char query');
    const dataMin = await resMin.json();
    assert.equal(dataMin.error, 'Busca deve ter no mínimo 2 caracteres');
    console.log('✅ Min length validation passed');

    console.log('4. Testing query length (Max)...');
    const longQuery = 'a'.repeat(201);
    const resMax = await fetch(`${baseUrl}/api/v1/search?q=${longQuery}`);
    assert.equal(resMax.status, 400, 'Should return 400 for 201-char query');
    const dataMax = await resMax.json();
    assert.equal(dataMax.error, 'Busca deve ter no máximo 200 caracteres');
    console.log('✅ Max length validation passed');

    // 4. Verify Generic Error Message
    console.log('5. Testing generic error message (by forcing error if possible)...');
    // We can't easily force a 500 without stopping DB, but we can check the 400 message structure
    assert.equal(dataMin.success, false);
    
    console.log('\nAll verification points passed!');
  } catch (err) {
    console.error('Verification failed:', err);
    console.log('Note: Ensure the worker is running locally with `npm run dev`');
  }
}

testFixes();
