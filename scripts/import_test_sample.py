#!/usr/bin/env python3
"""
Complete script to import candidates with auth user creation
"""

import pandas as pd
import os
from supabase import create_client, Client
from slugify import slugify
import time
import random
import string

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    print("   Run: export SUPABASE_URL='your_url'")
    print("   Run: export SUPABASE_SERVICE_KEY='your_service_key'")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Cache for governorates and districts
governorate_cache = {}
district_cache = {}

def generate_temp_email(name, candidate_type):
    """Generate temporary email for candidate"""
    slug = slugify(name, allow_unicode=False)
    # Add random suffix to avoid conflicts
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"{slug}-{candidate_type}-{suffix}@temp.naebak.com"

def generate_temp_password():
    """Generate temporary password"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

def get_governorate_id(governorate_name):
    """Get governorate ID by name (with caching)"""
    if governorate_name in governorate_cache:
        return governorate_cache[governorate_name]
    
    try:
        result = supabase.table('governorates').select('id').eq('name_ar', governorate_name).single().execute()
        gov_id = result.data['id'] if result.data else None
        governorate_cache[governorate_name] = gov_id
        return gov_id
    except Exception as e:
        print(f"   ⚠️  Governorate not found: {governorate_name}")
        return None

def create_or_get_electoral_district(name, governorate_id, district_type):
    """Create or get electoral district (with caching)"""
    cache_key = f"{name}_{governorate_id}_{district_type}"
    if cache_key in district_cache:
        return district_cache[cache_key]
    
    try:
        # Check if exists
        result = supabase.table('electoral_districts')\
            .select('id')\
            .eq('name', name)\
            .eq('governorate_id', governorate_id)\
            .eq('district_type', district_type)\
            .maybeSingle()\
            .execute()
        
        if result.data:
            district_id = result.data['id']
            district_cache[cache_key] = district_id
            return district_id
        
        # Create new
        result = supabase.table('electoral_districts').insert({
            'name': name,
            'governorate_id': governorate_id,
            'district_type': district_type
        }).execute()
        
        district_id = result.data[0]['id']
        district_cache[cache_key] = district_id
        return district_id
    except Exception as e:
        print(f"   ❌ Error with district {name}: {e}")
        return None

def create_auth_user(email, password, full_name):
    """Create user in Supabase Auth"""
    try:
        # Using Admin API to create user
        result = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,  # Auto-confirm email
            "user_metadata": {
                "full_name": full_name
            }
        })
        return result.user.id if result.user else None
    except Exception as e:
        print(f"   ❌ Error creating auth user: {e}")
        return None

def create_user_profile(user_id, full_name, display_name, governorate_id):
    """Create user profile"""
    try:
        result = supabase.table('user_profiles').insert({
            'id': user_id,
            'full_name': full_name,
            'display_name': display_name,
            'governorate_id': governorate_id,
            'role': 'deputy'
        }).execute()
        return True
    except Exception as e:
        print(f"   ❌ Error creating user profile: {e}")
        return False

def create_deputy_profile(user_id, slug, governorate_id, district_id, candidate_type, party):
    """Create deputy profile"""
    try:
        result = supabase.table('deputy_profiles').insert({
            'user_id': user_id,
            'slug': slug,
            'governorate_id': governorate_id,
            'electoral_district_id': district_id,
            'candidate_type': candidate_type,
            'party': party if pd.notna(party) else 'مستقل',
            'status': 'candidate'
        }).execute()
        return True
    except Exception as e:
        print(f"   ❌ Error creating deputy profile: {e}")
        return False
def import_individual_candidates(dry_run=False, limit=None):
    """Import individual candidates"""
    print("\n👤 استيراد المرشحين الأفراد...")
    
    df = pd.read_excel('data/جميعالمرشحين.xls')
    
    # Limit to first N rows if specified
    if limit:
        df = df.head(limit)
        print(f"   🔍 وضع الاختبار: استيراد أول {limit} مرشح فقط")
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    for idx, row in df.iterrows():
        try:
            candidate_name = row['اسم المرشح']
            governorate_name = row['المحافظة']
            district_name = row['دائرة فردي']
            party = row.get('الانتماء الحزبي', 'مستقل')
            
            # Get governorate ID
            gov_id = get_governorate_id(governorate_name)
            if not gov_id:
                error_count += 1
                continue
            
            # Get or create electoral district
            district_id = create_or_get_electoral_district(district_name, gov_id, 'individual')
            if not district_id:
                error_count += 1
                continue
            
            # Generate slug
            slug = slugify(candidate_name)
            
            # Check if already exists
            existing = supabase.table('deputy_profiles')\
                .select('id')\
                .eq('slug', slug)\
                .maybeSingle()\
                .execute()
            
            if existing.data:
                skipped_count += 1
                continue
            
            if dry_run:
                print(f"   [DRY RUN] Would create: {candidate_name} ({governorate_name} - {district_name})")
                success_count += 1
                continue
            
            # Generate temp credentials
            temp_email = generate_temp_email(candidate_name, 'individual')
            temp_password = generate_temp_password()
            
            # Create auth user
            user_id = create_auth_user(temp_email, temp_password, candidate_name)
            if not user_id:
                error_count += 1
                continue
            
            # Create user profile
            if not create_user_profile(user_id, candidate_name, candidate_name, gov_id):
                error_count += 1
                continue
            
            # Create deputy profile
            if not create_deputy_profile(user_id, slug, gov_id, district_id, 'individual', party):
                error_count += 1
                continue
            
            success_count += 1
            
            if (idx + 1) % 50 == 0:
                print(f"   📊 {idx + 1}/{len(df)} | ✅ {success_count} | ❌ {error_count} | ⏭️  {skipped_count}")
                time.sleep(0.5)  # Rate limiting
            
        except Exception as e:
            print(f"   ❌ {row.get('اسم المرشح', 'Unknown')}: {e}")
            error_count += 1
    
    print(f"\n   ✅ نجح: {success_count}")
    print(f"   ❌ فشل: {error_count}")
    print(f"   ⏭️  تم تخطيه: {skipped_count}")
    
    return success_count

def import_list_candidates(dry_run=False):
    """Import list candidates"""
    print("\n📋 استيراد مرشحي القوائم...")
    
    df = pd.read_excel('جميعمرشحيالقوائم.xls')
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    for idx, row in df.iterrows():
        try:
            candidate_name = row['اسم المرشح']
            list_district = row['دائرة القوائم']
            
            # For list candidates, we need to handle differently
            # as they're not tied to specific governorates
            # We'll skip governorate for now
            
            slug = slugify(candidate_name)
            
            # Check if already exists
            existing = supabase.table('deputy_profiles')\
                .select('id')\
                .eq('slug', slug)\
                .maybeSingle()\
                .execute()
            
            if existing.data:
                skipped_count += 1
                continue
            
            if dry_run:
                print(f"   [DRY RUN] Would create: {candidate_name} ({list_district})")
                success_count += 1
                continue
            
            # Generate temp credentials
            temp_email = generate_temp_email(candidate_name, 'list')
            temp_password = generate_temp_password()
            
            # Create auth user
            user_id = create_auth_user(temp_email, temp_password, candidate_name)
            if not user_id:
                error_count += 1
                continue
            
            # Create user profile (without governorate for now)
            if not create_user_profile(user_id, candidate_name, candidate_name, None):
                error_count += 1
                continue
            
            # Create deputy profile (without district for now)
            if not create_deputy_profile(user_id, slug, None, None, 'list', None):
                error_count += 1
                continue
            
            success_count += 1
            
            if (idx + 1) % 50 == 0:
                print(f"   📊 {idx + 1}/{len(df)} | ✅ {success_count} | ❌ {error_count} | ⏭️  {skipped_count}")
                time.sleep(0.5)
            
        except Exception as e:
            print(f"   ❌ {row.get('اسم المرشح', 'Unknown')}: {e}")
            error_count += 1
    
    print(f"\n   ✅ نجح: {success_count}")
    print(f"   ❌ فشل: {error_count}")
    print(f"   ⏭️  تم تخطيه: {skipped_count}")
    
    return success_count

def main():
    """Main import function"""
    print("="*60)
    print("🧪 وضع الاختبار: استيراد 10 مرشحين فقط")
    print("="*60)
    
    print("\n📝 هذا السكريبت سيقوم بـ:")
    print("   1. استيراد أول 10 مرشحين أفراد كعينة اختبار")
    print("   2. إنشاء حسابات لهم في النظام")
    print("   3. ربطهم بالدوائر الانتخابية")
    print("\n🚀 بدء الاستيراد...\n")
    
    # Import only first 10 individual candidates (REAL import, not dry run)
    individual_count = import_individual_candidates(dry_run=False, limit=10)
    
    # Skip list candidates for now
    list_count = 0
    
    print("\n" + "="*60)
    print("📊 ملخص الاستيراد:")
    print(f"   - مرشحو الفردي: {individual_count}")
    print(f"   - مرشحو القوائم: {list_count}")
    print(f"   - الإجمالي: {individual_count + list_count}")
    print("="*60)

if __name__ == "__main__":
    main()

