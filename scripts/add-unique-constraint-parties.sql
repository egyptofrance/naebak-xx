-- Add unique constraint to parties table to prevent duplicate party names
-- This should be run in Supabase SQL Editor after verifying all duplicates are removed

-- First, verify there are no duplicates (should return 0 rows)
SELECT name_ar, COUNT(*) as count
FROM parties
GROUP BY name_ar
HAVING COUNT(*) > 1;

-- If the above query returns 0 rows, proceed with adding the constraint
ALTER TABLE parties 
ADD CONSTRAINT unique_party_name_ar UNIQUE (name_ar);

-- Verify the constraint was added
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'parties'::regclass
AND conname = 'unique_party_name_ar';

-- Note: This will prevent duplicate party names from being inserted in the future
-- Any attempt to insert a party with an existing name_ar will fail with an error

