-- التحقق من الشكاوى في قاعدة البيانات

-- 1. عدد الشكاوى الإجمالي
SELECT COUNT(*) as total_complaints
FROM complaints;

-- 2. عدد الشكاوى حسب الحالة
SELECT status, COUNT(*) as count
FROM complaints
GROUP BY status
ORDER BY count DESC;

-- 3. عرض جميع الشكاوى مع حالاتها
SELECT 
  id,
  title,
  status,
  is_public,
  created_at
FROM complaints
ORDER BY created_at DESC
LIMIT 20;

-- 4. عدد الشكاوى النشطة (حسب الكود)
SELECT COUNT(*) as active_complaints
FROM complaints
WHERE status IN ('new', 'under_review', 'assigned_to_deputy', 'accepted', 'in_progress', 'on_hold');

-- 5. عدد الشكاوى المحلولة
SELECT COUNT(*) as resolved_complaints
FROM complaints
WHERE status = 'resolved';

-- 6. التحقق من RLS policies على جدول complaints
SELECT 
  pol.polname AS policy_name,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command_type,
  pg_get_expr(pol.polqual, pol.polrelid) AS using_expression
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'complaints'
  AND n.nspname = 'public'
ORDER BY pol.polname;
