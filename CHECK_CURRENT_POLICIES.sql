-- ============================================================================
-- CHECK: Current RLS Policies on governorates table
-- ============================================================================
-- Run this query first to see what policies already exist
-- ============================================================================

-- Check if RLS is enabled on governorates table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'governorates';

-- List all existing policies on governorates table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'governorates'
ORDER BY policyname;

-- Check the structure of governorates table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'governorates'
ORDER BY ordinal_position;
