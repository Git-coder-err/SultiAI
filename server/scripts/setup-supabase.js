require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupSupabase() {
  console.log('🚀 Setting up Supabase PostgreSQL database...\n');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  
  try {
    // Test connection first
    console.log('1️⃣ Testing connection...');
    await pool.query('SELECT NOW()');
    console.log('   ✅ Connected to Supabase\n');
    
    // Read and execute schema
    console.log('2️⃣ Running schema migration...');
    const schemaPath = path.join(__dirname, 'supabase-admin-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
        successCount++;
      } catch (error) {
        // Some statements may fail if tables already exist
        if (error.message.includes('already exists')) {
          skipCount++;
        } else {
          console.error('   ⚠️ Statement failed:', error.message);
          console.error('   Statement:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log(`   ✅ Executed ${successCount} statements, ${skipCount} skipped (already exist)\n`);
    
    // Verify tables
    console.log('3️⃣ Verifying tables...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`   📊 Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log('      -', row.table_name);
    });
    
    // Create default admin user
    console.log('\n4️⃣ Creating default admin user...');
    const crypto = require('crypto');
    
    // Simple password hash function (matches server's hashPassword)
    function hashPassword(password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.scryptSync(password, salt, 64).toString('hex');
      return `${salt}:${hash}`;
    }
    
    const adminPassword = hashPassword('admin123');
    
    await pool.query(`
      INSERT INTO public.users (fullname, email, password_hash, role)
      VALUES ('Admin', 'admin@sultiai.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [adminPassword]);
    
    console.log('   ✅ Default admin user created (admin@sultiai.com / admin123)');
    
    console.log('\n🎉 Supabase setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Open admin panel: http://localhost:3000/admin');
    console.log('   3. Login with: admin@sultiai.com / admin123');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupSupabase();
