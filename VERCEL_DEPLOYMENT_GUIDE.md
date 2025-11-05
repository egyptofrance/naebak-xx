# دليل النشر على Vercel - مشروع naebak-xx

## نظرة عامة

هذا المشروع مبني باستخدام Next.js 15 ومتصل بـ Supabase. عند الدفع (push) إلى GitHub، سيتم النشر تلقائياً على Vercel.

## الخطوات المطلوبة قبل النشر

### 1. إعداد متغيرات البيئة على Vercel

يجب إضافة المتغيرات التالية في لوحة تحكم Vercel:

#### متغيرات Supabase الأساسية (مطلوبة)

```
NEXT_PUBLIC_SUPABASE_URL=https://fvpwvnghkkhrzupglsrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[احصل عليه من لوحة تحكم Supabase]
SUPABASE_SERVICE_ROLE_KEY=[احصل عليه من لوحة تحكم Supabase - سري!]
SUPABASE_PROJECT_REF=fvpwvnghkkhrzupglsrh
```

#### متغيرات الموقع (مطلوبة)

```
NEXT_PUBLIC_SITE_URL=https://naebak-xx.vercel.app
ADMIN_EMAIL=admin@naebak-xx.com
```

#### متغيرات اختيارية (حسب الحاجة)

**البريد الإلكتروني (Resend)**
```
RESEND_API_KEY=your_resend_api_key
```

**Stripe للمدفوعات**
```
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

**التحليلات (PostHog & Google Analytics)**
```
NEXT_PUBLIC_POSTHOG_API_KEY=your_posthog_api_key
NEXT_PUBLIC_POSTHOG_APP_ID=your_posthog_app_id
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
NEXT_PUBLIC_GA_ID=your_ga_id
```

**OAuth Providers**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 2. الحصول على مفاتيح Supabase الصحيحة

⚠️ **مهم جداً**: الرمز المميز الحالي ليس المفتاح الصحيح!

للحصول على المفاتيح الصحيحة:

1. اذهب إلى: https://supabase.com/dashboard/project/fvpwvnghkkhrzupglsrh
2. من القائمة الجانبية، اختر **Settings** > **API**
3. ستجد:
   - **Project URL**: انسخه إلى `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys**:
     - **anon public**: انسخه إلى `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role**: انسخه إلى `SUPABASE_SERVICE_ROLE_KEY` (⚠️ لا تشاركه أبداً!)

### 3. إعداد قاعدة البيانات

المشروع يحتوي على ملفات SQL للهجرة (migrations) في:
- `supabase/migrations/` - الهجرات الأساسية
- ملفات SQL في الجذر - تحديثات إضافية

**تنفيذ الهجرات:**

```bash
# إذا كنت تستخدم Supabase CLI
supabase db push

# أو قم بتنفيذ الملفات يدوياً من لوحة تحكم Supabase
# SQL Editor > New Query > الصق محتوى الملف > Run
```

### 4. إعداد المصادقة على Supabase

في لوحة تحكم Supabase:

1. اذهب إلى **Authentication** > **URL Configuration**
2. أضف الروابط التالية في **Redirect URLs**:
   ```
   https://naebak-xx.vercel.app/auth/callback
   https://naebak-xx.vercel.app/auth/confirm
   https://naebak-xx.vercel.app/auth/magiclink
   https://naebak-xx.vercel.app/auth/recovery
   ```

3. في **Site URL**، ضع:
   ```
   https://naebak-xx.vercel.app
   ```

### 5. النشر على Vercel

#### الطريقة الأولى: من لوحة تحكم Vercel

1. اذهب إلى: https://vercel.com/new
2. اختر مستودع GitHub: `egyptofrance/naebak-xx`
3. أضف جميع متغيرات البيئة المذكورة أعلاه
4. اضغط على **Deploy**

#### الطريقة الثانية: النشر التلقائي (إذا كان المشروع مرتبطاً بالفعل)

ببساطة قم بالدفع إلى GitHub:

```bash
git add .
git commit -m "تحديث الإعدادات"
git push origin main
```

سيتم النشر تلقائياً على Vercel!

## التحقق من النشر

بعد النشر، تحقق من:

1. ✅ الموقع يعمل: https://naebak-xx.vercel.app
2. ✅ الاتصال بـ Supabase يعمل (جرب تسجيل الدخول)
3. ✅ لا توجد أخطاء في Console (F12)
4. ✅ البيانات تُحمل بشكل صحيح

## استكشاف الأخطاء

### خطأ: "Invalid API key"
- تأكد من أنك استخدمت المفاتيح الصحيحة من لوحة تحكم Supabase
- تأكد من أن المفاتيح مضافة في Vercel Environment Variables

### خطأ: "CORS error"
- تأكد من إضافة روابط Redirect URLs في إعدادات Supabase Authentication

### خطأ: "Database connection failed"
- تأكد من أن قاعدة البيانات نشطة على Supabase
- تأكد من تنفيذ جميع ملفات الهجرة (migrations)

### البناء يفشل على Vercel
- تحقق من Logs في Vercel Dashboard
- تأكد من أن جميع التبعيات موجودة في `package.json`
- تأكد من أن إصدار Node.js صحيح (>= 20.0.0)

## الأوامر المفيدة

```bash
# تشغيل محلياً
pnpm dev

# بناء المشروع
pnpm build

# تشغيل النسخة المبنية
pnpm start

# فحص الأخطاء
pnpm lint

# توليد أنواع TypeScript من Supabase
pnpm generate:types
```

## الموارد

- [توثيق Vercel](https://vercel.com/docs)
- [توثيق Next.js](https://nextjs.org/docs)
- [توثيق Supabase](https://supabase.com/docs)
- [توثيق Nextbase](https://usenextbase.com/docs)

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من Logs في Vercel Dashboard
2. تحقق من Logs في Supabase Dashboard
3. راجع ملف `TROUBLESHOOTING.md` في المشروع
