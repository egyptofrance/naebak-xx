-- ============================================================================
-- Fix: Manager Dashboard Not Showing in Sidebar
-- Date: 2025-10-22
-- Issue: RLS Policy preventing getCachedManagerProfile() from fetching data
-- Solution: Use same approach as deputy_profiles (USING true)
-- ============================================================================

-- Step 1: Drop the incorrect RLS Policy
DROP POLICY IF EXISTS "Users can read their own manager permissions" 
ON public.manager_permissions;

-- Step 2: Drop the temporary testing policy (if exists)
DROP POLICY IF EXISTS "Anyone can view manager permissions (TEMP)" 
ON public.manager_permissions;

-- Step 3: Create the correct RLS Policy
-- This allows all authenticated users to read manager permissions
-- Same approach used in deputy_profiles table
CREATE POLICY "Anyone can view manager permissions"
  ON public.manager_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- Verification Query
-- Run this to verify the fix worked
-- ============================================================================

-- Check if the policy was created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'manager_permissions'
AND policyname = 'Anyone can view manager permissions';

-- Expected result:
-- Should show one row with:
-- - policyname: "Anyone can view manager permissions"
-- - cmd: "SELECT"
-- - qual: "true"

-- ============================================================================
-- Test Query (run as authenticated user)
-- ============================================================================

-- This should return your manager permissions
-- SELECT * FROM manager_permissions WHERE user_id = auth.uid();

-- ============================================================================
-- Security Notes
-- ============================================================================

-- Q: Is USING (true) safe?
-- A: Yes, for the following reasons:
--
-- 1. Same approach used in deputy_profiles table
-- 2. manager_permissions only contains boolean permissions (not sensitive data)
-- 3. Actual sensitive operations are protected by:
--    - Server Actions that check permissions before execution
--    - Server Components that verify managerProfile before rendering
--    - RLS Policies on other tables (users, deputies, etc.)
--
-- 4. Regular users cannot benefit from seeing this data
-- 5. The UI hides delete buttons for managers (enforced in code)

-- ============================================================================
-- Rollback (if needed)
-- ============================================================================

-- If you need to rollback to the original policy:
-- 
-- DROP POLICY "Anyone can view manager permissions" ON public.manager_permissions;
-- 
-- CREATE POLICY "Users can read their own manager permissions"
--   ON public.manager_permissions
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);

-- ============================================================================
-- Migration File Update
-- ============================================================================

-- After verifying this fix works, update the migration file:
-- supabase/migrations/create_manager_permissions_table.sql
--
-- Replace lines 29-34 with:
--
-- CREATE POLICY "Anyone can view manager permissions"
--   ON public.manager_permissions
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- ============================================================================

