#!/usr/bin/env python3
"""
Import Senate members from Excel to Supabase database
"""
import os
import pandas as pd
from supabase import create_client, Client
from slugify import slugify
import uuid

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

SENATE_COUNCIL_ID = 'a2fac295-2777-49a1-ab50-3e3bc07e6530'
DEFAULT_AVATAR_URL = 'https://fvpwvnghkkhrzupglsrh.supabase.co/storage/v1/object/public/Bucket_avatars/AGCRNZJVQrtFQTLKB8PYWG.jpg'

# Caches
governorate_cache = {}
party_cache = {}

def get_governorate_id(name):
    """Get or create governorate ID"""
    if name in governorate_cache:
        return governorate_cache[name]
    
    try:
        # Search by name_ar
        result = supabase.table('governorates').select('id').eq('name_ar', name).execute()
        
        if result.data and len(result.data) > 0:
            gov_id = result.data[0]['id']
            governorate_cache[name] = gov_id
            return gov_id
        
        print(f"   ⚠️  المحافظة '{name}' غير موجودة في قاعدة البيانات")
        return None
        
    except Exception as e:
        print(f"   ❌ خطأ في جلب المحافظة '{name}': {e}")
        return None

def get_party_id(name):
    """Get or create party ID"""
    if name in party_cache:
        return party_cache[name]
    
    try:
        # Search by name_ar
        result = supabase.table('parties').select('id').eq('name_ar', name).execute()
        
        if result.data and len(result.data) > 0:
            party_id = result.data[0]['id']
            party_cache[name] = party_id
            return party_id
        
        # Create new party if not found
        result = supabase.table('parties').insert({
            'name_ar': name,
            'name_en': slugify(name)
        }).execute()
        
        party_id = result.data[0]['id']
        party_cache[name] = party_id
        print(f"   ✅ تم إضافة حزب جديد: {name}")
        return party_id
        
    except Exception as e:
        print(f"   ❌ خطأ في جلب/إضافة الحزب '{name}': {e}")
        return None

def import_senate_member(row, index):
    """Import a single Senate member"""
    try:
        full_name = row['الاسم الكامل'].strip()
        governorate_name = row['المحافظة'].strip()
        candidate_type = 'individual' if row['نوع العضوية'] == 'فردي' else 'list'
        party_name = row['الحزب'].strip()
        
        # Get governorate_id
        governorate_id = get_governorate_id(governorate_name)
        if not governorate_id:
            return False
        
        # Get party_id
        party_id = get_party_id(party_name) if party_name else None
        
        # Generate email
        email_slug = slugify(full_name)
        email = f"{email_slug}-senate-{uuid.uuid4().hex[:4]}@temp.naebak.com"
        
        # Create Auth user
        auth_result = supabase.auth.admin.create_user({
            "email": email,
            "password": "TempPassword123!",
            "email_confirm": True
        })
        
        user_id = auth_result.user.id
        
        # Update user_profile (created automatically by trigger)
        supabase.table('user_profiles').update({
            'full_name': full_name,
            'avatar_url': DEFAULT_AVATAR_URL,
            'role': 'deputy',
            'governorate_id': governorate_id,
            'party_id': party_id
        }).eq('id', user_id).execute()
        
        # Create deputy_profile
        supabase.table('deputy_profiles').insert({
            'user_id': user_id,
            'council_id': SENATE_COUNCIL_ID,
            'candidate_type': candidate_type,
            'is_current_member': True,  # Mark as current member
            'deputy_status': 'current'  # Set status as current member
        }).execute()
        
        return True
        
    except Exception as e:
        print(f"   ❌ فشل استيراد '{full_name}': {e}")
        return False

def main():
    print("\n" + "="*80)
    print("📥 استيراد أعضاء مجلس الشيوخ")
    print("="*80 + "\n")
    
    # Load Excel file
    excel_file = '/home/ubuntu/naebak-xx/data/senate_members.xlsx'
    df = pd.read_excel(excel_file)
    
    print(f"📊 عدد الأعضاء: {len(df)}")
    print(f"🚀 بدء الاستيراد...\n")
    
    success_count = 0
    fail_count = 0
    
    for index, row in df.iterrows():
        if import_senate_member(row, index):
            success_count += 1
        else:
            fail_count += 1
        
        # Progress update every 25 members
        if (index + 1) % 25 == 0:
            print(f"   📊 {index + 1}/{len(df)} | ✅ {success_count} | ❌ {fail_count}")
    
    print(f"\n{'='*80}")
    print(f"✅ اكتمل الاستيراد!")
    print(f"{'='*80}")
    print(f"📊 الإحصائيات:")
    print(f"   ✅ نجح: {success_count}")
    print(f"   ❌ فشل: {fail_count}")
    print(f"   📊 الإجمالي: {len(df)}")
    print(f"{'='*80}\n")

if __name__ == '__main__':
    main()

