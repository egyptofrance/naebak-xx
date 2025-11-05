-- ============================================================================
-- TEST: Simulate UPDATE operation to test the policy
-- ============================================================================
-- This test checks if the UPDATE policy works correctly
-- ============================================================================

-- Step 1: Check your current user and role
SELECT 
  auth.uid() as current_user_id,
  up.full_name,
  up.role
FROM user_profiles up
WHERE up.id = auth.uid();

-- Step 2: Check if you have admin role (required for UPDATE)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    ) THEN 'YES - You have admin access ✅'
    ELSE 'NO - You do NOT have admin access ❌'
  END as has_admin_access;

-- Step 3: Get a sample governorate to test
SELECT 
  id,
  name_ar,
  is_visible
FROM governorates
LIMIT 1;

-- ============================================================================
-- Step 4: Test UPDATE (replace the ID below with actual ID from Step 3)
-- ============================================================================
-- IMPORTANT: Replace 'YOUR_GOVERNORATE_ID_HERE' with actual UUID from Step 3
-- 
-- Example:
-- UPDATE governorates 
-- SET is_visible = NOT is_visible 
-- WHERE id = '7a29fca7-25f2-4078-813e-bde9f4e8c13b';
-- 
-- If you get "Success" → Policy works! ✅
-- If you get "permission denied" or "policy violation" → Policy has issue ❌
-- ============================================================================

-- Step 5: Verify the change
-- SELECT id, name_ar, is_visible FROM governorates WHERE id = 'YOUR_ID_HERE';
