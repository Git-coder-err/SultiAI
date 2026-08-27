require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function createExecFunction() {
  console.log('Creating exec_sql function in Supabase...\n');
  
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
  
  // The exec_sql function needs to be created manually in Supabase dashboard
  // This script provides the SQL to run
  
  console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
  console.log('   Go to: https://supabase.com/dashboard/project/_/sql\n');
  
  const createFunctionSQL = `
-- Create a function to execute raw SQL (for migrations)
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service role
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
`;
  
  console.log(createFunctionSQL);
  console.log('\nAfter running this, run: npm run db:setup-supabase');
  
  // Test if function exists
  const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
  
  if (error && error.message.includes('function')) {
    console.log('\n⚠️  exec_sql function does not exist yet.');
    console.log('   Please create it using the SQL above.');
  } else {
    console.log('\n✅ exec_sql function exists!');
  }
}

createExecFunction();
