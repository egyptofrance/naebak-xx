#!/usr/bin/env python3
"""
Script to populate deputy ratings with realistic data
- Rating: 2.1 to 3.8
- Rating count: 1000 to 5000
"""

from supabase import create_client
import random

# Supabase configuration
SUPABASE_URL = "https://fvpwvnghkkhrzupglsrh.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2cHd2bmdoa2tocnp1cGdsc3JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ2NzczMSwiZXhwIjoyMDc2MDQzNzMxfQ.4gQ4MvhqlZuXjJA_w9OCNaTXcB06WrLF_rY-1Cyopcg"

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)

def generate_rating():
    """Generate random rating between 2.1 and 3.8"""
    return round(random.uniform(2.1, 3.8), 1)

def generate_rating_count():
    """Generate random rating count between 1000 and 5000"""
    return random.randint(1000, 5000)

def main():
    print("=" * 70)
    print("تعبئة التقييمات للنواب")
    print("=" * 70)
    
    # Get all deputies
    print("\n📊 جلب بيانات النواب...")
    response = supabase.table("deputy_profiles").select("id, display_name, rating_average, rating_count").execute()
    
    deputies = response.data
    total_deputies = len(deputies)
    
    print(f"✅ تم جلب {total_deputies} نائب")
    
    # Count deputies with no ratings
    no_rating = sum(1 for d in deputies if not d.get('rating_average') or d.get('rating_average') == 0)
    print(f"📊 النواب بدون تقييمات: {no_rating}")
    
    if no_rating == 0:
        print("\n✅ جميع النواب لديهم تقييمات بالفعل!")
        return
    
    # Update deputies without ratings
    print(f"\n🔄 تحديث التقييمات لـ {no_rating} نائب...")
    
    updated_count = 0
    for deputy in deputies:
        if not deputy.get('rating_average') or deputy.get('rating_average') == 0:
            rating = generate_rating()
            rating_count = generate_rating_count()
            
            # Update deputy
            supabase.table("deputy_profiles").update({
                "rating_average": rating,
                "rating_count": rating_count
            }).eq("id", deputy['id']).execute()
            
            updated_count += 1
            
            if updated_count % 100 == 0:
                print(f"  ✓ تم تحديث {updated_count}/{no_rating} نائب...")
    
    print(f"\n✅ تم تحديث {updated_count} نائب بنجاح!")
    
    # Verify results
    print("\n📊 التحقق من النتائج...")
    response = supabase.table("deputy_profiles").select("rating_average, rating_count").execute()
    
    deputies = response.data
    avg_rating = sum(d.get('rating_average', 0) for d in deputies) / len(deputies)
    avg_count = sum(d.get('rating_count', 0) for d in deputies) / len(deputies)
    
    print(f"  متوسط التقييم: {avg_rating:.2f}")
    print(f"  متوسط عدد المقيمين: {avg_count:.0f}")
    
    # Sample data
    print("\n📋 عينة من البيانات:")
    sample = random.sample(deputies, min(5, len(deputies)))
    for d in sample:
        print(f"  - التقييم: {d.get('rating_average', 0):.1f} | المقيمين: {d.get('rating_count', 0)}")
    
    print("\n" + "=" * 70)
    print("✅ تم الانتهاء بنجاح!")
    print("=" * 70)

if __name__ == "__main__":
    main()

