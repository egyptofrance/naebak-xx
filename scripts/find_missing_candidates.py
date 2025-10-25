#!/usr/bin/env python3
"""
Find candidates that are in Excel but not in database
"""

import os
from supabase import create_client, Client
import pandas as pd

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("\n" + "="*80)
print("🔍 البحث عن المرشحين الناقصين")
print("="*80 + "\n")

# Read Excel file
print("📖 قراءة ملف Excel...")
excel_file = '/home/ubuntu/naebak-xx/data/جميعالمرشحين.xlsx'
df = pd.read_excel(excel_file)
excel_names = set(df['اسم المرشح'].tolist())
print(f"   • عدد المرشحين في Excel: {len(excel_names)}\n")

# Get all names from database
print("📖 قراءة الأسماء من قاعدة البيانات...")
all_deputies = []
batch_size = 1000
offset = 0

count_result = supabase.table('deputy_profiles')\
    .select('id', count='exact')\
    .eq('candidate_type', 'individual')\
    .execute()
total_count = count_result.count

while offset < total_count:
    result = supabase.table('deputy_profiles')\
        .select('user_profiles!inner(full_name)')\
        .eq('candidate_type', 'individual')\
        .range(offset, offset + batch_size - 1)\
        .execute()
    
    all_deputies.extend(result.data)
    offset += batch_size

db_names = set([d['user_profiles']['full_name'] for d in all_deputies if d.get('user_profiles')])
print(f"   • عدد المرشحين في قاعدة البيانات: {len(db_names)}\n")

# Find missing
missing_names = excel_names - db_names
print(f"🔍 المرشحين الناقصين: {len(missing_names)}\n")

if missing_names:
    print("📋 قائمة المرشحين الناقصين (أول 50):")
    print("-" * 80)
    for i, name in enumerate(sorted(missing_names)[:50], 1):
        # Find row in Excel
        row = df[df['اسم المرشح'] == name].iloc[0]
        print(f"{i:3}. {name}")
        print(f"     • المحافظة: {row['المحافظة']}")
        print(f"     • الدائرة: {row['دائرة فردي']}")
    
    if len(missing_names) > 50:
        print(f"\n... و {len(missing_names) - 50} مرشح آخر")
    
    # Save to file
    missing_df = df[df['اسم المرشح'].isin(missing_names)]
    output_file = '/home/ubuntu/naebak-xx/data/missing_candidates.xlsx'
    missing_df.to_excel(output_file, index=False)
    print(f"\n💾 تم حفظ المرشحين الناقصين في: {output_file}")
else:
    print("✅ لا يوجد مرشحين ناقصين!")

print("\n" + "="*80 + "\n")

