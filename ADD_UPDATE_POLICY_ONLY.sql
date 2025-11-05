-- ============================================================================
-- FIX: Add UPDATE policy for governorates table
-- ============================================================================
-- Based on actual analysis:
-- - RLS is already enabled ✅
-- - 3 SELECT policies already exist ✅
-- - UPDATE policy is MISSING ❌ (this is the problem)
-- 
-- This SQL adds ONLY the missing UPDATE policy
-- ============================================================================

-- Add UPDATE policy for admins
CREATE POLICY "Admins can update governorates"
  ON governorates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- DONE! This should fix the toggle button issue.
-- ============================================================================
-- 
-- What this policy does:
-- - Allows only users with role 'admin' or 'super_admin' to UPDATE governorates
-- - USING clause: checks if user can see the row before updating
-- - WITH CHECK clause: validates the user can perform the update
-- 
-- After running this:
-- 1. Go to /app_admin/governorates
-- 2. Try clicking toggle button
-- 3. It should work now!
-- ============================================================================
