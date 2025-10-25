-- Update user_profiles role constraint to allow deputy and manager roles
-- Drop the old constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Add the new constraint with all three roles
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
  CHECK (role IN ('citizen', 'deputy', 'manager'));
