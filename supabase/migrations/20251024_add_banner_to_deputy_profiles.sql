-- Migration: Add banner_image to deputy_profiles
-- Description: Adds banner/cover image field for deputy profile page

-- Add banner_image column
ALTER TABLE deputy_profiles 
ADD COLUMN IF NOT EXISTS banner_image TEXT;

-- Add comment
COMMENT ON COLUMN deputy_profiles.banner_image IS 'URL of banner/cover image for deputy profile page';

