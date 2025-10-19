# بنية قاعدة البيانات - نظام نائبك

## الجداول الرئيسية

### 1. user_profiles
جدول المستخدمين الرئيسي

**الحقول:**
- `id` (uuid) - المعرف الفريد
- `full_name` (varchar) - الاسم الكامل
- `email` (text) - البريد الإلكتروني
- `phone` (text) - رقم الهاتف
- `governorate_id` (uuid) - معرف المحافظة (FK → governorates)
- `party_id` (uuid) - معرف الحزب (FK → parties)
- `city` (varchar) - المدينة
- `district` (varchar) - المنطقة
- `village` (varchar) - القرية
- `electoral_district` (varchar) - الدائرة الانتخابية
- `job_title` (varchar) - المسمى الوظيفي
- `address` (text) - العنوان
- `role` (varchar) - الدور (default: 'citizen')
- `gender` (text) - الجنس
- `avatar_url` (varchar) - رابط الصورة الشخصية
- `created_at` (timestamptz) - تاريخ الإنشاء

**العلاقات:**
- ← `governorates.id` (SET NULL on delete)
- ← `parties.id` (SET NULL on delete)
- → `user_settings.id` (CASCADE on delete)
- → `user_application_settings.id` (CASCADE on delete)
- → `user_roles.user_id` (CASCADE on delete)
- → `deputy_profiles.user_id`

---

### 2. deputy_profiles
جدول ملفات النواب

**الحقول:**
- `id` (uuid) - المعرف الفريد
- `user_id` (uuid) - معرف المستخدم (FK → user_profiles)
- `deputy_status` (enum) - حالة النائب (active/inactive)
- `council_id` (uuid) - معرف المجلس (FK → councils)
- `bio` (text) - السيرة الذاتية
- `office_address` (text) - عنوان المكتب
- `office_phone` (varchar) - هاتف المكتب
- `office_hours` (varchar) - ساعات العمل
- `electoral_symbol` (varchar) - الرمز الانتخابي
- `electoral_number` (varchar) - الرقم الانتخابي
- `electoral_program` (text) - البرنامج الانتخابي
- `achievements` (text) - الإنجازات
- `events` (text) - الفعاليات
- `social_media_facebook` (varchar) - فيسبوك
- `social_media_twitter` (varchar) - تويتر
- `social_media_instagram` (varchar) - إنستجرام
- `social_media_youtube` (varchar) - يوتيوب
- `website_url` (varchar) - الموقع الإلكتروني
- `initial_rating_count` (int) - عدد التقييمات الأولية
- `initial_rating_average` (numeric) - متوسط التقييم الأولي
- `created_at` (timestamptz) - تاريخ الإنشاء
- `updated_at` (timestamptz) - تاريخ التحديث

**العلاقات:**
- ← `user_profiles.id` (FK)
- ← `councils.id` (FK)
- → `ratings.deputy_id` (CASCADE on delete)
- → `events.deputy_id` (CASCADE on delete)
- → `deputy_achievements.deputy_id` (CASCADE on delete)
- → `deputy_events.deputy_id` (CASCADE on delete)

---

### 3. governorates
جدول المحافظات

**الحقول:**
- `id` (uuid) - المعرف الفريد
- `name_ar` (varchar) - الاسم بالعربية
- `name_en` (varchar) - الاسم بالإنجليزية
- `code` (varchar) - الكود
- `created_at` (timestamptz) - تاريخ الإنشاء

**العلاقات:**
- → `user_profiles.governorate_id`

---

### 4. parties
جدول الأحزاب

**الحقول:**
- `id` (uuid) - المعرف الفريد
- `name_ar` (varchar) - الاسم بالعربية
- `name_en` (varchar) - الاسم بالإنجليزية
- `abbreviation` (varchar) - الاختصار
- `description` (text) - الوصف
- `logo_url` (varchar) - رابط الشعار
- `website_url` (varchar) - الموقع الإلكتروني
- `is_active` (boolean) - نشط (default: true)
- `display_order` (int) - ترتيب العرض (default: 999)
- `created_at` (timestamptz) - تاريخ الإنشاء

**العلاقات:**
- → `user_profiles.party_id`

---

### 5. councils
جدول المجالس

**الحقول:**
- `id` (uuid) - المعرف الفريد
- `name_ar` (varchar) - الاسم بالعربية
- `name_en` (varchar) - الاسم بالإنجليزية
- `code` (varchar) - الكود
- `description_ar` (text) - الوصف بالعربية
- `description_en` (text) - الوصف بالإنجليزية
- `is_active` (boolean) - نشط (default: true)
- `display_order` (int) - ترتيب العرض (default: 0)
- `created_at` (timestamptz) - تاريخ الإنشاء
- `updated_at` (timestamptz) - تاريخ التحديث

**العلاقات:**
- → `deputy_profiles.council_id`

---

### 6. user_roles
جدول أدوار المستخدمين

**الحقول:**
- `id` (uuid) - المعرف الفريد
- `user_id` (uuid) - معرف المستخدم (FK → user_profiles)
- `role` (enum) - الدور (admin, user, etc.)

**العلاقات:**
- ← `user_profiles.id` (CASCADE on delete)

---

## العلاقات الرئيسية

```
user_profiles
  ├── governorate_id → governorates.id
  ├── party_id → parties.id
  └── id ← deputy_profiles.user_id

deputy_profiles
  ├── user_id → user_profiles.id
  └── council_id → councils.id
```

---

## الحقول المتاحة للبحث والفلترة

### في user_profiles:
1. **البحث النصي:**
   - full_name (الاسم الكامل)
   - email (البريد الإلكتروني)
   - phone (رقم الهاتف)
   - city (المدينة)
   - district (المنطقة)
   - village (القرية)
   - electoral_district (الدائرة الانتخابية)

2. **الفلترة:**
   - governorate_id (المحافظة) - مع join لـ governorates
   - party_id (الحزب) - مع join لـ parties
   - role (الدور)
   - gender (الجنس)

### في deputy_profiles:
1. **البحث النصي:**
   - عبر user_profiles (الاسم، البريد، الهاتف)
   - electoral_symbol (الرمز الانتخابي)
   - electoral_number (الرقم الانتخابي)

2. **الفلترة:**
   - deputy_status (حالة النائب)
   - council_id (المجلس) - مع join لـ councils
   - عبر user_profiles:
     - governorate_id (المحافظة)
     - party_id (الحزب)

---

## ملاحظات مهمة

1. **العلاقات موجودة وصحيحة** في قاعدة البيانات
2. يمكن استخدام **Supabase joins** بشكل آمن
3. جميع العلاقات تستخدم **UUID** كمفاتيح أساسية
4. العلاقات مع governorates و parties تستخدم **SET NULL** عند الحذف
5. العلاقات مع deputy_profiles تستخدم **CASCADE** عند الحذف

