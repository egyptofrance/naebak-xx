-- فحص وإصلاح constraint على جدول user_profiles

-- الخطوة 1: فحص الـ constraint الحالي
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_profiles'::regclass
  AND contype = 'c'  -- check constraints
ORDER BY conname;

-- الخطوة 2: إزالة الـ constraint القديم (إذا كان يمنع 'admin')
-- (لا تنفذ هذا إلا بعد رؤية نتيجة الخطوة 1)
/*
ALTER TABLE user_profiles 
DROP CONSTRAINT user_profiles_role_check;
*/

-- الخطوة 3: إضافة constraint جديد يسمح بـ admin
-- (نفذ هذا بعد إزالة القديم)
/*
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('user', 'citizen', 'deputy', 'manager', 'admin', 'super_admin'));
*/

-- الخطوة 4: تحديث role المستخدم إلى admin
/*
UPDATE user_profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'alcounsol@gmail.com');
*/

-- الخطوة 5: التحقق من النتيجة
/*
SELECT 
  up.role,
  au.email
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'alcounsol@gmail.com';
*/
