-- =====================================================================
-- Migration: Add missing fields to user_profiles table
-- Date: 2025-11-05
-- Purpose: Add electoral_district_id and other missing fields to user_profiles
-- =====================================================================

-- Step 1: Add electoral_district_id column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS electoral_district_id UUID REFERENCES electoral_districts(id) ON DELETE SET NULL;

-- Step 2: Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_electoral_district ON user_profiles(electoral_district_id);

-- Step 3: Add comment
COMMENT ON COLUMN user_profiles.electoral_district_id IS 'Electoral district the user belongs to (foreign key to electoral_districts table)';

-- Step 4: Migrate data from old field to new field
-- This will copy electoral_district (text/UUID) to electoral_district_id (UUID foreign key)
-- Only if the value exists in electoral_districts table
DO $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  UPDATE user_profiles
  SET electoral_district_id = electoral_district::UUID
  WHERE electoral_district IS NOT NULL
    AND electoral_district != ''
    AND electoral_district_id IS NULL
    AND EXISTS (
      SELECT 1 FROM electoral_districts 
      WHERE id = electoral_district::UUID
    );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RAISE NOTICE '✅ Migration completed: Updated % user profiles with electoral_district_id', updated_count;
END $$;

-- Step 5: Add DEPRECATED comment to old field
COMMENT ON COLUMN user_profiles.electoral_district IS 'DEPRECATED: Use electoral_district_id instead. This field is kept for backward compatibility only.';

-- =====================================================================
-- Verification Query (run this manually to check)
-- =====================================================================
-- SELECT 
--   COUNT(*) as total_users,
--   COUNT(electoral_district_id) as users_with_new_field,
--   COUNT(electoral_district) as users_with_old_field,
--   COUNT(governorate_id) as users_with_governorate
-- FROM user_profiles;
-- =====================================================================
