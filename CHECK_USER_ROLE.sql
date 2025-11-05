-- التحقق من role المستخدم alcounsol@gmail.com

-- الخطوة 1: البحث عن المستخدم في auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'alcounsol@gmail.com';

-- الخطوة 2: البحث عن profile المستخدم
SELECT 
  up.id,
  up.role,
  up.full_name_ar,
  up.created_at,
  au.email
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'alcounsol@gmail.com';

-- الخطوة 3: إذا لم يكن role = 'admin' أو 'super_admin'، قم بتحديثه
-- (لا تنفذ هذا الآن - فقط للمعلومات)
/*
UPDATE user_profiles
SET role = 'super_admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'alcounsol@gmail.com');
*/
