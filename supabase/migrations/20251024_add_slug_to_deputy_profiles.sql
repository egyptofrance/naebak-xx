-- Migration: Add slug to deputy_profiles
-- Description: Adds slug field for unique deputy profile URLs

-- Add slug column
ALTER TABLE deputy_profiles 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_slug ON deputy_profiles(slug);

-- Add comment
COMMENT ON COLUMN deputy_profiles.slug IS 'Unique URL-friendly identifier for deputy profile page (e.g., ahmed-mohamed)';

