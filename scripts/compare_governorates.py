#!/usr/bin/env python3
"""
Compare governorate names between database and Excel file
"""

import pandas as pd

# Read the Excel file
excel_file = '/home/ubuntu/naebak-xx/data/جميعالمرشحين.xlsx'
df = pd.read_excel(excel_file)

# Get unique governorate names from Excel
excel_governorates = sorted(df['المحافظة'].unique())

# الأسماء الصحيحة للمحافظات (27 محافظة مصرية)
# يجب أن تكون هذه متطابقة تماماً مع قاعدة البيانات
CORRECT_GOVERNORATES = [
    'الإسكندرية',
    'الإسماعيلية',
    'أسوان',
    'أسيوط',
    'الأقصر',
    'البحر الأحمر',
    'البحيرة',
    'بني سويف',
    'بورسعيد',
    'جنوب سيناء',
    'الجيزة',
    'الدقهلية',
    'دمياط',
    'سوهاج',
    'السويس',
    'الشرقية',
    'شمال سيناء',
    'الغربية',
    'الفيوم',
    'القاهرة',
    'القليوبية',
    'قنا',
    'كفر الشيخ',
    'مطروح',
    'المنوفية',
    'المنيا',
    'الوادي الجديد',
]

print("\n" + "="*100)
print("📊 مقارنة أسماء المحافظات بين Excel وقاعدة البيانات")
print("="*100 + "\n")

print(f"{'#':<4} {'Excel':^35} | {'قاعدة البيانات':^35} | {'الحالة':^15}")
print("-"*100)

# Create mapping
mapping = {}
for i, excel_name in enumerate(excel_governorates, 1):
    count = len(df[df['المحافظة'] == excel_name])
    
    # Try to find matching name
    matched = False
    correct_name = None
    
    # Exact match
    if excel_name in CORRECT_GOVERNORATES:
        status = "✅ متطابق"
        correct_name = excel_name
        matched = True
    else:
        # Try to find similar name
        excel_normalized = excel_name.replace('ه', 'ة').replace('ى', 'ي').replace('أ', 'ا')
        
        for correct in CORRECT_GOVERNORATES:
            correct_normalized = correct.replace('ه', 'ة').replace('ى', 'ي').replace('أ', 'ا')
            if excel_normalized == correct_normalized:
                status = f"⚠️  يحتاج تصحيح"
                correct_name = correct
                matched = True
                mapping[excel_name] = correct_name
                break
        
        if not matched:
            # Check if it's a partial match
            for correct in CORRECT_GOVERNORATES:
                if excel_name in correct or correct in excel_name:
                    status = f"⚠️  يحتاج تصحيح"
                    correct_name = correct
                    matched = True
                    mapping[excel_name] = correct_name
                    break
        
        if not matched:
            status = "❌ غير موجود"
            correct_name = "؟؟؟"
    
    print(f"{i:<4} {excel_name:^35} | {correct_name:^35} | {status:^15} ({count} مرشح)")

print("-"*100)
print(f"\n📊 الإحصائيات:")
print(f"   • عدد المحافظات في Excel: {len(excel_governorates)}")
print(f"   • عدد المحافظات الصحيحة: {len(CORRECT_GOVERNORATES)}")
print(f"   • عدد المحافظات التي تحتاج تصحيح: {len(mapping)}")

if mapping:
    print(f"\n🔧 التصحيحات المطلوبة:")
    print("-"*100)
    total_affected = 0
    for excel_name, correct_name in mapping.items():
        count = len(df[df['المحافظة'] == excel_name])
        total_affected += count
        print(f"   '{excel_name}' → '{correct_name}' ({count} مرشح)")
    print(f"\n   📊 إجمالي المرشحين المتأثرين: {total_affected}")
else:
    print(f"\n✅ جميع الأسماء صحيحة!")

print("\n" + "="*100 + "\n")

# Save mapping for use in fix script
if mapping:
    print("💾 حفظ التصحيحات في ملف...")
    import json
    with open('/home/ubuntu/naebak-xx/scripts/governorate_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
    print("✅ تم الحفظ في: scripts/governorate_mapping.json\n")

