-- ============================================
-- استعلامات للتحقق من user_type
-- ============================================

-- 1. عرض جميع المستخدمين مع أنواعهم
SELECT 
  id,
  email,
  full_name,
  user_type,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 20;

-- 2. عرض الأدمن فقط
SELECT 
  id,
  email,
  full_name,
  user_type
FROM user_profiles
WHERE user_type = 'app_admin';

-- 3. عرض المديرين فقط
SELECT 
  id,
  email,
  full_name,
  user_type
FROM user_profiles
WHERE user_type = 'manager';

-- 4. عرض النواب فقط
SELECT 
  id,
  email,
  full_name,
  user_type
FROM user_profiles
WHERE user_type = 'deputy';

-- 5. عرض جميع الشكاوى
SELECT 
  id,
  title,
  status,
  citizen_id,
  assigned_deputy_id,
  created_at
FROM complaints
ORDER BY created_at DESC;

-- ============================================
-- إذا لم يظهر الأدمن في النتائج:
-- ============================================
-- يجب تحديث user_type للمستخدم الحالي:

-- استبدل 'YOUR_USER_ID' بـ ID المستخدم الخاص بك
-- UPDATE user_profiles 
-- SET user_type = 'app_admin' 
-- WHERE id = 'YOUR_USER_ID';

