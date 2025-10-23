-- ============================================
-- التحقق من بنية الجداول الموجودة
-- ============================================

-- 1. عرض جميع الجداول في public schema
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. عرض أعمدة جدول user_profiles (إذا كان موجوداً)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. عرض أعمدة جدول deputy_profiles
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'deputy_profiles'
ORDER BY ordinal_position;

-- 4. عرض أعمدة جدول manager_profiles
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'manager_profiles'
ORDER BY ordinal_position;

-- 5. التحقق من auth.users
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

