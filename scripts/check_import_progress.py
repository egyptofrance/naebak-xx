#!/usr/bin/env python3
"""
Check import progress in database
"""

import os
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Count deputy profiles
result = supabase.table('deputy_profiles').select('id', count='exact').execute()
total_deputies = result.count

# Count by candidate_type
individual_result = supabase.table('deputy_profiles')\
    .select('id', count='exact')\
    .eq('candidate_type', 'individual')\
    .execute()
individual_count = individual_result.count

print("\n" + "="*60)
print("📊 حالة الاستيراد الحالية")
print("="*60)
print(f"\n✅ إجمالي المرشحين في قاعدة البيانات: {total_deputies}")
print(f"   • مرشحين أفراد: {individual_count}")
print(f"   • الهدف: 2,620 مرشح فردي")
print(f"   • المتبقي: {2620 - individual_count}")
print(f"   • نسبة الإنجاز: {(individual_count / 2620 * 100):.1f}%")
print("\n" + "="*60 + "\n")

