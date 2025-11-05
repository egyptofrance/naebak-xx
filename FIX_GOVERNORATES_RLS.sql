-- ============================================================================
-- FIX: Add RLS Policies to Governorates Table
-- ============================================================================
-- This SQL file fixes the issue where admin cannot toggle governorate visibility
-- 
-- HOW TO USE:
-- 1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/fvpwvnghkkhrzupglsrh
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Click "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" button
-- 6. You should see "Success. No rows returned"
-- 7. Test the governorate toggle functionality in admin panel
-- ============================================================================

-- Step 1: Enable Row Level Security on governorates table
ALTER TABLE governorates ENABLE ROW LEVEL SECURITY;

-- Step 2: Allow all authenticated users to view governorates
CREATE POLICY "Anyone can view governorates"
  ON governorates
  FOR SELECT
  TO authenticated
  USING (true);

-- Step 3: Allow admins to update governorates (THIS IS THE KEY FIX)
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

-- Step 4: Allow admins to insert new governorates (for future use)
CREATE POLICY "Admins can insert governorates"
  ON governorates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Step 5: Allow admins to delete governorates (for future use)
CREATE POLICY "Admins can delete governorates"
  ON governorates
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Step 6: Add documentation comment
COMMENT ON TABLE governorates IS 'Egyptian governorates with visibility control for phased rollout. RLS policies ensure only admins can modify data.';

-- ============================================================================
-- DONE! The governorate toggle buttons should now work correctly.
-- ============================================================================
