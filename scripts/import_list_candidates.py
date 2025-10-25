#!/usr/bin/env python3
import pandas as pd
import os
import sys
from supabase import create_client, Client
from slugify import slugify
import random
import string

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

COUNCIL_ID = 'ce2c7990-fe24-4550-a9d7-964ad4d65137'
DEFAULT_AVATAR_URL = 'https://fvpwvnghkkhrzupglsrh.supabase.co/storage/v1/object/public/Bucket_avatars/AGCRNZJVQrtFQTLKB8PYWG.jpg'
VIRTUAL_GOVERNORATE_ID = '2c6d34f9-9b60-421c-b8dd-8fed0fc2e5bc'  # دوائر القوائم

party_cache = {}
district_cache = {}

def generate_temp_email(name, candidate_type):
    slug = slugify(name, allow_unicode=False)
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"{slug}-{candidate_type}-{suffix}@temp.naebak.com"

def generate_temp_password():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

def normalize_party_name(name):
    """Normalize party name to handle variations"""
    name = str(name).strip()
    # Normalize "أجل" vs "اجل"
    name = name.replace('اجل', 'أجل')
    # Remove "القائمة" prefix and add "تحالف" prefix
    name = name.replace('القائمة ', '')
    if not name.startswith('تحالف'):
        name = f'تحالف {name}'
    return name

def create_or_get_party(party_name):
    """Create or get party from database"""
    normalized_name = normalize_party_name(party_name)
    
    if normalized_name in party_cache:
        return party_cache[normalized_name]
    
    try:
        # Check if party exists
        result = supabase.table('parties').select('id').eq('name_ar', normalized_name).execute()
        if result.data and len(result.data) > 0:
            party_id = result.data[0]['id']
            party_cache[normalized_name] = party_id
            return party_id
        
        # Create new party
        result = supabase.table('parties').insert({
            'name_ar': normalized_name,
            'name_en': slugify(normalized_name),
            'description': f'تحالف انتخابي: {normalized_name}'
        }).execute()
        
        party_id = result.data[0]['id']
        party_cache[normalized_name] = party_id
        print(f"   ✅ تم إضافة حزب/تحالف جديد: {normalized_name}")
        return party_id
    except Exception as e:
        print(f"   ⚠️  خطأ في إنشاء/جلب الحزب {normalized_name}: {e}")
        return None

def create_or_get_electoral_district(name, district_type='list'):
    """Create or get electoral district"""
    cache_key = f"{name}_{district_type}"
    if cache_key in district_cache:
        return district_cache[cache_key]
    
    try:
        # Check if district exists
        result = supabase.table('electoral_districts').select('id').eq('name', name).eq('district_type', district_type).execute()
        if result.data and len(result.data) > 0:
            district_id = result.data[0]['id']
            district_cache[cache_key] = district_id
            return district_id
        
        # Create new district with virtual governorate for list districts
        result = supabase.table('electoral_districts').insert({
            'name': name,
            'district_type': district_type,
            'governorate_id': VIRTUAL_GOVERNORATE_ID
        }).execute()
        
        district_id = result.data[0]['id']
        district_cache[cache_key] = district_id
        print(f"   ✅ تم إضافة دائرة انتخابية جديدة: {name}")
        return district_id
    except Exception as e:
        print(f"   ⚠️  خطأ في إنشاء/جلب الدائرة {name}: {e}")
        return None

def import_list_candidates():
    print("\n" + "="*80)
    print("📥 استيراد مرشحي القوائم")
    print("="*80 + "\n")
    
    excel_file = '/home/ubuntu/naebak-xx/data/جميعمرشحيالقوائم.xls'
    df = pd.read_excel(excel_file)
    
    print(f"📊 عدد المرشحين: {len(df)}\n")
    print("🚀 بدء الاستيراد...\n")
    
    success_count = 0
    error_count = 0
    
    for idx, row in df.iterrows():
        try:
            candidate_name = row['الاسم الكامل']
            party_name = row['اسم القائمة']
            district_name = row['دائرة القوائم']
            list_position = row['الترتيب في القائمة']
            is_primary = row['أساسي/ إحتياطي'] == 'أساسي'
            candidate_role = row['صفة المرشح']
            
            # Get or create party
            party_id = create_or_get_party(party_name)
            if not party_id:
                error_count += 1
                continue
            
            # Get or create electoral district
            district_id = create_or_get_electoral_district(district_name, 'list')
            if not district_id:
                error_count += 1
                continue
            
            # Create auth user
            temp_email = generate_temp_email(candidate_name, 'list')
            temp_password = generate_temp_password()
            
            result = supabase.auth.admin.create_user({
                "email": temp_email,
                "password": temp_password,
                "email_confirm": True,
                "user_metadata": {"full_name": candidate_name}
            })
            
            if not result.user:
                error_count += 1
                continue
            
            user_id = result.user.id
            slug = f"list-candidate-{user_id[:8]}"
            
            # Update user_profile (created by trigger)
            supabase.table('user_profiles').update({
                'full_name': candidate_name,
                'party_id': party_id,
                'role': 'deputy',
                'avatar_url': DEFAULT_AVATAR_URL
            }).eq('id', user_id).execute()
            
            # Create deputy_profile
            supabase.table('deputy_profiles').insert({
                'user_id': user_id,
                'slug': slug,
                'electoral_district_id': district_id,
                'candidate_type': 'list',
                'deputy_status': 'candidate',
                'council_id': COUNCIL_ID,
                'party_id': party_id
            }).execute()
            
            success_count += 1
            
            if (idx + 1) % 50 == 0:
                print(f"   📊 {idx + 1}/{len(df)} | ✅ {success_count} | ❌ {error_count}")
                
        except Exception as e:
            print(f"   ❌ {candidate_name}: {str(e)[:100]}")
            error_count += 1
    
    print("\n" + "="*80)
    print("✅ اكتمل الاستيراد!")
    print("="*80)
    print(f"\n📊 الإحصائيات:")
    print(f"   ✅ نجح: {success_count}")
    print(f"   ❌ فشل: {error_count}")
    print(f"   📊 الإجمالي: {success_count + error_count}\n")
    print("="*80 + "\n")

if __name__ == "__main__":
    import_list_candidates()

