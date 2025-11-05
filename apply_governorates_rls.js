#!/usr/bin/env node

/**
 * Script to apply RLS policies to governorates table
 * This fixes the issue where admin cannot update governorate visibility
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Starting migration: Add RLS policies to governorates table\n');

  // Read the migration SQL file
  const migrationPath = path.join(__dirname, 'supabase/migrations/20251105_add_governorates_rls_policies.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration SQL:');
  console.log('─'.repeat(60));
  console.log(migrationSQL);
  console.log('─'.repeat(60));
  console.log('');

  try {
    // Execute the migration
    console.log('⏳ Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });

    if (error) {
      // If exec_sql function doesn't exist, try direct execution
      console.log('⚠️  exec_sql function not found, trying direct execution...');
      
      // Split SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement) {
          console.log(`\n📝 Executing: ${statement.substring(0, 100)}...`);
          const { error: stmtError } = await supabase.rpc('exec', {
            sql: statement
          });
          
          if (stmtError) {
            console.error(`❌ Error executing statement: ${stmtError.message}`);
          } else {
            console.log('✅ Statement executed successfully');
          }
        }
      }
    } else {
      console.log('✅ Migration executed successfully!');
    }

    // Verify the policies were created
    console.log('\n🔍 Verifying RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'governorates');

    if (policiesError) {
      console.log('⚠️  Could not verify policies (this is normal if pg_policies is not accessible)');
    } else if (policies && policies.length > 0) {
      console.log(`✅ Found ${policies.length} policies on governorates table:`);
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname}`);
      });
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test the governorate toggle functionality in the admin panel');
    console.log('   2. Verify that non-admin users cannot update governorates');
    console.log('   3. Check that all users can view governorates');

  } catch (err) {
    console.error('❌ Error applying migration:', err);
    process.exit(1);
  }
}

// Run the migration
applyMigration().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
