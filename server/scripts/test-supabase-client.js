require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseClient() {
  console.log('Testing Supabase JavaScript client...\n');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found');
    process.exit(1);
  }
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'publishable');
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  try {
    // Test basic connection
    console.log('\n1️⃣ Testing basic connection...');
    const { data: healthData, error: healthError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.log('   ⚠️  Users table query failed:', healthError.message);
    } else {
      console.log('   ✅ Connected! Users table accessible');
    }
    
    // List all tables
    console.log('\n2️⃣ Listing tables...');
    const tables = ['users', 'learner_profiles', 'community_posts', 'feedback', 'audit_logs'];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`   ⚠️  ${table}: ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: ${count} rows`);
        }
      } catch (e) {
        console.log(`   ⚠️  ${table}: ${e.message}`);
      }
    }
    
    // Test insert/delete
    console.log('\n3️⃣ Testing insert/delete...');
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        fullname: 'Test User',
        email: 'test-delete-me@example.com',
        password_hash: 'hashed_password',
        role: 'user',
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('   ⚠️  Insert failed:', insertError.message);
    } else {
      console.log('   ✅ Insert successful, user_id:', insertData.user_id);
      
      // Delete test user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('email', 'test-delete-me@example.com');
      
      if (deleteError) {
        console.log('   ⚠️  Delete failed:', deleteError.message);
      } else {
        console.log('   ✅ Delete successful');
      }
    }
    
    console.log('\n🎉 Supabase client test complete!');
    console.log('\n📋 You can now use the Supabase client for all database operations.');
    console.log('   The server will use the Supabase JavaScript client instead of direct PostgreSQL.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testSupabaseClient();
