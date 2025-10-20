# دليل المتغيرات البيئية (Environment Variables)

## التاريخ
20 أكتوبر 2025

---

## المتغيرات المطلوبة لـ Vercel

هذه هي المتغيرات التي يجب إضافتها في **Vercel Dashboard** > **Settings** > **Environment Variables**:

---

## 1. Supabase (قاعدة البيانات) ⚠️ **مطلوب**

### `NEXT_PUBLIC_SUPABASE_URL`
- **الوصف:** رابط مشروع Supabase
- **كيفية الحصول عليه:**
  1. افتح [Supabase Dashboard](https://app.supabase.com)
  2. اختر مشروعك
  3. Settings > API
  4. انسخ **Project URL**
- **مثال:** `https://fvpwvnghkkhrzupglsrh.supabase.co`
- **ملاحظة:** يبدأ بـ `NEXT_PUBLIC_` لأنه متاح للعميل (client-side)

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **الوصف:** مفتاح Supabase العام (للعميل)
- **كيفية الحصول عليه:**
  1. نفس الصفحة (Settings > API)
  2. انسخ **anon public** key
- **مثال:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **ملاحظة:** آمن للاستخدام في المتصفح

### `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **مهم جداً!**
- **الوصف:** مفتاح Supabase بصلاحيات كاملة (للسيرفر فقط)
- **كيفية الحصول عليه:**
  1. نفس الصفحة (Settings > API)
  2. انسخ **service_role** key
- **مثال:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **⚠️ تحذير:** 
  - هذا المفتاح **سري جداً**
  - له صلاحيات كاملة على قاعدة البيانات
  - لا تشاركه مع أحد
  - يُستخدم فقط في server-side code
- **لماذا نحتاجه:** لحل مشكلة "app_admins does not exist" عند ترقية المستخدمين

---

## 2. Stripe (الدفع) - اختياري

### `STRIPE_SECRET_KEY`
- **الوصف:** مفتاح Stripe السري
- **كيفية الحصول عليه:**
  1. افتح [Stripe Dashboard](https://dashboard.stripe.com)
  2. Developers > API keys
  3. انسخ **Secret key**
- **ملاحظة:** اختياري إذا لم تستخدم نظام الدفع

### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **الوصف:** مفتاح Stripe العام
- **كيفية الحصول عليه:**
  1. نفس الصفحة
  2. انسخ **Publishable key**

### `STRIPE_WEBHOOK_SECRET`
- **الوصف:** سر webhook لـ Stripe
- **كيفية الحصول عليه:**
  1. Developers > Webhooks
  2. أضف endpoint
  3. انسخ **Signing secret**

---

## 3. الموقع (Host)

### `NEXT_PUBLIC_SITE_URL`
- **الوصف:** رابط الموقع الأساسي
- **القيمة:** `https://naebak.com`
- **ملاحظة:** بدون `/` في النهاية

---

## 4. البريد الإلكتروني (Email)

### `ADMIN_EMAIL`
- **الوصف:** بريد المدير
- **القيمة:** `alcounsol@gmail.com` (أو أي بريد تريده)

### `RESEND_API_KEY`
- **الوصف:** مفتاح Resend لإرسال الإيميلات
- **كيفية الحصول عليه:**
  1. افتح [Resend Dashboard](https://resend.com)
  2. API Keys
  3. أنشئ مفتاح جديد
- **ملاحظة:** اختياري إذا لم تستخدم إرسال الإيميلات

---

## 5. التحليلات (Analytics) - اختياري

### PostHog (اختياري)
- `NEXT_PUBLIC_POSTHOG_API_KEY`
- `NEXT_PUBLIC_POSTHOG_APP_ID`
- `NEXT_PUBLIC_POSTHOG_HOST`

### Google Analytics (اختياري)
- `NEXT_PUBLIC_GA_ID`

### Unkey (اختياري)
- `UNKEY_ROOT_KEY`
- `UNKEY_API_ID`

---

## 6. تسجيل الدخول بوسائل التواصل (OAuth) - اختياري

### Twitter/X
- `TWITTER_API_KEY`
- `TWITTER_API_SECRET`

### Google
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### GitHub
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

---

## الملخص: المتغيرات المطلوبة حالياً

### ✅ **مطلوب للعمل الأساسي:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://fvpwvnghkkhrzupglsrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[احصل عليه من Supabase]
SUPABASE_SERVICE_ROLE_KEY=[احصل عليه من Supabase] ⚠️ مهم!

# الموقع
NEXT_PUBLIC_SITE_URL=https://naebak.com

# البريد
ADMIN_EMAIL=alcounsol@gmail.com
```

### ⚠️ **مطلوب لترقية النواب:**
```env
SUPABASE_SERVICE_ROLE_KEY=[احصل عليه من Supabase]
```
**بدون هذا المتغير، ستحصل على خطأ "app_admins does not exist"**

---

## كيفية إضافة المتغيرات في Vercel

### الخطوات:

1. **افتح Vercel Dashboard:**
   - اذهب إلى: https://vercel.com/naebaks-projects/naebak-xx

2. **اذهب إلى Settings:**
   - اضغط على "Settings" في القائمة العلوية

3. **افتح Environment Variables:**
   - اضغط على "Environment Variables" في القائمة الجانبية

4. **أضف متغير جديد:**
   - اضغط على "Add New"
   - **Name:** اسم المتغير (مثل: `SUPABASE_SERVICE_ROLE_KEY`)
   - **Value:** القيمة (المفتاح من Supabase)
   - **Environment:** اختر:
     - ✅ Production
     - ✅ Preview (اختياري)
     - ✅ Development (اختياري)

5. **احفظ:**
   - اضغط "Save"

6. **كرر للمتغيرات الأخرى**

7. **Redeploy المشروع:**
   - اذهب إلى "Deployments"
   - اضغط على آخر deployment
   - اضغط "Redeploy"
   - انتظر اكتمال البناء

---

## كيفية الحصول على `SUPABASE_SERVICE_ROLE_KEY`

### الخطوات التفصيلية:

1. **افتح Supabase Dashboard:**
   - اذهب إلى: https://app.supabase.com

2. **اختر مشروعك:**
   - اضغط على مشروع "naebak" (أو اسم مشروعك)

3. **اذهب إلى Settings:**
   - اضغط على أيقونة الترس (⚙️) في القائمة الجانبية

4. **افتح API:**
   - اضغط على "API" في القائمة الجانبية

5. **انسخ service_role key:**
   - ابحث عن قسم "Project API keys"
   - ستجد:
     - `anon` `public` - هذا للعميل ✅
     - `service_role` `secret` - **هذا ما نحتاجه!** ⚠️
   - اضغط على أيقونة النسخ بجانب `service_role`

6. **أضفه في Vercel:**
   - الصق المفتاح في Vercel Environment Variables
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [المفتاح الذي نسخته]

---

## التحقق من المتغيرات

### في Vercel:

1. افتح Settings > Environment Variables
2. تأكد من وجود:
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` ⚠️
   - ✅ `NEXT_PUBLIC_SITE_URL`

### في Supabase:

1. افتح Settings > API
2. تأكد من أن:
   - Project URL يطابق `NEXT_PUBLIC_SUPABASE_URL`
   - anon key يطابق `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key يطابق `SUPABASE_SERVICE_ROLE_KEY`

---

## الأخطاء الشائعة

### 1. "app_admins does not exist"
**السبب:** `SUPABASE_SERVICE_ROLE_KEY` غير موجود أو خاطئ

**الحل:**
1. تحقق من وجود المتغير في Vercel
2. تأكد من أنه service_role وليس anon
3. Redeploy المشروع

### 2. "Invalid API key"
**السبب:** المفتاح خاطئ أو منتهي الصلاحية

**الحل:**
1. احصل على مفتاح جديد من Supabase
2. حدّث القيمة في Vercel
3. Redeploy

### 3. "CORS error"
**السبب:** `NEXT_PUBLIC_SITE_URL` خاطئ

**الحل:**
1. تأكد من أن القيمة `https://naebak.com` (بدون `/`)
2. تأكد من إضافة الدومين في Supabase > Authentication > URL Configuration

---

## قائمة التحقق النهائية

قبل الاختبار، تأكد من:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` موجود في Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` موجود في Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` موجود في Vercel ⚠️
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://naebak.com`
- [ ] جميع المفاتيح صحيحة (من Supabase Dashboard)
- [ ] تم عمل Redeploy بعد إضافة المتغيرات
- [ ] Deployment اكتمل بنجاح (Status: Ready)
- [ ] تم عمل Hard Refresh (Ctrl+Shift+R) في المتصفح

---

## بعد إضافة المتغيرات

### اختبر الترقية:

1. افتح https://naebak.com/ar/app_admin/users
2. اضغط Ctrl+Shift+R (Hard Refresh)
3. ابحث عن مستخدم
4. اضغط "ترقية إلى نائب"
5. اضغط "تأكيد الترقية"

**المتوقع:**
- ✅ "جاري الترقية..." مع spinner
- ✅ "تم ترقية المستخدم إلى نائب بنجاح"
- ✅ Dialog يُغلق
- ✅ الصفحة تتحدث
- ✅ **بدون خطأ "app_admins does not exist"**

---

**تاريخ التوثيق:** 20 أكتوبر 2025  
**الحالة:** موثق بالكامل ✅

