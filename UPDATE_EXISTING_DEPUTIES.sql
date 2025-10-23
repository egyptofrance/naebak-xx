-- Update existing deputies with default values for new fields
-- This ensures all deputies appear in the selection interface

-- Update deputies that have NULL council_type
UPDATE deputy_profiles 
SET council_type = 'parliament'
WHERE council_type IS NULL;

-- You can optionally set gender and governorate if needed
-- UPDATE deputy_profiles 
-- SET gender = 'male'
-- WHERE gender IS NULL;

-- Verify the update
SELECT 
  id,
  user_id,
  council_type,
  deputy_status,
  gender,
  governorate,
  points
FROM deputy_profiles
ORDER BY created_at DESC;

