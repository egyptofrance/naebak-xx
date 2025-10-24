-- Add unique constraint to deputy_profiles.slug
-- This ensures that each deputy has a unique slug for their public profile page

-- First, check if constraint already exists and drop it if needed
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'deputy_profiles_slug_key'
    ) THEN
        ALTER TABLE deputy_profiles DROP CONSTRAINT deputy_profiles_slug_key;
    END IF;
END $$;

-- Add unique constraint on slug column
-- Note: This allows NULL values (multiple NULLs are allowed in PostgreSQL unique constraints)
ALTER TABLE deputy_profiles 
ADD CONSTRAINT deputy_profiles_slug_key UNIQUE (slug);

-- Create an index on slug for better query performance
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_slug 
ON deputy_profiles(slug) 
WHERE slug IS NOT NULL;

-- Verify the constraint was added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'deputy_profiles'::regclass 
AND conname = 'deputy_profiles_slug_key';

