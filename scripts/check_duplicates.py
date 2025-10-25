#!/usr/bin/env python3
"""
Check for duplicate candidates in database
"""

import os
from supabase import create_client, Client
from collections import Counter

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("\n" + "="*80)
print("🔍 فحص المرشحين المكررين")
print("="*80 + "\n")

# Get all deputy profiles with user names
result = supabase.table('deputy_profiles')\
    .select('id, user_id, slug, candidate_type, user_profiles!inner(full_name)')\
    .eq('candidate_type', 'individual')\
    .execute()

deputies = result.data

print(f"📊 إجمالي المرشحين الأفراد: {len(deputies)}\n")

# Check for duplicate names
names = [d['user_profiles']['full_name'] for d in deputies if d.get('user_profiles')]
name_counts = Counter(names)

duplicates = {name: count for name, count in name_counts.items() if count > 1}

if duplicates:
    print(f"⚠️  وجدت {len(duplicates)} اسم مكرر:\n")
    total_duplicate_records = 0
    for name, count in sorted(duplicates.items(), key=lambda x: x[1], reverse=True)[:20]:
        print(f"   • {name}: {count} مرات")
        total_duplicate_records += (count - 1)  # Extra records
    
    if len(duplicates) > 20:
        print(f"   ... و {len(duplicates) - 20} اسم آخر\n")
    
    print(f"\n📊 إجمالي السجلات المكررة (الزائدة): {total_duplicate_records}")
    print(f"📊 العدد الصحيح بعد إزالة التكرار: {len(deputies) - total_duplicate_records}")
else:
    print("✅ لا توجد أسماء مكررة!")

print("\n" + "="*80 + "\n")

