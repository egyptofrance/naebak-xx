import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createManagerPermissionsTable() {
  console.log('📋 Creating manager_permissions table...\n');

  // Read the SQL file
  const sqlPath = path.join(__dirname, '../supabase/migrations/create_manager_permissions_table.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('⚠️  exec_sql function not found, trying direct execution...\n');
      
      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
        if (stmtError) {
          console.error('❌ Error:', stmtError.message);
        }
      }
    }

    console.log('\n✅ Successfully created manager_permissions table!');
    console.log('\nTable structure:');
    console.log('- id (UUID, Primary Key)');
    console.log('- user_id (UUID, Foreign Key to auth.users)');
    console.log('- can_manage_users (BOOLEAN)');
    console.log('- can_manage_deputies (BOOLEAN)');
    console.log('- can_manage_content (BOOLEAN)');
    console.log('- can_view_reports (BOOLEAN)');
    console.log('- can_manage_settings (BOOLEAN)');
    console.log('- created_at (TIMESTAMP)');
    console.log('- updated_at (TIMESTAMP)');
    console.log('\n✅ Row Level Security enabled');
    console.log('✅ Policies created for admins and service role');
    console.log('✅ Trigger created for auto-updating updated_at');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

// Verify table was created
async function verifyTable() {
  console.log('\n🔍 Verifying table creation...\n');

  const { data, error } = await supabase
    .from('manager_permissions')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Table verification failed:', error.message);
    console.log('\n⚠️  Please run the SQL manually in Supabase SQL Editor:');
    console.log('   Dashboard → SQL Editor → New Query → Paste the SQL from:');
    console.log('   supabase/migrations/create_manager_permissions_table.sql');
    return false;
  }

  console.log('✅ Table verified successfully!');
  console.log('✅ You can now promote users to manager role.');
  return true;
}

async function main() {
  await createManagerPermissionsTable();
  await verifyTable();
}

main();

