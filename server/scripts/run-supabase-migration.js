require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Running Supabase schema migration...\n');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  try {
    // Read the SQL schema file
    console.log('1️⃣ Reading schema file...');
    const schemaPath = path.join(__dirname, 'supabase-admin-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and filter out empty statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('\\n--'));
    
    console.log(`   Found ${statements.length} SQL statements\n`);
    
    // Execute each statement using Supabase RPC
    console.log('2️⃣ Executing statements...');
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add back the semicolon
      
      // Skip comments and empty statements
      if (statement.trim().length < 5 || statement.startsWith('--')) {
        continue;
      }
      
      try {
        // Use Supabase's rpc to execute raw SQL
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Some statements may fail if they already exist
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('multiple/too few')) {
            errorCount++;
            console.log(`   ⚠️  Statement ${i + 1}: ${error.message.substring(0, 80)}`);
          } else {
            console.log(`   ❌ Statement ${i + 1} failed: ${error.message.substring(0, 80)}`);
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (e) {
        errorCount++;
        console.log(`   ⚠️  Statement ${i + 1}: ${e.message.substring(0, 80)}`);
      }
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        process.stdout.write(`   Processing ${i + 1}/${statements.length}...\r`);
      }
    }
    
    console.log(`\n   ✅ Completed: ${successCount} success, ${errorCount} errors/skipped\n`);
    
    // Verify tables exist
    console.log('3️⃣ Verifying tables...');
    const tables = ['users', 'learner_profiles', 'community_posts', 'feedback', 'audit_logs'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count} rows`);
      }
    }
    
    console.log('\n🎉 Migration complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Open admin panel: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
