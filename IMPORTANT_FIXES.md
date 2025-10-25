# 🔧 النقاط المهمة من التجارب السابقة - NAEBAK

**التاريخ:** 18 أكتوبر 2025  
**الغرض:** توثيق الإصلاحات الضرورية التي يجب تطبيقها عند الحاجة

---

## ⚠️ الأخطاء المحتملة والحلول الجاهزة

### 1. مشكلة تكرار اللغة في روابط الترقيم (Pagination)

**الأعراض:**
- روابط مثل `/en/en/app_admin/users?page=2`
- تكرار `/en/` في الرابط

**السبب:**
- استخدام `usePathname()` من `next/navigation` بدلاً من `next-intl`

**الحل:**
```typescript
// ❌ خطأ
import { usePathname } from "next/navigation";

// ✅ صحيح
import { usePathname } from "@/components/intl-link";
```

**الملفات المتأثرة:**
- `src/components/Pagination/Pagination.tsx`
- أي component آخر يستخدم `usePathname` مع روابط

**القاعدة الذهبية:**
> عند استخدام next-intl، استخدم دائمًا hooks من next-intl وليس من next/navigation

---

### 2. خطأ TypeScript: Property 'from' does not exist

**الأعراض:**
```
Type error: Property 'from' does not exist on type 'Promise<SupabaseClient<...>>'
```

**السبب:**
- نسيان `await` قبل استدعاء `createSupabaseUserServerComponentClient()`

**الحل:**
```typescript
// ❌ خطأ
const supabase = createSupabaseUserServerComponentClient();

// ✅ صحيح
const supabase = await createSupabaseUserServerComponentClient();
```

**الملفات المحتملة:**
- أي Server Component يستخدم Supabase client

---

### 3. مشكلة صلاحيات الأدمن (Admin Access)

**الأعراض:**
- التحويل التلقائي من `/app_admin` إلى `/home`
- رسالة "User is not an app admin"

**السبب:**
- عدم تحديث `app_metadata.user_role` في Auth

**الحل:**
استخدام Python Script لتحديث app_metadata:

```python
import requests

SUPABASE_URL = "https://fvpwvnghkkhrzupglsrh.supabase.co"
SERVICE_KEY = "YOUR_SERVICE_ROLE_KEY"

def make_user_admin(email):
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Get users
    response = requests.get(f'{SUPABASE_URL}/auth/v1/admin/users', headers=headers)
    users = response.json().get('users', [])
    
    # Find user
    target_user = next((u for u in users if u['email'] == email), None)
    if not target_user:
        print(f"User not found: {email}")
        return
    
    user_id = target_user['id']
    current_metadata = target_user.get('app_metadata', {})
    new_metadata = {**current_metadata, 'user_role': 'admin'}
    
    # Update
    update_response = requests.put(
        f'{SUPABASE_URL}/auth/v1/admin/users/{user_id}',
        headers=headers,
        json={'app_metadata': new_metadata}
    )
    
    if update_response.status_code == 200:
        print(f"✓ {email} is now an admin!")
        print("User must logout and login again to see changes.")
    else:
        print(f"✗ Error: {update_response.text}")

# Usage
make_user_admin('admin@naebak.com')
```

**ملاحظة مهمة:**
- المستخدم يجب أن يسجل خروج ثم دخول مرة أخرى لتطبيق التغييرات

---

### 4. مشكلة Stripe API Version

**الأعراض:**
- خطأ في Stripe API عند محاولة الدفع

**الحل:**
تحديث API version في `src/payments/StripePaymentGateway.ts`:

```typescript
// ❌ قديم
apiVersion: "2024-11-20.acacia"

// ✅ جديد
apiVersion: "2025-02-24.acacia"
```

---

## 📋 قائمة التحقق قبل النشر (Pre-deployment Checklist)

### قاعدة البيانات:
- [ ] تم تطبيق جميع migrations
- [ ] جدول `governorates` يحتوي على 27 محافظة
- [ ] جدول `user_profiles` يحتوي على حقل `role`
- [ ] جدول `deputy_profiles` منظف من الحقول المكررة

### متغيرات البيئة:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` مضبوط
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` مضبوط
- [ ] `SUPABASE_SERVICE_ROLE_KEY` مضبوط
- [ ] `NEXT_PUBLIC_SITE_URL` مضبوط

### الكود:
- [ ] جميع استخدامات `usePathname` من `next-intl`
- [ ] جميع استدعاءات Supabase client تستخدم `await`
- [ ] لا توجد أخطاء TypeScript في Build

---

## 🚀 الخطوات التالية المقترحة

1. **التحقق من النشر على Vercel:**
   - تأكد من نجاح Build
   - تحقق من عدم وجود أخطاء في Logs

2. **إنشاء حساب أدمن:**
   - سجل كمستخدم عادي
   - استخدم Python script لترقيته إلى admin
   - سجل خروج ودخول مرة أخرى
   - تحقق من الوصول إلى `/app_admin`

3. **اختبار إنشاء نائب:**
   - ادخل إلى لوحة الأدمن
   - جرب إنشاء نائب جديد
   - تحقق من حفظ البيانات في قاعدة البيانات

---

## 📞 ملاحظات إضافية

- **لا تطبق أي إصلاح إلا إذا ظهرت المشكلة فعليًا**
- هذا الملف للمرجعية فقط
- عند ظهور أي خطأ، راجع هذا الملف أولاً

---

**آخر تحديث:** 18 أكتوبر 2025



### 5. ⚠️ **مشكلة Database Types عند إضافة جداول جديدة** (حرج جداً!)

**الأعراض:**
```
Type error: Argument of type '"new_table_name"' is not assignable to parameter of type '"existing_table1" | "existing_table2" | ...'
```
أو:
```
Type error: Property 'from' does not exist on type 'Promise<SupabaseClient<...>>'
```

**السبب:**
- عند إنشاء جدول جديد في Supabase، الـ TypeScript types **لا تتحدث تلقائياً**
- الجدول الجديد غير موجود في ملف `src/types/supabase.ts`
- TypeScript لا يعرف الجدول الجديد فيرفض الكود

**الحل الصحيح (يجب تطبيقه فوراً بعد إنشاء أي جدول جديد):**

#### الخطوة 1: تحديث Database Types من Supabase
```bash
cd /home/ubuntu/naebak-xx

# استخدام Access Token لتحديث الـ types
SUPABASE_ACCESS_TOKEN=sbp_6d8bac35adfa6042736de8efa3e9d71e9edd4545 \
npx supabase gen types typescript \
--project-id fvpwvnghkkhrzupglsrh \
> src/types/supabase.ts
```

#### الخطوة 2: التحقق من نجاح التحديث
```bash
# تحقق من حجم الملف (يجب أن يكون > 100KB)
ls -lh src/types/supabase.ts

# تحقق من وجود الجدول الجديد
grep "new_table_name" src/types/supabase.ts
```

#### الخطوة 3: إزالة Type Assertions المؤقتة
```typescript
// ❌ قبل (مؤقت)
const { data } = await (supabase as any)
  .from('new_table_name')
  .select('*');

// ✅ بعد (نظيف)
const { data } = await supabase
  .from('new_table_name')
  .select('*');
```

**القاعدة الذهبية:**
> **أي جدول جديد في Supabase = تحديث فوري للـ database types**
> 
> لا تستخدم `(supabase as any)` كحل دائم - هذا حل مؤقت فقط!

**متى يجب تطبيق هذا؟**
- ✅ فوراً بعد تنفيذ migration جديدة
- ✅ فوراً بعد إنشاء جدول جديد في Supabase Dashboard
- ✅ قبل كتابة أي كود يستخدم الجدول الجديد
- ✅ عند ظهور أخطاء TypeScript تتعلق بأسماء الجداول

**معلومات Supabase للمشروع:**
```
Project ID: fvpwvnghkkhrzupglsrh
Access Token: sbp_6d8bac35adfa6042736de8efa3e9d71e9edd4545
```

**ملاحظة مهمة:**
- تحديث الـ types **لا يؤثر** على قاعدة البيانات نفسها
- هو فقط لمساعدة TypeScript على فهم البنية
- يجب عمله في بيئة التطوير قبل Push

---

**آخر تحديث:** 25 أكتوبر 2025


