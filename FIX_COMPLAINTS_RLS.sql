-- فحص وإصلاح RLS policies على جدول complaints

-- 1. التحقق من حالة RLS
SELECT 
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'complaints'
  AND n.nspname = 'public';

-- 2. عرض جميع السياسات الموجودة
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

-- 3. إضافة policy للقراءة العامة (إذا لم تكن موجودة)
-- هذا سيسمح بقراءة الشكاوى العامة لحساب الإحصائيات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Allow public read for stats' 
    AND polrelid = 'complaints'::regclass
  ) THEN
    CREATE POLICY "Allow public read for stats"
      ON complaints
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- 4. التحقق من عدد الشكاوى بعد الإصلاح
SELECT COUNT(*) as total_complaints FROM complaints;

SELECT COUNT(*) as active_complaints
FROM complaints
WHERE status IN ('new', 'under_review', 'assigned_to_deputy', 'accepted', 'in_progress', 'on_hold');
