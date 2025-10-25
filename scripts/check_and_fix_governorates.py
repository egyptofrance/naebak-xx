#!/usr/bin/env python3
"""
Check governorate names in Excel and create a mapping/fix script
"""

import pandas as pd
import os

# Read the Excel file
excel_file = '/home/ubuntu/naebak-xx/data/جميعالمرشحين.xlsx'

print("\n" + "="*80)
print("🔍 فحص أسماء المحافظات في ملف Excel")
print("="*80 + "\n")

# Read Excel
df = pd.read_excel(excel_file)

# Get unique governorate names
unique_governorates = df['المحافظة'].unique()

print(f"📊 عدد المحافظات الفريدة في الملف: {len(unique_governorates)}\n")
print("📋 قائمة المحافظات:")
print("-" * 80)
for i, gov in enumerate(sorted(unique_governorates), 1):
    count = len(df[df['المحافظة'] == gov])
    print(f"{i:2}. {gov:30} ({count:4} مرشح)")
print("-" * 80)

# الأسماء الصحيحة للمحافظات (من قاعدة البيانات)
CORRECT_GOVERNORATES = {
    'الإسكندرية': 'الإسكندرية',
    'الإسماعيلية': 'الإسماعيلية',
    'أسوان': 'أسوان',
    'أسيوط': 'أسيوط',
    'الأقصر': 'الأقصر',
    'البحر الأحمر': 'البحر الأحمر',
    'البحيرة': 'البحيرة',
    'بني سويف': 'بني سويف',
    'بورسعيد': 'بورسعيد',
    'جنوب سيناء': 'جنوب سيناء',
    'الجيزة': 'الجيزة',
    'الدقهلية': 'الدقهلية',
    'دمياط': 'دمياط',
    'سوهاج': 'سوهاج',
    'السويس': 'السويس',
    'الشرقية': 'الشرقية',
    'شمال سيناء': 'شمال سيناء',
    'الغربية': 'الغربية',
    'الفيوم': 'الفيوم',
    'القاهرة': 'القاهرة',
    'القليوبية': 'القليوبية',
    'قنا': 'قنا',
    'كفر الشيخ': 'كفر الشيخ',
    'مطروح': 'مطروح',
    'المنوفية': 'المنوفية',
    'المنيا': 'المنيا',
    'الوادي الجديد': 'الوادي الجديد',
}

# Mapping for incorrect names
GOVERNORATE_MAPPING = {
    'البحر الاحمر': 'البحر الأحمر',
    'الجيزه': 'الجيزة',
    'الاسكندرية': 'الإسكندرية',
    'الاسماعيلية': 'الإسماعيلية',
    'الاقصر': 'الأقصر',
}

print("\n" + "="*80)
print("🔧 الأسماء التي تحتاج تصحيح:")
print("="*80 + "\n")

needs_fix = []
for gov in unique_governorates:
    if gov in GOVERNORATE_MAPPING:
        correct_name = GOVERNORATE_MAPPING[gov]
        count = len(df[df['المحافظة'] == gov])
        print(f"  ❌ '{gov}' → ✅ '{correct_name}' ({count} مرشح)")
        needs_fix.append((gov, correct_name, count))
    elif gov not in CORRECT_GOVERNORATES:
        count = len(df[df['المحافظة'] == gov])
        print(f"  ⚠️  '{gov}' - اسم غير معروف ({count} مرشح)")
        needs_fix.append((gov, None, count))

if not needs_fix:
    print("  ✅ جميع الأسماء صحيحة!")
else:
    print(f"\n📊 إجمالي الأسماء التي تحتاج تصحيح: {len(needs_fix)}")
    total_affected = sum([x[2] for x in needs_fix])
    print(f"📊 إجمالي المرشحين المتأثرين: {total_affected}")

print("\n" + "="*80)
print("💡 هل تريد تصحيح الأسماء في ملف Excel؟")
print("="*80 + "\n")

