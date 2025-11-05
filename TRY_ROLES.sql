-- تجربة القيم المختلفة للـ role

-- جرب هذه القيم واحدة تلو الأخرى:

-- التجربة 1: manager
UPDATE user_profiles
SET role = 'manager'
WHERE id = (SELECT id FROM auth.users WHERE email = 'alcounsol@gmail.com');

-- التحقق
SELECT role, email 
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'alcounsol@gmail.com';
