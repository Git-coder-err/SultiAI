require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log('Testing Supabase PostgreSQL connection...\n');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  console.log('Connection string found:', connectionString.substring(0, 50) + '...');
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  
  try {
    // Test basic connection
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
    
    // Test users table structure
    const usersColumns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('\n👤 Users table columns:', usersColumns.rows.length);
    usersColumns.rows.forEach(row => {
      console.log('   -', row.column_name, '(' + row.data_type + ')');
    });
    
    // Test insert and delete
    console.log('\n🔄 Testing insert/delete...');
    await pool.query(`
      INSERT INTO public.users (fullname, email, password_hash, role)
      VALUES ('Test User', 'test-delete-me@example.com', 'hashed', 'user')
      ON CONFLICT (email) DO NOTHING
    `);
    
    const deleteResult = await pool.query(`
      DELETE FROM public.users WHERE email = 'test-delete-me@example.com'
    `);
    
    console.log('✅ Insert/delete test passed');
    
    // Test foreign keys
    const foreignKeys = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
        AND table_schema = 'public'
    `);
    
    console.log('\n🔗 Foreign keys:', foreignKeys.rows[0].count);
    
    console.log('\n✅ All tests passed! Supabase PostgreSQL is ready.');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   → Make sure Supabase is running and accessible');
    } else if (error.message.includes('password authentication failed')) {
      console.error('   → Check your database credentials');
    } else if (error.message.includes('does not exist')) {
      console.error('   → Run the schema migration script first');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
