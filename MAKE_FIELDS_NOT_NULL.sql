-- Make deputy fields NOT NULL with default values
-- This ensures all new deputies must have these fields filled
-- and prevents NULL values that cause filtering issues

-- First, update any existing NULL values
UPDATE deputy_profiles 
SET 
  council_type = COALESCE(council_type, 'parliament'::council_type),
  gender = COALESCE(gender, 'male'::gender_type),
  governorate = COALESCE(governorate, 'القاهرة')
WHERE council_type IS NULL OR gender IS NULL OR governorate IS NULL;

-- Now make the columns NOT NULL with defaults
ALTER TABLE deputy_profiles 
ALTER COLUMN council_type SET NOT NULL,
ALTER COLUMN council_type SET DEFAULT 'parliament'::council_type;

ALTER TABLE deputy_profiles 
ALTER COLUMN gender SET NOT NULL,
ALTER COLUMN gender SET DEFAULT 'male'::gender_type;

ALTER TABLE deputy_profiles 
ALTER COLUMN governorate SET NOT NULL,
ALTER COLUMN governorate SET DEFAULT 'القاهرة';

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'deputy_profiles'
  AND column_name IN ('council_type', 'gender', 'governorate')
ORDER BY column_name;

-- Check all deputies now have complete data
SELECT 
  dp.id,
  up.full_name,
  dp.council_type,
  dp.deputy_status,
  dp.gender,
  dp.governorate,
  dp.points
FROM deputy_profiles dp
LEFT JOIN user_profiles up ON dp.user_id = up.id
ORDER BY up.full_name;

