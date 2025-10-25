#!/usr/bin/env python3
"""
Detailed analysis of import to understand what happened
"""

import os
from supabase import create_client, Client
from collections import Counter
import pandas as pd

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("\n" + "="*80)
print("📊 تحليل شامل لعملية الاستيراد")
print("="*80 + "\n")

# 1. Check Excel file
print("1️⃣ فحص ملف Excel:")
print("-" * 80)
excel_file = '/home/ubuntu/naebak-xx/data/جميعالمرشحين.xlsx'
df = pd.read_excel(excel_file)
print(f"   • عدد الصفوف في Excel: {len(df)}")
print(f"   • عدد الأسماء الفريدة في Excel: {df['اسم المرشح'].nunique()}")

excel_names = df['اسم المرشح'].tolist()
excel_name_counts = Counter(excel_names)
excel_duplicates = {name: count for name, count in excel_name_counts.items() if count > 1}
print(f"   • عدد الأسماء المكررة في Excel: {len(excel_duplicates)}")
if excel_duplicates:
    print(f"   • أمثلة على المكررات في Excel:")
    for name, count in list(excel_duplicates.items())[:5]:
        print(f"     - {name}: {count} مرات")

print()

# 2. Check database - get ALL records (not just 1000)
print("2️⃣ فحص قاعدة البيانات:")
print("-" * 80)

# Get count first
count_result = supabase.table('deputy_profiles')\
    .select('id', count='exact')\
    .eq('candidate_type', 'individual')\
    .execute()
total_count = count_result.count
print(f"   • إجمالي المرشحين الأفراد في قاعدة البيانات: {total_count}")

# Get all records in batches
all_deputies = []
batch_size = 1000
offset = 0

while offset < total_count:
    result = supabase.table('deputy_profiles')\
        .select('id, user_id, slug, created_at, user_profiles!inner(full_name)')\
        .eq('candidate_type', 'individual')\
        .order('created_at')\
        .range(offset, offset + batch_size - 1)\
        .execute()
    
    all_deputies.extend(result.data)
    offset += batch_size
    print(f"   • تم جلب {len(all_deputies)} سجل...")

print(f"   • تم جلب {len(all_deputies)} سجل إجمالي")

# Analyze names
db_names = [d['user_profiles']['full_name'] for d in all_deputies if d.get('user_profiles')]
db_name_counts = Counter(db_names)
db_duplicates = {name: count for name, count in db_name_counts.items() if count > 1}

print(f"   • عدد الأسماء الفريدة في قاعدة البيانات: {len(db_name_counts)}")
print(f"   • عدد الأسماء المكررة في قاعدة البيانات: {len(db_duplicates)}")

print()

# 3. Compare
print("3️⃣ المقارنة:")
print("-" * 80)
print(f"   • عدد الصفوف في Excel: {len(df)}")
print(f"   • عدد السجلات في قاعدة البيانات: {len(all_deputies)}")
print(f"   • الفرق: {len(all_deputies) - len(df)} سجل زيادة")
print()
print(f"   • أسماء فريدة في Excel: {df['اسم المرشح'].nunique()}")
print(f"   • أسماء فريدة في قاعدة البيانات: {len(db_name_counts)}")
print()

# 4. Find duplicates details
print("4️⃣ تفاصيل المكررات (أول 20):")
print("-" * 80)
if db_duplicates:
    total_extra = 0
    for i, (name, count) in enumerate(sorted(db_duplicates.items(), key=lambda x: x[1], reverse=True)[:20], 1):
        # Get all records for this name
        records = [d for d in all_deputies if d.get('user_profiles') and d['user_profiles']['full_name'] == name]
        extra = count - 1
        total_extra += extra
        print(f"   {i:2}. {name}")
        print(f"       • عدد التكرار: {count} مرات")
        print(f"       • السجلات الزائدة: {extra}")
        print(f"       • تواريخ الإنشاء:")
        for r in records[:3]:  # Show first 3
            print(f"         - {r['created_at'][:19]} | ID: {r['id'][:8]}...")
        if len(records) > 3:
            print(f"         ... و {len(records) - 3} سجل آخر")
        print()
    
    if len(db_duplicates) > 20:
        remaining = list(db_duplicates.items())[20:]
        for name, count in remaining:
            total_extra += (count - 1)
    
    print(f"📊 إجمالي السجلات الزائدة (المكررة): {total_extra}")
    print(f"📊 العدد الصحيح بعد إزالة التكرار: {len(all_deputies) - total_extra}")
else:
    print("   ✅ لا توجد مكررات!")

print("\n" + "="*80 + "\n")

