-- Fix existing deputies to have default values for new fields
-- This will make them appear in the deputy selector

-- Update all deputies with NULL council_type to have 'parliament' as default
UPDATE deputy_profiles 
SET 
  council_type = 'parliament',
  gender = 'male',
  governorate = 'القاهرة'
WHERE council_type IS NULL;

-- Verify the changes
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

