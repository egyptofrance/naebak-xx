-- Migration: Add additional fields to deputy_profiles for advanced filtering
-- Date: 2025-10-23
-- Description: Adds council_type, gender, and governorate fields to deputy_profiles table

-- Add council_type enum (نوع المجلس)
DO $$ BEGIN
    CREATE TYPE council_type AS ENUM ('parliament', 'senate', 'local_council');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add gender enum (الجنس)
DO $$ BEGIN
    CREATE TYPE gender_type AS ENUM ('male', 'female');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to deputy_profiles
ALTER TABLE deputy_profiles 
ADD COLUMN IF NOT EXISTS council_type council_type DEFAULT 'parliament',
ADD COLUMN IF NOT EXISTS gender gender_type,
ADD COLUMN IF NOT EXISTS governorate TEXT;

-- Create indexes for better filtering performance
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_council_type ON deputy_profiles(council_type);
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_gender ON deputy_profiles(gender);
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_governorate ON deputy_profiles(governorate);

-- Add comments
COMMENT ON COLUMN deputy_profiles.council_type IS 'Type of council: parliament (برلمان), senate (مجلس شيوخ), local_council (مجلس محلي)';
COMMENT ON COLUMN deputy_profiles.gender IS 'Gender of the deputy: male (ذكر), female (أنثى)';
COMMENT ON COLUMN deputy_profiles.governorate IS 'Governorate the deputy represents';

-- Verify columns were added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'deputy_profiles' 
    AND column_name IN ('council_type', 'gender', 'governorate')
  ) THEN
    RAISE NOTICE 'New columns added successfully to deputy_profiles!';
  ELSE
    RAISE EXCEPTION 'Failed to add new columns!';
  END IF;
END $$;

