#!/usr/bin/env python3
"""
Remove duplicate candidates - keep oldest, delete newest
"""

import os
from supabase import create_client, Client
from collections import defaultdict

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("\n" + "="*80)
print("🗑️  حذف المرشحين المكررين")
print("="*80 + "\n")

# Get all deputy profiles in batches
print("📖 جلب جميع السجلات من قاعدة البيانات...")
all_deputies = []
batch_size = 1000
offset = 0

# Get count first
count_result = supabase.table('deputy_profiles')\
    .select('id', count='exact')\
    .eq('candidate_type', 'individual')\
    .execute()
total_count = count_result.count

print(f"   • إجمالي السجلات: {total_count}\n")

while offset < total_count:
    result = supabase.table('deputy_profiles')\
        .select('id, user_id, slug, created_at, user_profiles!inner(full_name)')\
        .eq('candidate_type', 'individual')\
        .order('created_at')\
        .range(offset, offset + batch_size - 1)\
        .execute()
    
    all_deputies.extend(result.data)
    offset += batch_size
    print(f"   • تم جلب {len(all_deputies)}/{total_count} سجل...")

print(f"\n✅ تم جلب {len(all_deputies)} سجل\n")

# Group by name
print("🔍 تحليل المكررات...")
name_groups = defaultdict(list)
for deputy in all_deputies:
    if deputy.get('user_profiles'):
        name = deputy['user_profiles']['full_name']
        name_groups[name].append(deputy)

# Find duplicates
duplicates_to_delete = []
unique_names = 0
duplicate_names = 0

for name, records in name_groups.items():
    if len(records) > 1:
        duplicate_names += 1
        # Sort by created_at (oldest first)
        records.sort(key=lambda x: x['created_at'])
        # Keep the oldest, mark the rest for deletion
        for record in records[1:]:
            duplicates_to_delete.append({
                'id': record['id'],
                'user_id': record['user_id'],
                'name': name,
                'created_at': record['created_at']
            })
    else:
        unique_names += 1

print(f"   • أسماء فريدة: {unique_names}")
print(f"   • أسماء مكررة: {duplicate_names}")
print(f"   • سجلات سيتم حذفها: {len(duplicates_to_delete)}\n")

if not duplicates_to_delete:
    print("✅ لا توجد مكررات للحذف!")
    print("\n" + "="*80 + "\n")
    exit(0)

# Show sample of what will be deleted
print("📋 عينة من السجلات التي سيتم حذفها (أول 10):")
print("-" * 80)
for i, record in enumerate(duplicates_to_delete[:10], 1):
    print(f"{i:2}. {record['name']}")
    print(f"    • ID: {record['id'][:8]}...")
    print(f"    • تاريخ الإنشاء: {record['created_at'][:19]}")

if len(duplicates_to_delete) > 10:
    print(f"    ... و {len(duplicates_to_delete) - 10} سجل آخر")

print("-" * 80)
print(f"\n⚠️  سيتم حذف {len(duplicates_to_delete)} سجل مكرر\n")

# Confirm deletion
print("🔄 بدء عملية الحذف...\n")

deleted_count = 0
error_count = 0

for i, record in enumerate(duplicates_to_delete, 1):
    try:
        # Delete deputy_profile
        supabase.table('deputy_profiles').delete().eq('id', record['id']).execute()
        
        # Delete user_profile
        supabase.table('user_profiles').delete().eq('id', record['user_id']).execute()
        
        # Delete auth user
        try:
            supabase.auth.admin.delete_user(record['user_id'])
        except:
            pass  # User might not exist in auth
        
        deleted_count += 1
        
        if i % 50 == 0:
            print(f"   ✅ تم حذف {deleted_count}/{len(duplicates_to_delete)} سجل...")
        
    except Exception as e:
        error_count += 1
        print(f"   ❌ خطأ في حذف {record['name']}: {e}")

print(f"\n✅ اكتملت عملية الحذف!")
print("-" * 80)
print(f"   • تم الحذف بنجاح: {deleted_count}")
print(f"   • فشل الحذف: {error_count}")
print(f"   • الإجمالي: {deleted_count + error_count}")

# Verify final count
print("\n🔍 التحقق من النتيجة النهائية...")
final_result = supabase.table('deputy_profiles')\
    .select('id', count='exact')\
    .eq('candidate_type', 'individual')\
    .execute()
final_count = final_result.count

print(f"   • عدد المرشحين بعد الحذف: {final_count}")
print(f"   • الهدف: 2,620")
print(f"   • الفرق: {final_count - 2620}")

print("\n" + "="*80 + "\n")

