-- ============================================================================
-- CHECK V2: Detailed check for RLS status and policies
-- ============================================================================
-- This version uses different system tables that should be accessible
-- ============================================================================

-- Method 1: Check RLS status using pg_class
SELECT 
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'governorates'
  AND n.nspname = 'public';

-- Method 2: Check policies using pg_policy (more detailed)
SELECT 
  pol.polname AS policy_name,
  pol.polcmd AS command,
  CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command_type,
  pol.polpermissive AS is_permissive,
  pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
  pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression,
  ARRAY(
    SELECT rolname 
    FROM pg_roles 
    WHERE oid = ANY(pol.polroles)
  ) AS roles
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'governorates'
  AND n.nspname = 'public'
ORDER BY pol.polname;

-- Method 3: Simple count of policies
SELECT COUNT(*) as total_policies
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
WHERE c.relname = 'governorates';
