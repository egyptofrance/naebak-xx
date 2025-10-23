-- ============================================
-- التحقق من حالة حساب الأدمن
-- ============================================

-- 1. التحقق من بيانات المستخدم alcounsol@gmail.com
SELECT 
  id,
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at
FROM auth.users
WHERE email = 'alcounsol@gmail.com';

-- 2. التحقق من جميع الشكاوى الموجودة
SELECT 
  id,
  title,
  status,
  priority,
  citizen_id,
  assigned_deputy_id,
  created_at
FROM complaints
ORDER BY created_at DESC;

-- 3. عد الشكاوى
SELECT COUNT(*) as total_complaints FROM complaints;

-- 4. التحقق من RLS policies على جدول complaints
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'complaints'
ORDER BY policyname;

-- ============================================
-- إذا لم تظهر الشكاوى:
-- ============================================

-- الحل 1: تأكد من أن حسابك أدمن
-- نفّذ هذا الكود (سيجعل حسابك أدمن):
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb),
  '{user_role}',
  '"admin"'
)
WHERE email = 'alcounsol@gmail.com';

-- الحل 2: إذا لم توجد شكاوى، أنشئ شكوى تجريبية
-- (سيتم إنشاؤها من حساب مواطن عادي)

