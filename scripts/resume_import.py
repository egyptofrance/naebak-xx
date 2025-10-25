#!/usr/bin/env python3
"""
Resume import from where it stopped - continues after row 550
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

# مجلس النواب ID
COUNCIL_ID = 'ce2c7990-fe24-4550-a9d7-964ad4d65137'

# Default avatar URL
DEFAULT_AVATAR_URL = 'https://fvpwvnghkkhrzupglsrh.supabase.co/storage/v1/object/public/Bucket_avatars/AGCRNZJVQrtFQTLKB8PYWG.jpg'

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
            .execute()
        
        if result.data and len(result.data) > 0:
            district_id = result.data[0]['id']
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
    """Create auth user or get existing user ID"""
    try:
        # Try to get user by email first
        users = supabase.auth.admin.list_users()
        for user in users:
            if user.email == email:
                return user.id
        
        # If not exists, create new user
        result = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": full_name
            }
        })
        return result.user.id if result.user else None
    except Exception as e:
        print(f"   ❌ Error with auth user: {e}")
        return None

def create_user_profile(user_id, full_name, governorate_id):
    """Create user profile or update if exists"""
    try:
        # Check if profile exists
        existing = supabase.table('user_profiles').select('id').eq('id', user_id).execute()
        
        if existing.data and len(existing.data) > 0:
            # Update existing profile
            supabase.table('user_profiles').update({
                'full_name': full_name,
                'governorate_id': governorate_id,
                'role': 'deputy',
                'avatar_url': DEFAULT_AVATAR_URL
            }).eq('id', user_id).execute()
        else:
            # Create new profile
            supabase.table('user_profiles').insert({
                'id': user_id,
                'full_name': full_name,
                'governorate_id': governorate_id,
                'role': 'deputy',
                'avatar_url': DEFAULT_AVATAR_URL
            }).execute()
        return True
    except Exception as e:
        print(f"   ❌ Error with user profile: {e}")
        return False

def create_deputy_profile(user_id, slug, district_id, candidate_type):
    """Create deputy profile"""
    try:
        # Check if already exists
        existing = supabase.table('deputy_profiles')\
            .select('id')\
            .eq('user_id', user_id)\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            return True  # Already exists, skip
        
        result = supabase.table('deputy_profiles').insert({
            'user_id': user_id,
            'slug': slug,
            'electoral_district_id': district_id,
            'candidate_type': candidate_type,
            'deputy_status': 'candidate',
            'council_id': COUNCIL_ID
        }).execute()
        return True
    except Exception as e:
        print(f"   ❌ Error creating deputy profile: {e}")
        return False

def resume_import(start_from=550):
    """Resume import from specific row"""
    print("\n" + "="*80)
    print("🔄 استئناف استيراد المرشحين الأفراد")
    print("="*80 + "\n")
    
    # Get the project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_file = os.path.join(project_root, 'data', 'جميعالمرشحين.xlsx')
    
    print(f"📖 قراءة ملف Excel...")
    df = pd.read_excel(data_file)
    total_rows = len(df)
    print(f"✅ إجمالي المرشحين: {total_rows}")
    print(f"🔄 البدء من الصف: {start_from + 1}\n")
    
    # Start from the specified row
    df = df.iloc[start_from:]
    remaining = len(df)
    print(f"📊 المرشحين المتبقيين: {remaining}\n")
    
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    print("🚀 بدء الاستيراد...\n")
    
    for idx, row in df.iterrows():
        try:
            candidate_name = row['اسم المرشح']
            governorate_name = row['المحافظة']
            district_name = row['دائرة فردي']
            
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
            
            # Generate temp credentials
            temp_email = generate_temp_email(candidate_name, 'individual')
            temp_password = generate_temp_password()
            
            # Create auth user
            user_id = create_auth_user(temp_email, temp_password, candidate_name)
            if not user_id:
                error_count += 1
                continue
            
            # Generate slug from user_id
            slug = f"candidate-{user_id[:8]}"
            
            # Create user profile
            if not create_user_profile(user_id, candidate_name, gov_id):
                error_count += 1
                continue
            
            # Create deputy profile
            if not create_deputy_profile(user_id, slug, district_id, 'individual'):
                error_count += 1
                continue
            
            success_count += 1
            
            # Progress update every 50 candidates
            current_row = idx + 1
            if current_row % 50 == 0:
                print(f"   📊 {current_row}/{total_rows} | ✅ {success_count} | ❌ {error_count} | ⏭️  {skipped_count}")
                time.sleep(0.5)  # Rate limiting
            
        except Exception as e:
            print(f"   ❌ {row.get('اسم المرشح', 'Unknown')}: {e}")
            error_count += 1
    
    print("\n" + "="*80)
    print("✅ اكتمل الاستيراد!")
    print("="*80)
    print(f"\n📊 الإحصائيات النهائية:")
    print(f"   ✅ تم الاستيراد بنجاح: {success_count}")
    print(f"   ❌ فشل الاستيراد: {error_count}")
    print(f"   ⏭️  تم التخطي: {skipped_count}")
    print(f"   📊 الإجمالي: {success_count + error_count + skipped_count}\n")

if __name__ == "__main__":
    resume_import(start_from=550)

