-- ============================================================================
-- VERIFY: Check if the UPDATE policy was added successfully
-- ============================================================================
-- Run this AFTER executing ADD_UPDATE_POLICY_ONLY.sql
-- ============================================================================

-- Check all policies (should now be 4 policies)
SELECT 
  pol.polname AS policy_name,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command_type,
  pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'governorates'
  AND n.nspname = 'public'
ORDER BY pol.polcmd, pol.polname;

-- Count policies by type
SELECT 
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command_type,
  COUNT(*) as count
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
WHERE c.relname = 'governorates'
GROUP BY pol.polcmd
ORDER BY pol.polcmd;

-- ============================================================================
-- Expected results:
-- - 3 SELECT policies (existing)
-- - 1 UPDATE policy (newly added) ✅
-- - Total: 4 policies
-- ============================================================================
