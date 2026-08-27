#!/usr/bin/env node
/**
 * Setup Supabase database schema.
 * 
 * Option A (automated): Set SUPABASE_ACCESS_TOKEN env var (from https://supabase.com/dashboard/account/tokens)
 *   → node scripts/supabase-setup.js
 * 
 * Option B (manual): Open the SQL Editor in Supabase Dashboard and paste the SQL from:
 *   server/scripts/supabase-init.sql
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pptanwtuybivlqeyntwh.supabase.co';
const PROJECT_REF = 'pptanwtuybivlqeyntwh';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const SQL_FILE = path.join(__dirname, '..', 'server', 'scripts', 'supabase-init.sql');

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runSql(sql) {
  if (!ACCESS_TOKEN) {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║  No SUPABASE_ACCESS_TOKEN found.                        ║');
    console.log('║                                                         ║');
    console.log('║  To set up automatically:                               ║');
    console.log('║  1. Go to https://supabase.com/dashboard/account/tokens ║');
    console.log('║  2. Create a new access token                           ║');
    console.log('║  3. Run: SUPABASE_ACCESS_TOKEN=your_token node scripts/supabase-setup.js');
    console.log('║                                                         ║');
    console.log('║  To set up manually:                                    ║');
    console.log('║  1. Open https://supabase.com/dashboard/project/pptanwtuybivlqeyntwh/sql');
    console.log('║  2. Paste the contents of server/scripts/supabase-init.sql');
    console.log('║  3. Click "Run"                                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
    process.exit(0);
  }

  console.log('Connecting to Supabase Management API...');

  const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${PROJECT_REF}/database/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  const result = await httpsRequest(options, JSON.stringify({ query: sql }));

  if (result.error) {
    console.error('SQL Error:', result.error);
    process.exit(1);
  }

  console.log('✅ SQL executed successfully!');
  if (result) {
    console.log('Result:', JSON.stringify(result, null, 2).slice(0, 500));
  }
}

async function main() {
  const sql = fs.readFileSync(SQL_FILE, 'utf-8');
  console.log(`Loaded SQL from ${SQL_FILE} (${sql.length} chars)`);
  await runSql(sql);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
