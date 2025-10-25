#!/usr/bin/env python3
import os
from supabase import create_client

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

print("\n" + "="*80)
print("🧹 تنظيف Auth users اليتامى")
print("="*80 + "\n")

# Get all auth users
print("📖 جلب جميع Auth users...")
auth_users = supabase.auth.admin.list_users()
print(f"   • إجمالي Auth users: {len(auth_users)}\n")

# Get all user_profiles
print("📖 جلب جميع user_profiles...")
profiles_result = supabase.table('user_profiles').select('id').execute()
profile_ids = set([p['id'] for p in profiles_result.data])
print(f"   • إجمالي user_profiles: {len(profile_ids)}\n")

# Find orphaned users
orphaned = []
for user in auth_users:
    if user.id not in profile_ids:
        orphaned.append(user)

print(f"🔍 وجدت {len(orphaned)} Auth user يتيم\n")

if not orphaned:
    print("✅ لا توجد Auth users يتامى!")
    print("\n" + "="*80 + "\n")
    exit(0)

# Show sample
print("📋 عينة من Auth users اليتامى (أول 10):")
print("-" * 80)
for i, user in enumerate(orphaned[:10], 1):
    email = user.email if hasattr(user, 'email') else 'N/A'
    print(f"{i:2}. {user.id[:8]}... | {email}")

if len(orphaned) > 10:
    print(f"... و {len(orphaned) - 10} user آخر")

print("-" * 80)
print(f"\n🗑️  سيتم حذف {len(orphaned)} Auth user يتيم\n")

# Delete orphaned users
deleted_count = 0
error_count = 0

print("🔄 بدء الحذف...\n")

for i, user in enumerate(orphaned, 1):
    try:
        supabase.auth.admin.delete_user(user.id)
        deleted_count += 1
        
        if i % 50 == 0:
            print(f"   ✅ تم حذف {deleted_count}/{len(orphaned)} user...")
    except Exception as e:
        error_count += 1

print(f"\n✅ اكتمل الحذف!")
print("-" * 80)
print(f"   • تم الحذف بنجاح: {deleted_count}")
print(f"   • فشل الحذف: {error_count}")
print("\n" + "="*80 + "\n")
