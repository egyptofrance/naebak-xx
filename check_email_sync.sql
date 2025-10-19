-- Check if email exists in user_profiles for ahmed user
SELECT 
    up.id,
    up.full_name,
    up.email,
    uas.email_readonly
FROM user_profiles up
LEFT JOIN user_application_settings uas ON up.id = uas.id
WHERE up.full_name = 'ahmed' OR uas.email_readonly = '9f37446535@webxios.pro';
