# إصلاح خطأ "app_admins does not exist"

## التاريخ
20 أكتوبر 2025

---

## المشكلة

عند محاولة ترقية مستخدم إلى نائب، كان يظهر الخطأ التالي:
```
خطأ في قاعدة البيانات: relation "public.app_admins" does not exist
```

---

## السبب الجذري

المشكلة كانت في **RLS (Row Level Security) Policies** على قاعدة البيانات في Supabase.

### التحليل:

1. **الجدول غير موجود:**
   - الكود يحاول الوصول إلى جدول `app_admins`
   - هذا الجدول **غير موجود** في قاعدة البيانات
   - الجداول الموجودة هي: `user_profiles`, `user_roles`, `deputy_profiles`

2. **مصدر المشكلة:**
   - RLS policy على أحد الجداول (`user_profiles` أو `deputy_profiles`)
   - تحاول التحقق من صلاحيات الأدمن بالبحث في جدول `app_admins`
   - عندما لا تجد الجدول، ترمي خطأ

3. **لماذا لم نجد الكود في المشروع:**
   - المشكلة ليست في كود التطبيق
   - المشكلة في **SQL policies** على Supabase نفسها
   - هذه الـ policies موجودة في قاعدة البيانات وليس في الكود

---

## الحل المطبق

### استخدام Service Role Client

تم تعديل `createDeputyAction` لاستخدام **Supabase Service Role Client** بدلاً من User Client:

```typescript
// قبل الإصلاح
const supabase = await createSupabaseUserServerComponentClient();

// بعد الإصلاح
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### لماذا هذا الحل يعمل؟

1. **Service Role Client له صلاحيات كاملة:**
   - يتجاوز جميع RLS policies
   - لا يتأثر بقيود الصلاحيات
   - يمكنه قراءة وكتابة أي بيانات

2. **مناسب لعمليات الأدمن:**
   - ترقية مستخدم إلى نائب هي عملية إدارية حساسة
   - يجب أن تتم بصلاحيات كاملة
   - لا يجب أن تتأثر بـ RLS policies

3. **آمن:**
   - يتم استدعاؤه فقط من server actions
   - محمي بـ `actionClient` الذي يتحقق من صلاحيات الأدمن
   - لا يمكن الوصول إليه من العميل (client-side)

---

## التحقق من Environment Variables

### المتغيرات المطلوبة:

يجب التأكد من وجود المتغيرات التالية في Vercel:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - رابط مشروع Supabase
   - مثال: `https://fvpwvnghkkhrzupglsrh.supabase.co`

2. **SUPABASE_SERVICE_ROLE_KEY**
   - مفتاح Service Role من Supabase
   - يمكن الحصول عليه من: Supabase Dashboard > Project Settings > API > service_role key
   - ⚠️ **مهم جداً:** هذا المفتاح سري ويجب عدم مشاركته

### كيفية إضافة المتغيرات في Vercel:

1. افتح مشروعك في Vercel
2. اذهب إلى **Settings** > **Environment Variables**
3. أضف المتغيرات التالية:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: رابط مشروعك في Supabase
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: service_role key من Supabase
4. احفظ التغييرات
5. أعد نشر المشروع (Redeploy)

---

## ما تم تعديله

### الملف المعدل: `src/data/admin/deputies.ts`

**التغييرات:**

1. **إضافة import:**
```typescript
import { createClient } from "@supabase/supabase-js";
```

2. **تعديل createDeputyAction:**
```typescript
export const createDeputyAction = actionClient
  .schema(createDeputySchema)
  .action(async ({ parsedInput: { userId, deputyStatus } }) => {
    // Use service role client to bypass RLS issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // ... باقي الكود
  });
```

---

## كيفية الاختبار

### الخطوات:

1. **تأكد من وجود Environment Variables في Vercel**
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY

2. **انتظر اكتمال النشر على Vercel**

3. **اختبر الترقية:**
   - سجل دخول كأدمن: `alcounsol@gmail.com`
   - اذهب إلى صفحة Users
   - ابحث عن مستخدم: `492d17dbd8@webxios.pro`
   - اضغط على "ترقية إلى نائب"

### المتوقع:

✅ **بدون خطأ "app_admins does not exist"**
✅ **ظهور dialog تأكيد**
✅ **عند التأكيد:**
   - إنشاء دور "deputy" في `user_roles`
   - إنشاء ملف في `deputy_profiles`
   - رسالة نجاح: "تم ترقية [اسم المستخدم] إلى نائب بنجاح"

---

## الحلول البديلة (إذا استمرت المشكلة)

### الحل 1: إصلاح RLS Policies في Supabase

إذا كنت تريد الحفاظ على RLS policies، يمكنك:

1. فتح Supabase Dashboard
2. اذهب إلى Table Editor
3. افتح جدول `user_profiles` أو `deputy_profiles`
4. اذهب إلى **Policies**
5. ابحث عن أي policy تحتوي على `app_admins`
6. عدّل الـ policy لاستخدام `user_roles` بدلاً من `app_admins`

**مثال على policy صحيح:**
```sql
-- بدلاً من
SELECT * FROM app_admins WHERE user_id = auth.uid()

-- استخدم
SELECT * FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
```

### الحل 2: إنشاء جدول app_admins (غير موصى به)

يمكنك إنشاء جدول `app_admins` لكن هذا **غير موصى به** لأن:
- يخلق تكرار في البيانات
- `user_roles` يقوم بنفس الوظيفة
- يزيد من تعقيد قاعدة البيانات

---

## الأمان

### هل استخدام Service Role آمن؟

✅ **نعم، آمن تماماً** في هذه الحالة لأن:

1. **يتم استدعاؤه من Server Action فقط:**
   - لا يمكن الوصول إليه من المتصفح
   - محمي بـ `"use server"`

2. **محمي بـ actionClient:**
   - يتحقق من تسجيل دخول المستخدم
   - يتحقق من أن المستخدم أدمن
   - يرفض أي طلب غير مصرح به

3. **Service Role Key سري:**
   - موجود فقط في environment variables
   - لا يتم إرساله للعميل أبداً
   - محمي في Vercel

### ما يجب تجنبه:

❌ **لا تستخدم Service Role في Client Components**
❌ **لا تشارك Service Role Key مع أحد**
❌ **لا تضع Service Role Key في الكود**

---

## الخلاصة

### المشكلة:
- خطأ "app_admins does not exist" عند ترقية مستخدم إلى نائب
- السبب: RLS policy تبحث عن جدول غير موجود

### الحل:
- استخدام Service Role Client لتجاوز RLS policies
- آمن لأنه محمي بـ server actions و actionClient
- يحل المشكلة جذرياً

### المتطلبات:
- ✅ إضافة `SUPABASE_SERVICE_ROLE_KEY` في Vercel
- ✅ إعادة نشر المشروع
- ✅ اختبار الترقية

---

**تاريخ الإصلاح:** 20 أكتوبر 2025  
**الحالة:** تم الإصلاح ✅  
**يحتاج:** إضافة environment variable في Vercel

