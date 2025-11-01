-- Update all public complaints to be general complaints (governorate = null)
-- This makes them appear in all governorates

-- First, let's see how many complaints will be affected
SELECT 
  COUNT(*) as total_public_complaints,
  COUNT(CASE WHEN governorate IS NOT NULL THEN 1 END) as with_governorate,
  COUNT(CASE WHEN governorate IS NULL THEN 1 END) as already_general
FROM complaints
WHERE is_public = true 
  AND admin_approved_public = true;

-- Now update all public complaints to be general (governorate = null)
UPDATE complaints
SET 
  governorate = NULL,
  district = NULL,  -- Also clear district since it's not relevant for general complaints
  updated_at = NOW()
WHERE is_public = true 
  AND admin_approved_public = true
  AND governorate IS NOT NULL;  -- Only update those that have a governorate

-- Verify the update
SELECT 
  COUNT(*) as total_public_complaints,
  COUNT(CASE WHEN governorate IS NOT NULL THEN 1 END) as with_governorate,
  COUNT(CASE WHEN governorate IS NULL THEN 1 END) as general_complaints
FROM complaints
WHERE is_public = true 
  AND admin_approved_public = true;

-- Show some examples of updated complaints
SELECT 
  id,
  title,
  governorate,
  district,
  created_at
FROM complaints
WHERE is_public = true 
  AND admin_approved_public = true
ORDER BY created_at DESC
LIMIT 10;
