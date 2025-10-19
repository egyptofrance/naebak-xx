-- Migration: Add Foreign Key between deputy_profiles.user_id and user_profiles.id
-- Date: 2025-10-19
-- Description: This migration adds the missing foreign key relationship between deputy_profiles and user_profiles

-- First, check if there are any orphaned records (deputies without valid users)
-- This query will show any problematic records that need to be cleaned up
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM deputy_profiles dp
  LEFT JOIN user_profiles up ON dp.user_id = up.id
  WHERE up.id IS NULL;
  
  IF orphaned_count > 0 THEN
    RAISE NOTICE 'Found % orphaned deputy_profiles records without valid user_profiles', orphaned_count;
    -- Optionally delete orphaned records (uncomment if needed)
    -- DELETE FROM deputy_profiles WHERE user_id NOT IN (SELECT id FROM user_profiles);
  ELSE
    RAISE NOTICE 'No orphaned records found. Safe to proceed.';
  END IF;
END $$;

-- Add the foreign key constraint
-- This will ensure data integrity going forward
ALTER TABLE deputy_profiles
ADD CONSTRAINT fk_deputy_user
FOREIGN KEY (user_id)
REFERENCES user_profiles(id)
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- Create an index on user_id for better query performance
-- This will speed up joins between deputy_profiles and user_profiles
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_user_id 
ON deputy_profiles(user_id);

-- Add a comment to document the relationship
COMMENT ON CONSTRAINT fk_deputy_user ON deputy_profiles IS 
'Foreign key relationship between deputy_profiles and user_profiles. When a user is deleted, their deputy profile is also deleted (CASCADE).';

-- Verify the constraint was added successfully
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_deputy_user' 
    AND table_name = 'deputy_profiles'
  ) THEN
    RAISE NOTICE 'Foreign key constraint fk_deputy_user added successfully!';
  ELSE
    RAISE EXCEPTION 'Failed to add foreign key constraint!';
  END IF;
END $$;

