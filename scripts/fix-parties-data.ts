/**
 * Script to analyze and fix parties data issues:
 * 1. Identify duplicate parties
 * 2. Remove duplicates (keep the oldest entry)
 * 3. Reorder all parties sequentially (0, 1, 2, 3, ...)
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface Party {
  id: string;
  name_ar: string;
  name_en: string;
  abbreviation: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

async function analyzeParties() {
  console.log('🔍 Analyzing parties data...\n');

  const { data: parties, error } = await supabase
    .from('parties')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('❌ Error fetching parties:', error);
    return null;
  }

  console.log(`📊 Total parties in database: ${parties.length}\n`);

  // Find duplicates by name_ar
  const nameMap = new Map<string, Party[]>();
  parties.forEach((party) => {
    const existing = nameMap.get(party.name_ar) || [];
    existing.push(party);
    nameMap.set(party.name_ar, existing);
  });

  const duplicates = Array.from(nameMap.entries()).filter(
    ([_, parties]) => parties.length > 1
  );

  if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} duplicate party names:\n`);
    duplicates.forEach(([name, parties]) => {
      console.log(`   "${name}" appears ${parties.length} times:`);
      parties.forEach((p) => {
        console.log(
          `      - ID: ${p.id}, Order: ${p.display_order}, Created: ${p.created_at}`
        );
      });
      console.log('');
    });
  } else {
    console.log('✅ No duplicate party names found\n');
  }

  // Check display_order issues
  const orderIssues = parties.filter((p) => p.display_order === 999);
  if (orderIssues.length > 0) {
    console.log(`⚠️  Found ${orderIssues.length} parties with display_order = 999\n`);
  }

  // Check for gaps in ordering
  const orders = parties.map((p) => p.display_order).sort((a, b) => a - b);
  const expectedOrders = Array.from({ length: parties.length }, (_, i) => i);
  const hasGaps = JSON.stringify(orders) !== JSON.stringify(expectedOrders);

  if (hasGaps) {
    console.log('⚠️  Display order has gaps or duplicates\n');
    console.log(`   Current orders: ${orders.slice(0, 20).join(', ')}${orders.length > 20 ? '...' : ''}\n`);
  } else {
    console.log('✅ Display order is sequential (0, 1, 2, ...)\n');
  }

  return { parties, duplicates, orderIssues };
}

async function removeDuplicates(duplicates: [string, Party[]][]) {
  console.log('🧹 Removing duplicate parties...\n');

  let removedCount = 0;

  for (const [name, parties] of duplicates) {
    // Sort by created_at to keep the oldest
    const sorted = parties.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const toKeep = sorted[0];
    const toRemove = sorted.slice(1);

    console.log(`   Keeping oldest "${name}" (ID: ${toKeep.id})`);

    for (const party of toRemove) {
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', party.id);

      if (error) {
        console.error(`   ❌ Error deleting party ${party.id}:`, error);
      } else {
        console.log(`   ✅ Deleted duplicate (ID: ${party.id})`);
        removedCount++;
      }
    }
    console.log('');
  }

  console.log(`✅ Removed ${removedCount} duplicate parties\n`);
  return removedCount;
}

async function reorderAllParties() {
  console.log('🔄 Reordering all parties sequentially...\n');

  // Get all parties ordered by name_ar (Arabic alphabetical)
  const { data: parties, error: fetchError } = await supabase
    .from('parties')
    .select('id, name_ar')
    .order('name_ar', { ascending: true });

  if (fetchError || !parties) {
    console.error('❌ Error fetching parties:', fetchError);
    return;
  }

  console.log(`   Reordering ${parties.length} parties by Arabic name...\n`);

  // Update each party with new display_order
  for (let i = 0; i < parties.length; i++) {
    const party = parties[i];
    const { error } = await supabase
      .from('parties')
      .update({ display_order: i })
      .eq('id', party.id);

    if (error) {
      console.error(`   ❌ Error updating party ${party.id}:`, error);
    } else {
      console.log(`   ✅ ${i}: ${party.name_ar} (ID: ${party.id})`);
    }
  }

  console.log(`\n✅ Successfully reordered ${parties.length} parties\n`);
}

async function main() {
  console.log('🚀 Starting parties data fix script\n');
  console.log('═'.repeat(60) + '\n');

  // Step 1: Analyze
  const analysis = await analyzeParties();
  if (!analysis) {
    console.error('Failed to analyze parties');
    process.exit(1);
  }

  console.log('═'.repeat(60) + '\n');

  // Step 2: Remove duplicates if found
  if (analysis.duplicates.length > 0) {
    await removeDuplicates(analysis.duplicates);
    console.log('═'.repeat(60) + '\n');
  }

  // Step 3: Reorder all parties
  await reorderAllParties();

  console.log('═'.repeat(60) + '\n');

  // Step 4: Verify
  console.log('🔍 Verifying fixes...\n');
  await analyzeParties();

  console.log('═'.repeat(60) + '\n');
  console.log('✅ Script completed successfully!\n');
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

