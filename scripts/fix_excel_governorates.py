#!/usr/bin/env python3
"""
Fix governorate names in Excel file
"""

import pandas as pd
import json
import os
from datetime import datetime

# Paths
excel_file = '/home/ubuntu/naebak-xx/data/جميعالمرشحين.xlsx'
mapping_file = '/home/ubuntu/naebak-xx/scripts/governorate_mapping.json'
backup_file = f'/home/ubuntu/naebak-xx/data/جميعالمرشحين_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'

print("\n" + "="*80)
print("🔧 تصحيح أسماء المحافظات في ملف Excel")
print("="*80 + "\n")

# Load mapping
print("📖 قراءة التصحيحات...")
with open(mapping_file, 'r', encoding='utf-8') as f:
    mapping = json.load(f)

print(f"✅ تم تحميل {len(mapping)} تصحيح\n")

# Read Excel
print("📖 قراءة ملف Excel...")
df = pd.read_excel(excel_file)
print(f"✅ تم قراءة {len(df)} صف\n")

# Create backup
print("💾 إنشاء نسخة احتياطية...")
df.to_excel(backup_file, index=False)
print(f"✅ تم الحفظ في: {os.path.basename(backup_file)}\n")

# Apply fixes
print("🔧 تطبيق التصحيحات:")
print("-"*80)

total_fixed = 0
for old_name, new_name in mapping.items():
    count = len(df[df['المحافظة'] == old_name])
    if count > 0:
        df.loc[df['المحافظة'] == old_name, 'المحافظة'] = new_name
        total_fixed += count
        print(f"  ✅ '{old_name}' → '{new_name}' ({count} مرشح)")

print("-"*80)
print(f"\n📊 إجمالي المرشحين المصححين: {total_fixed}\n")

# Verify
print("🔍 التحقق من النتائج:")
print("-"*80)
unique_governorates = sorted(df['المحافظة'].unique())
print(f"  • عدد المحافظات الفريدة بعد التصحيح: {len(unique_governorates)}")
print(f"  • قائمة المحافظات:")
for gov in unique_governorates:
    count = len(df[df['المحافظة'] == gov])
    print(f"    - {gov:30} ({count:4} مرشح)")
print("-"*80 + "\n")

# Save corrected file
print("💾 حفظ الملف المصحح...")
df.to_excel(excel_file, index=False)
print(f"✅ تم الحفظ في: {excel_file}\n")

print("="*80)
print("✅ تم التصحيح بنجاح!")
print("="*80 + "\n")

print("📝 ملاحظات:")
print(f"  • النسخة الأصلية محفوظة في: {os.path.basename(backup_file)}")
print(f"  • الملف المصحح: جميعالمرشحين.xlsx")
print(f"  • يمكنك الآن إعادة تشغيل سكريبت الاستيراد\n")

