-- Add Row Level Security (RLS) policies to governorates table
-- This migration fixes the issue where admins cannot update governorate visibility

-- Enable Row Level Security on governorates table
ALTER TABLE governorates ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow all authenticated users to view governorates
-- This is needed for both public pages and admin pages
CREATE POLICY "Anyone can view governorates"
  ON governorates
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: Allow admins to update governorates
-- This enables the toggle functionality in the admin panel
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

-- Policy 3: Allow admins to insert new governorates (optional, for future use)
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

-- Policy 4: Allow admins to delete governorates (optional, for future use)
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

-- Add comment to document the purpose of these policies
COMMENT ON TABLE governorates IS 'Egyptian governorates with visibility control for phased rollout. RLS policies ensure only admins can modify data.';
