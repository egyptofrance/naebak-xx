#!/usr/bin/env python3
import os
from supabase import create_client

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("\n" + "="*80)
print("🗑️  حذف جميع المرشحين الأفراد")
print("="*80 + "\n")

# Get all individual deputies
print("📖 جلب جميع المرشحين الأفراد...")
all_deputies = []
batch_size = 1000
offset = 0

count_result = supabase.table('deputy_profiles').select('id', count='exact').eq('candidate_type', 'individual').execute()
total_count = count_result.count
print(f"   • إجمالي المرشحين: {total_count}\n")

while offset < total_count:
    result = supabase.table('deputy_profiles').select('id, user_id').eq('candidate_type', 'individual').range(offset, offset + batch_size - 1).execute()
    all_deputies.extend(result.data)
    offset += batch_size

print(f"✅ تم جلب {len(all_deputies)} مرشح\n")
print("🔄 بدء الحذف...\n")

deleted_count = 0

for i, deputy in enumerate(all_deputies, 1):
    try:
        user_id = deputy['user_id']
        
        # Delete deputy_profile
        supabase.table('deputy_profiles').delete().eq('id', deputy['id']).execute()
        
        # Delete user_profile
        supabase.table('user_profiles').delete().eq('id', user_id).execute()
        
        # Delete auth user
        try:
            supabase.auth.admin.delete_user(user_id)
        except:
            pass
        
        deleted_count += 1
        
        if i % 100 == 0:
            print(f"   ✅ تم حذف {deleted_count}/{len(all_deputies)} مرشح...")
    except Exception as e:
        print(f"   ❌ خطأ: {e}")

print(f"\n✅ اكتمل الحذف!")
print(f"   • تم حذف {deleted_count} مرشح\n")
print("="*80 + "\n")
