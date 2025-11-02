# إعداد Supabase للمشروع naebak-xx

## معلومات المشروع

تم إعداد مشروع **naebak-xx** بنجاح للعمل مع قاعدة بيانات Supabase.

### تفاصيل المشروع

- **اسم المشروع**: naebak-xx
- **معرف المشروع**: fvpwvnghkkhrzupglsrh
- **رابط Supabase**: https://fvpwvnghkkhrzupglsrh.supabase.co

## الملفات التي تم إنشاؤها

تم إنشاء ملف `.env.local` في جذر المشروع يحتوي على جميع متغيرات البيئة اللازمة للاتصال بـ Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`: رابط مشروع Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: المفتاح العام للوصول
- `SUPABASE_SERVICE_ROLE_KEY`: مفتاح دور الخدمة (للعمليات من جانب الخادم)
- `SUPABASE_JWT_SECRET`: سر JWT للمصادقة

## الخطوات التالية

### 1. تثبيت الحزم

قبل تشغيل المشروع، تحتاج إلى تثبيت جميع الحزم المطلوبة:

```bash
cd /home/ubuntu/naebak-xx
pnpm install
```

### 2. تشغيل المشروع محلياً

بعد تثبيت الحزم، يمكنك تشغيل المشروع:

```bash
pnpm dev
```

سيعمل المشروع على `http://localhost:3000`

### 3. إعداد قاعدة البيانات

إذا كانت هذه هي المرة الأولى التي تقوم فيها بإعداد المشروع، قد تحتاج إلى:

1. تشغيل ملفات SQL الموجودة في المشروع لإنشاء الجداول والوظائف
2. التحقق من سياسات Row Level Security (RLS)
3. إعداد المصادقة (Authentication) في لوحة تحكم Supabase

### 4. الملفات الهامة في المشروع

المشروع يحتوي على عدة ملفات SQL مهمة:

- `RLS_POLICIES_FOR_COMPLAINTS.sql`: سياسات الأمان للشكاوى
- `VOTING_SYSTEM_MIGRATION.sql`: نظام التصويت
- `upvoting_migration_v2.sql`: تحديثات نظام التصويت

### 5. الأمان

⚠️ **تنبيه أمني مهم**:

- ملف `.env.local` يحتوي على معلومات حساسة
- تم إضافة `.env.local` إلى `.gitignore` لمنع رفعه إلى GitHub
- لا تشارك المفاتيح السرية مع أحد
- استخدم `SUPABASE_SERVICE_ROLE_KEY` فقط في العمليات من جانب الخادم

## معلومات إضافية

### نوع المشروع

هذا المشروع مبني على:
- **Next.js** (إطار عمل React)
- **Supabase** (قاعدة بيانات وخدمات الباك إند)
- **TypeScript** (للكتابة الآمنة)
- **Tailwind CSS** (للتصميم)

### الوثائق

للمزيد من المعلومات، راجع:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project Documentation](https://usenextbase.com/docs)

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من ملف `TROUBLESHOOTING.md`
2. راجع ملفات التوثيق الأخرى في المشروع
3. تأكد من صحة متغيرات البيئة في `.env.local`

---

**تاريخ الإعداد**: 2 نوفمبر 2025
**الحالة**: ✅ جاهز للاستخدام
