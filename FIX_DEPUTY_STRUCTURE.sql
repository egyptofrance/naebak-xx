-- Fix deputy_profiles structure to work with existing councils table
-- Instead of using council_type enum, we'll use council_id properly

-- First, let's see what we have
SELECT 
  dp.id,
  up.full_name,
  dp.council_id,
  dp.council_type,
  dp.deputy_status,
  dp.gender,
  dp.governorate
FROM deputy_profiles dp
LEFT JOIN user_profiles up ON dp.user_id = up.id;

-- Option 1: Assign deputies to councils using council_id (recommended)
-- Update deputies to have a default council_id (parliament)
UPDATE deputy_profiles 
SET council_id = (SELECT id FROM councils WHERE code = 'parliament' LIMIT 1)
WHERE council_id IS NULL;

-- Option 2: Or use council_type if you prefer
-- But we need to fix the enum values first
-- Drop the incorrect enum and recreate it with correct values
DROP TYPE IF EXISTS council_type CASCADE;
CREATE TYPE council_type AS ENUM ('parliament', 'senate', 'local');

-- Now update the column to use the correct enum
ALTER TABLE deputy_profiles 
ALTER COLUMN council_type DROP DEFAULT;

ALTER TABLE deputy_profiles 
ALTER COLUMN council_type TYPE council_type USING 
  CASE 
    WHEN council_type::text = 'local_council' THEN 'local'::council_type
    ELSE COALESCE(council_type::text, 'parliament')::council_type
  END;

ALTER TABLE deputy_profiles 
ALTER COLUMN council_type SET DEFAULT 'parliament'::council_type;

-- Update NULL values
UPDATE deputy_profiles 
SET council_type = 'parliament'
WHERE council_type IS NULL;

-- Set default values for gender and governorate
UPDATE deputy_profiles 
SET 
  gender = 'male',
  governorate = 'القاهرة'
WHERE gender IS NULL OR governorate IS NULL;

-- Verify the changes
SELECT 
  dp.id,
  up.full_name,
  c.name_ar as council_name,
  dp.council_type,
  dp.deputy_status,
  dp.gender,
  dp.governorate,
  dp.points
FROM deputy_profiles dp
LEFT JOIN user_profiles up ON dp.user_id = up.id
LEFT JOIN councils c ON dp.council_id = c.id
ORDER BY up.full_name;

