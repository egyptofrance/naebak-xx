-- فحص القيم المسموحة فقط (بدون تحديث)

-- الاستعلام 1: فحص الـ constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_profiles'::regclass
  AND conname LIKE '%role%';

-- الاستعلام 2: فحص جميع القيم الموجودة حالياً
SELECT DISTINCT role, COUNT(*) as count
FROM user_profiles
GROUP BY role
ORDER BY count DESC;

-- الاستعلام 3: فحص role المستخدم الحالي
SELECT 
  up.role,
  au.email
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'alcounsol@gmail.com';
