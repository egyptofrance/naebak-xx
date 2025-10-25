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

governorate_cache = {}
district_cache = {}

def generate_temp_email(name, candidate_type):
    slug = slugify(name, allow_unicode=False)
    suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
    return f"{slug}-{candidate_type}-{suffix}@temp.naebak.com"

def generate_temp_password():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=16))

def get_governorate_id(governorate_name):
    if governorate_name in governorate_cache:
        return governorate_cache[governorate_name]
    try:
        result = supabase.table('governorates').select('id').eq('name_ar', governorate_name).single().execute()
        gov_id = result.data['id'] if result.data else None
        governorate_cache[governorate_name] = gov_id
        return gov_id
    except:
        return None

def create_or_get_electoral_district(name, governorate_id, district_type):
    cache_key = f"{name}_{governorate_id}_{district_type}"
    if cache_key in district_cache:
        return district_cache[cache_key]
    try:
        result = supabase.table('electoral_districts').select('id').eq('name', name).eq('governorate_id', governorate_id).eq('district_type', district_type).execute()
        if result.data and len(result.data) > 0:
            district_id = result.data[0]['id']
            district_cache[cache_key] = district_id
            return district_id
        result = supabase.table('electoral_districts').insert({'name': name, 'governorate_id': governorate_id, 'district_type': district_type}).execute()
        district_id = result.data[0]['id']
        district_cache[cache_key] = district_id
        return district_id
    except:
        return None

def import_batch(start_row, end_row):
    print("\n" + "="*80)
    print(f"📥 استيراد المرشحين من {start_row} إلى {end_row}")
    print("="*80 + "\n")
    
    excel_file = '/home/ubuntu/naebak-xx/data/جميعالمرشحين.xlsx'
    df = pd.read_excel(excel_file)
    batch_df = df.iloc[start_row:end_row]
    
    print(f"📊 عدد المرشحين في هذه الدفعة: {len(batch_df)}\n")
    print("🚀 بدء الاستيراد...\n")
    
    success_count = 0
    error_count = 0
    
    for idx, row in batch_df.iterrows():
        try:
            candidate_name = row['اسم المرشح']
            governorate_name = row['المحافظة']
            district_name = row['دائرة فردي']
            
            gov_id = get_governorate_id(governorate_name)
            if not gov_id:
                error_count += 1
                continue
            
            district_id = create_or_get_electoral_district(district_name, gov_id, 'individual')
            if not district_id:
                error_count += 1
                continue
            
            temp_email = generate_temp_email(candidate_name, 'individual')
            temp_password = generate_temp_password()
            
            result = supabase.auth.admin.create_user({"email": temp_email, "password": temp_password, "email_confirm": True, "user_metadata": {"full_name": candidate_name}})
            if not result.user:
                error_count += 1
                continue
            
            user_id = result.user.id
            slug = f"candidate-{user_id[:8]}"
            
            supabase.table('user_profiles').insert({'id': user_id, 'full_name': candidate_name, 'governorate_id': gov_id, 'role': 'deputy', 'avatar_url': DEFAULT_AVATAR_URL}).execute()
            supabase.table('deputy_profiles').insert({'user_id': user_id, 'slug': slug, 'electoral_district_id': district_id, 'candidate_type': 'individual', 'deputy_status': 'candidate', 'council_id': COUNCIL_ID}).execute()
            
            success_count += 1
            
            if (idx - start_row + 1) % 50 == 0:
                print(f"   📊 {idx - start_row + 1}/{len(batch_df)} | ✅ {success_count} | ❌ {error_count}")
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
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    end = int(sys.argv[2]) if len(sys.argv) > 2 else 500
    import_batch(start, end)
