-- Migration: Migrate electoral_district data to electoral_district_id
-- Date: 2025-11-05
-- Purpose: Move old electoral district data from text field to UUID foreign key field

-- This migration will:
-- 1. Find all user_profiles with electoral_district (old text field) but no electoral_district_id
-- 2. Try to match the text value with an electoral_district ID
-- 3. Update electoral_district_id with the matched ID

-- Note: This assumes electoral_district contains the ID directly
-- If it contains names or other data, this migration needs to be adjusted

DO $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  -- Update electoral_district_id from electoral_district where:
  -- 1. electoral_district is not null
  -- 2. electoral_district_id is null
  -- 3. electoral_district value exists in electoral_districts table
  
  UPDATE user_profiles
  SET electoral_district_id = electoral_district
  WHERE electoral_district IS NOT NULL
    AND electoral_district != ''
    AND electoral_district_id IS NULL
    AND EXISTS (
      SELECT 1 FROM electoral_districts 
      WHERE id = user_profiles.electoral_district
    );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RAISE NOTICE 'Migration completed: Updated % user profiles with electoral_district_id', updated_count;
END $$;

-- Add comment to track migration
COMMENT ON COLUMN user_profiles.electoral_district IS 'DEPRECATED: Use electoral_district_id instead. This field is kept for backward compatibility only.';
