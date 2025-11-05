-- التحقق من role المستخدم وتحديثه

-- الخطوة 1: التحقق من الوضع الحالي
SELECT 
  up.id,
  up.role,
  up.full_name,
  au.email
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'alcounsol@gmail.com';

-- الخطوة 2: تحديث role إلى super_admin
UPDATE user_profiles
SET role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'alcounsol@gmail.com');

-- الخطوة 3: التحقق من التحديث
SELECT 
  up.id,
  up.role,
  up.full_name,
  au.email
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'alcounsol@gmail.com';
