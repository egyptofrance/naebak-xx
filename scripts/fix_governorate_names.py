import pandas as pd
import os

# Governorate name mapping (Excel -> Database)
GOVERNORATE_MAPPING = {
    'اسوان': 'أسوان',
    'اسيوط': 'أسيوط',
    'الاقصر': 'الأقصر',
    'الاسكندرية': 'الإسكندرية',
    'الاسماعيلية': 'الإسماعيلية',
}

def fix_excel_file(file_path, column_name):
    """Fix governorate names in Excel file"""
    print(f"\n📝 معالجة ملف: {os.path.basename(file_path)}")
    
    # Read Excel
    df = pd.read_excel(file_path)
    
    if column_name not in df.columns:
        print(f"   ⚠️  العمود '{column_name}' غير موجود")
        return
    
    # Count changes
    changes = 0
    for old_name, new_name in GOVERNORATE_MAPPING.items():
        count = (df[column_name] == old_name).sum()
        if count > 0:
            df.loc[df[column_name] == old_name, column_name] = new_name
            changes += count
            print(f"   ✅ تم تعديل '{old_name}' → '{new_name}' ({count} صف)")
    
    if changes > 0:
        # Save back to Excel
        df.to_excel(file_path, index=False)
        print(f"   💾 تم حفظ التعديلات ({changes} تعديل)")
    else:
        print(f"   ℹ️  لا توجد تعديلات مطلوبة")

# Get project root
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
data_dir = os.path.join(project_root, 'data')

print("="*60)
print("🔧 تصحيح أسماء المحافظات في ملفات Excel")
print("="*60)

# Fix individual candidates file
individual_file = os.path.join(data_dir, 'جميعالمرشحين.xls')
fix_excel_file(individual_file, 'المحافظة')

print("\n" + "="*60)
print("✅ اكتمل التصحيح")
print("="*60)
