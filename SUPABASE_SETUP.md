# إعدادات Supabase للمشروع naebak-xx

## معلومات المشروع

- **اسم المشروع**: naebak-xx
- **معرف المشروع**: fvpwvnghkkhrzupglsrh
- **رابط Supabase**: https://fvpwvnghkkhrzupglsrh.supabase.co

## متغيرات البيئة المطلوبة

تم إنشاء ملف `.env.local` بالإعدادات التالية:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fvpwvnghkkhrzupglsrh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sbp_6d8bac35adfa6042736de8efa3e9d71e9edd4545
SUPABASE_SERVICE_ROLE_KEY=sbp_6d8bac35adfa6042736de8efa3e9d71e9edd4545
SUPABASE_PROJECT_REF=fvpwvnghkkhrzupglsrh
```

## إعداد Vercel

لضمان عمل المشروع بشكل صحيح على Vercel، يجب إضافة المتغيرات التالية في إعدادات Vercel:

### الخطوات:

1. افتح مشروعك على Vercel: https://vercel.com/dashboard
2. اذهب إلى **Settings** > **Environment Variables**
3. أضف المتغيرات التالية:

| المتغير | القيمة |
|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fvpwvnghkkhrzupglsrh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sbp_6d8bac35adfa6042736de8efa3e9d71e9edd4545` |
| `SUPABASE_SERVICE_ROLE_KEY` | `sbp_6d8bac35adfa6042736de8efa3e9d71e9edd4545` |
| `SUPABASE_PROJECT_REF` | `fvpwvnghkkhrzupglsrh` |
| `NEXT_PUBLIC_SITE_URL` | `https://naebak-xx.vercel.app` (أو رابط النطاق الخاص بك) |

4. احفظ التغييرات

## ملاحظات مهمة

### 🔒 الأمان

**تحذير**: الرمز المميز المستخدم حالياً (`sbp_6d8bac35adfa6042736de8efa3e9d71e9edd4545`) يبدو أنه رمز وصول عام (Access Token) وليس المفاتيح الصحيحة.

للحصول على المفاتيح الصحيحة من Supabase:

1. اذهب إلى لوحة تحكم Supabase: https://supabase.com/dashboard/project/fvpwvnghkkhrzupglsrh
2. اذهب إلى **Settings** > **API**
3. ستجد:
   - **Project URL**: استخدمه في `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: استخدمه في `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key**: استخدمه في `SUPABASE_SERVICE_ROLE_KEY` (احتفظ به سرياً!)

### 🚀 النشر التلقائي

المشروع مرتبط بـ Vercel للنشر التلقائي. عند الدفع (push) إلى GitHub:
- سيتم بناء المشروع تلقائياً على Vercel
- سيتم نشر التحديثات على الرابط المباشر

### 📝 التطوير المحلي

لتشغيل المشروع محلياً:

```bash
# تثبيت التبعيات
pnpm install

# تشغيل خادم التطوير
pnpm dev
```

سيعمل المشروع على: http://localhost:3000

## قاعدة البيانات

يحتوي المشروع على العديد من ملفات SQL للهجرة (migration):
- `supabase_create_jobs_table.sql`
- `supabase_job_categories_migration.sql`
- `VOTING_SYSTEM_MIGRATION.sql`
- وغيرها...

تأكد من تنفيذ هذه الملفات على قاعدة بيانات Supabase الخاصة بك إذا لم يتم ذلك بعد.

## الدعم

للمزيد من المعلومات، راجع:
- [توثيق Nextbase](https://usenextbase.com/docs)
- [توثيق Supabase](https://supabase.com/docs)
- [توثيق Vercel](https://vercel.com/docs)
