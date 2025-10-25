#!/usr/bin/env python3
"""
Create deputy_profiles for users who have user_profiles but no deputy_profiles
"""

import pandas as pd
import os
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# مجلس النواب ID
COUNCIL_ID = 'ce2c7990-fe24-4550-a9d7-964ad4d65137'

# Cache
governorate_cache = {}
district_cache = {}

def get_governorate_id(governorate_name):
    """Get governorate ID by name"""
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
    """Create or get electoral district"""
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
    except Exception as e:
        return None

def fix_missing_deputy_profiles():
    """Create deputy_profiles for existing user_profiles"""
    print("\n" + "="*80)
    print("🔧 إصلاح deputy_profiles الناقصة")
    print("="*80 + "\n")
    
    missing_file = '/home/ubuntu/naebak-xx/data/missing_candidates.xlsx'
    df = pd.read_excel(missing_file)
    print(f"📖 عدد المرشحين الناقصين: {len(df)}\n")
    
    success_count = 0
    error_count = 0
    
    print("🚀 بدء الإصلاح...\n")
    
    for idx, row in df.iterrows():
        try:
            candidate_name = row['اسم المرشح']
            governorate_name = row['المحافظة']
            district_name = row['دائرة فردي']
            
            user_result = supabase.table('user_profiles').select('id, governorate_id').eq('full_name', candidate_name).execute()
            
            if not user_result.data or len(user_result.data) == 0:
                error_count += 1
                continue
            
            user_id = user_result.data[0]['id']
            
            deputy_check = supabase.table('deputy_profiles').select('id').eq('user_id', user_id).execute()
            
            if deputy_check.data and len(deputy_check.data) > 0:
                continue
            
            gov_id = get_governorate_id(governorate_name)
            if not gov_id:
                error_count += 1
                continue
            
            district_id = create_or_get_electoral_district(district_name, gov_id, 'individual')
            if not district_id:
                error_count += 1
                continue
            
            slug = f"candidate-{user_id[:8]}"
            
            supabase.table('deputy_profiles').insert({'user_id': user_id, 'slug': slug, 'electoral_district_id': district_id, 'candidate_type': 'individual', 'deputy_status': 'candidate', 'council_id': COUNCIL_ID}).execute()
            
            success_count += 1
            
            if (idx + 1) % 10 == 0:
                print(f"   📊 {idx + 1}/{len(df)} | ✅ {success_count} | ❌ {error_count}")
            
        except Exception as e:
            error_count += 1
    
    print("\n" + "="*80)
    print("✅ اكتمل الإصلاح!")
    print("="*80)
    print(f"\n📊 الإحصائيات النهائية:")
    print(f"   ✅ تم الإصلاح بنجاح: {success_count}")
    print(f"   ❌ فشل الإصلاح: {error_count}\n")
    
    final_result = supabase.table('deputy_profiles').select('id', count='exact').eq('candidate_type', 'individual').execute()
    final_count = final_result.count
    
    print(f"   • عدد المرشحين الأفراد الآن: {final_count}")
    print(f"   • الهدف: 2,620")
    print(f"   • الفرق: {final_count - 2620}\n")
    print("="*80 + "\n")

if __name__ == "__main__":
    fix_missing_deputy_profiles()
