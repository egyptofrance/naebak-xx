# تقرير اختبار نظام ترقية النواب

## التاريخ
20 أكتوبر 2025

---

## ملخص الاختبار

### ✅ ما يعمل:

1. **Dialog التأكيد يظهر بشكل صحيح:**
   - ✅ عنوان واضح: "تأكيد الترقية إلى نائب"
   - ✅ رسالة تأكيد مع اسم المستخدم
   - ✅ زر "إلغاء" (أخضر)
   - ✅ زر "تأكيد الترقية" (أزرق)
   - ✅ تصميم احترافي

2. **واجهة المستخدم:**
   - ✅ زر "ترقية إلى نائب" موجود لكل مستخدم
   - ✅ البحث عن المستخدمين يعمل
   - ✅ الجدول منظم

### ❌ ما لا يعمل:

1. **زر "تأكيد الترقية" لا يستجيب:**
   - ❌ عند الضغط على "تأكيد الترقية"، لا يحدث شيء
   - ❌ Dialog لا يُغلق
   - ❌ لا توجد رسالة نجاح أو خطأ
   - ❌ لا يتم تحديث الصفحة

2. **الأزرار مقطوعة في الجدول:**
   - ⚠️ عمود "Promote to Deputy" مقطوع قليلاً
   - ⚠️ يحتاج scroll أفقي لرؤية الأزرار بالكامل

---

## السبب الجذري

### المشكلة الرئيسية: التعديلات لم تُنشر على Vercel

**التحليل:**
1. قمنا بتعديل الكود في GitHub
2. رفعنا 3 commits:
   - `ddb834c` - إصلاح Dialog والـ scroll
   - `c9c55fc` - إصلاح خطأ app_admins
   - `4f8eb00` - إزالة البحث غير الضروري

3. **لكن** Vercel لم ينشر التعديلات بعد
4. الموقع المباشر لا يزال يستخدم الكود القديم

**الدليل:**
- Dialog يظهر (هذا من الكود القديم الذي أضفناه في commit سابق)
- لكن زر "تأكيد الترقية" لا يعمل (لأن الكود الجديد غير موجود)

---

## الحل المطلوب

### الخيار 1: انتظار النشر التلقائي (موصى به)

Vercel عادة ينشر تلقائياً عند push إلى GitHub، لكن قد يستغرق:
- 2-5 دقائق للبناء
- 1-2 دقيقة للنشر

**الخطوات:**
1. انتظر 5-10 دقائق
2. افتح https://naebak.com/ar/app_admin/users
3. اضغط Ctrl+Shift+R (hard refresh) لتحديث الكاش
4. جرب الترقية مرة أخرى

### الخيار 2: نشر يدوي من Vercel Dashboard

**الخطوات:**
1. افتح https://vercel.com/naebaks-projects/naebak-xx
2. سجل دخول
3. اضغط على "Deployments"
4. تحقق من آخر deployment:
   - إذا كان "Building" → انتظر
   - إذا كان "Ready" → تحقق من التاريخ (يجب أن يكون بعد آخر commit)
   - إذا لم يكن هناك deployment جديد → اضغط "Redeploy"

### الخيار 3: التحقق من Environment Variables

**مهم جداً:**
يجب التأكد من وجود `SUPABASE_SERVICE_ROLE_KEY` في Vercel:

1. افتح Vercel Dashboard
2. Settings > Environment Variables
3. تحقق من وجود:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **هذا مهم!**

إذا لم يكن موجوداً:
1. احصل عليه من Supabase Dashboard > Project Settings > API > service_role
2. أضفه في Vercel
3. Redeploy المشروع

---

## اختبار الكود محلياً (للتأكد من صحته)

يمكن اختبار الكود محلياً للتأكد من أنه يعمل قبل النشر:

```bash
# 1. Clone المشروع
git clone https://github.com/egyptofrance/naebak-xx.git
cd naebak-xx

# 2. تثبيت الـ dependencies
pnpm install

# 3. إنشاء .env.local
cp .env.local.example .env.local

# 4. إضافة المتغيرات في .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://fvpwvnghkkhrzupglsrh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[احصل عليه من Supabase]

# 5. تشغيل المشروع
pnpm dev

# 6. افتح http://localhost:3000
# 7. جرب الترقية
```

---

## التحقق من نجاح الترقية

بعد نشر التعديلات، يجب اختبار:

### 1. اختبار Dialog:
- ✅ يظهر عند الضغط على "ترقية إلى نائب"
- ✅ يعرض اسم المستخدم
- ✅ زر "إلغاء" يغلق الـ dialog
- ✅ زر "تأكيد الترقية" يبدأ العملية

### 2. اختبار Loading State:
- ✅ عند الضغط على "تأكيد الترقية":
  - يتغير النص إلى "جاري الترقية..."
  - يظهر spinner
  - الأزرار معطلة

### 3. اختبار النجاح:
- ✅ بعد اكتمال العملية:
  - رسالة نجاح: "تم ترقية المستخدم إلى نائب بنجاح"
  - Dialog يُغلق
  - الصفحة تتحدث تلقائياً

### 4. اختبار قاعدة البيانات:
افتح Supabase Dashboard وتحقق من:

**في جدول `user_roles`:**
```sql
SELECT * FROM user_roles 
WHERE user_id = '[user_id]' AND role = 'deputy';
```
يجب أن يظهر سجل جديد.

**في جدول `deputy_profiles`:**
```sql
SELECT * FROM deputy_profiles 
WHERE user_id = '[user_id]';
```
يجب أن يظهر ملف جديد بحالة 'active'.

### 5. اختبار صفحة النواب:
- اذهب إلى https://naebak.com/ar/app_admin/deputies
- يجب أن يظهر النائب الجديد في القائمة

### 6. اختبار صفحة تعديل النائب:
- اضغط على "تعديل" للنائب الجديد
- يجب أن تفتح صفحة التعديل
- يجب أن تظهر جميع الحقول:
  - الرمز الانتخابي
  - الرقم الانتخابي
  - البرنامج الانتخابي
  - الإنجازات
  - المناسبات
  - المجلس
  - الحالة

---

## المشاكل المحتملة وحلولها

### المشكلة 1: "خطأ في قاعدة البيانات: app_admins does not exist"

**السبب:** `SUPABASE_SERVICE_ROLE_KEY` غير موجود في environment variables

**الحل:**
1. افتح Supabase Dashboard
2. Project Settings > API
3. انسخ service_role key
4. أضفه في Vercel > Settings > Environment Variables
5. Redeploy

### المشكلة 2: "هذا المستخدم نائب بالفعل"

**السبب:** المستخدم تمت ترقيته مسبقاً

**الحل:**
1. افتح Supabase Dashboard
2. Table Editor > deputy_profiles
3. احذف السجل الخاص بهذا المستخدم
4. Table Editor > user_roles
5. احذف السجل بـ role = 'deputy' لهذا المستخدم
6. جرب مرة أخرى

### المشكلة 3: الزر لا يستجيب

**السبب:** JavaScript error أو الكود لم يُنشر

**الحل:**
1. افتح Console (F12)
2. ابحث عن أخطاء JavaScript
3. تأكد من أن الكود منشور (تحقق من تاريخ آخر deployment)
4. جرب Hard Refresh (Ctrl+Shift+R)

### المشكلة 4: الأزرار مقطوعة

**السبب:** الجدول عريض جداً

**الحل:** تم إضافة `overflow-x-auto` في commit `ddb834c`
- تأكد من نشر التعديلات
- يجب أن يظهر scroll أفقي تلقائياً

---

## الخلاصة

### الوضع الحالي:

✅ **الكود صحيح ومكتمل:**
- Dialog احترافي
- معالجة أخطاء محسّنة
- Service Role Client للتجاوز RLS
- إزالة البحث غير الضروري

❌ **لكن لم يُنشر بعد:**
- التعديلات في GitHub فقط
- Vercel لم ينشرها على الموقع المباشر
- يحتاج نشر يدوي أو انتظار النشر التلقائي

### الخطوات التالية:

1. **تحقق من Environment Variables:**
   - `SUPABASE_SERVICE_ROLE_KEY` موجود؟

2. **انتظر النشر أو قم بـ Redeploy:**
   - تحقق من Vercel Deployments
   - إذا لم يكن هناك deployment جديد → Redeploy

3. **اختبر مرة أخرى:**
   - افتح الموقع
   - Hard Refresh (Ctrl+Shift+R)
   - جرب الترقية

4. **تحقق من النجاح:**
   - رسالة نجاح تظهر
   - النائب يظهر في قائمة النواب
   - يمكن تعديل ملفه

---

## الملفات المعدلة

### 1. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/PromoteToDeputyDialog.tsx`
- مكون Dialog احترافي جديد
- يحل محل window.confirm

### 2. `src/app/[locale]/(dynamic-pages)/(authenticated-pages)/app_admin/(admin-pages)/users/UsersList.tsx`
- استخدام PromoteToDeputyDialog
- إضافة overflow-x-auto للـ scroll

### 3. `src/data/admin/deputies.ts`
- استخدام Service Role Client
- إزالة البحث غير الضروري
- رسائل خطأ بالعربية
- Logging شامل

---

**تاريخ الاختبار:** 20 أكتوبر 2025  
**الحالة:** في انتظار النشر على Vercel  
**الكود:** جاهز ومكتمل ✅  
**النشر:** معلق ⏳

