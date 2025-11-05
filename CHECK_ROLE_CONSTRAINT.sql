-- فحص القيم المسموحة لحقل role في جدول user_profiles

-- الطريقة 1: فحص الـ constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_profiles'::regclass
  AND conname LIKE '%role%';

-- الطريقة 2: فحص جميع القيم الموجودة حالياً
SELECT DISTINCT role, COUNT(*) as count
FROM user_profiles
GROUP BY role
ORDER BY count DESC;

-- الطريقة 3: محاولة تحديث role إلى 'admin' بدلاً من 'super_admin'
UPDATE user_profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'alcounsol@gmail.com');

-- التحقق من التحديث
SELECT 
  up.role,
  au.email
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'alcounsol@gmail.com';
