# 📝 دليل تطبيق Migration يدوياً

## 🎯 الهدف
تطبيق migration نظام التصويت (Upvoting) على قاعدة بيانات Supabase

---

## 📋 الخطوات

### 1️⃣ فتح Supabase Dashboard
1. اذهب إلى: https://supabase.com/dashboard
2. اختر مشروعك: **naebak-xx**
3. من القائمة الجانبية، اختر **SQL Editor**

### 2️⃣ نسخ Migration SQL
افتح الملف: `supabase/migrations/20251101000000_add_upvoting_system.sql`

### 3️⃣ تنفيذ Migration
1. في SQL Editor، اضغط **New query**
2. الصق محتوى الملف كاملاً
3. اضغط **Run** (أو Ctrl+Enter)

### 4️⃣ التحقق من النجاح
يجب أن ترى رسالة:
```
Upvoting system migration completed successfully!
Tables created: complaint_votes
Columns added: public_complaints.votes_count
Triggers created: trigger_update_complaint_votes_count
```

---

## ✅ التحقق من الجداول

### التحقق من جدول `complaint_votes`:
```sql
SELECT * FROM complaint_votes LIMIT 1;
```

### التحقق من عمود `votes_count`:
```sql
SELECT id, title, votes_count FROM public_complaints LIMIT 5;
```

### التحقق من الـ Trigger:
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_complaint_votes_count';
```

---

## 🧪 اختبار Migration

### اختبار 1: إضافة vote
```sql
-- Insert a test vote
INSERT INTO complaint_votes (complaint_id, user_id)
VALUES (
  (SELECT id FROM public_complaints LIMIT 1),
  auth.uid()
);

-- Check if votes_count increased
SELECT id, title, votes_count FROM public_complaints LIMIT 1;
```

### اختبار 2: حذف vote
```sql
-- Delete the test vote
DELETE FROM complaint_votes WHERE id = (SELECT id FROM complaint_votes LIMIT 1);

-- Check if votes_count decreased
SELECT id, title, votes_count FROM public_complaints LIMIT 1;
```

---

## ⚠️ ملاحظات مهمة

1. **Backup:** تأكد من عمل backup قبل تطبيق Migration
2. **Production:** إذا كان الموقع live، اختر وقت منخفض الحركة
3. **Testing:** اختبر على staging environment أولاً إن أمكن
4. **Rollback:** احتفظ بنسخة من الـ SQL للـ rollback إذا لزم الأمر

---

## 🔄 Rollback (في حالة الحاجة)

```sql
-- Drop trigger
DROP TRIGGER IF EXISTS trigger_update_complaint_votes_count ON complaint_votes;

-- Drop function
DROP FUNCTION IF EXISTS update_complaint_votes_count();

-- Drop table
DROP TABLE IF EXISTS complaint_votes;

-- Remove column
ALTER TABLE public_complaints DROP COLUMN IF EXISTS votes_count;
```

---

## 📞 المساعدة

إذا واجهت أي مشاكل:
1. تحقق من error logs في Supabase Dashboard
2. تأكد من أن جدول `public_complaints` موجود
3. تأكد من أن `uuid_generate_v4()` extension مفعلة

---

**آخر تحديث:** 1 نوفمبر 2025
