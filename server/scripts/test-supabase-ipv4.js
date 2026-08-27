require('dotenv').config();
const { Pool } = require('pg');
const dns = require('dns');

// Force IPv4
dns.setDefaultResultOrder('ipv4first');

async function testConnection() {
  console.log('Testing Supabase PostgreSQL connection (IPv4 forced)...\n');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  console.log('Connection string found:', connectionString.substring(0, 50) + '...');
  
  // Parse the connection string to get host and port
  const url = new URL(connectionString);
  console.log('Host:', url.hostname);
  console.log('Port:', url.port);
  console.log('Database:', url.pathname.substring(1));
  
  // Try to resolve IPv4 first
  console.log('\nResolving hostname to IPv4...');
  try {
    const addresses = await dns.promises.resolve4(url.hostname);
    console.log('IPv4 addresses:', addresses);
    
    // Use the first IPv4 address
    const ipv4Host = addresses[0];
    const modifiedConnectionString = connectionString.replace(url.hostname, ipv4Host);
    
    console.log('\nConnecting with IPv4 address:', ipv4Host);
    
    const pool = new Pool({
      connectionString: modifiedConnectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    
    // Test connection
    const result = await pool.query('SELECT NOW() as time');
    console.log('✅ Connected successfully!');
    console.log('   Server time:', result.rows[0].time);
    
    // Test tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables found:', tables.rows.length);
    tables.rows.forEach(row => {
      console.log('   -', row.table_name);
    });
    
    await pool.end();
    console.log('\n✅ Connection test passed!');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    
    // Try alternative: use Supabase REST API
    console.log('\nTrying alternative: Supabase REST API...');
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });
        
        if (response.ok) {
          console.log('✅ Supabase REST API is accessible!');
          console.log('   You can use the REST API for database operations.');
        } else {
          console.log('⚠️  Supabase REST API returned status:', response.status);
        }
      } else {
        console.log('⚠️  Supabase URL or key not configured');
      }
    } catch (restError) {
      console.log('⚠️  REST API test failed:', restError.message);
    }
    
    process.exit(1);
  }
}

testConnection();
