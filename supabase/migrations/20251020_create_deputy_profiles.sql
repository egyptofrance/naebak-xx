-- Migration: Create deputy_profiles table
-- Description: Creates the deputy_profiles table for storing deputy (parliament member) information

-- Create deputy_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE deputy_status AS ENUM ('current', 'candidate', 'former');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create deputy_profiles table
CREATE TABLE IF NOT EXISTS deputy_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
    deputy_status deputy_status NOT NULL DEFAULT 'candidate',
    
    -- Electoral information
    electoral_symbol TEXT,
    electoral_number TEXT,
    electoral_program TEXT,
    
    -- Office information
    office_address TEXT,
    office_phone TEXT,
    office_hours TEXT,
    
    -- Profile information
    bio TEXT,
    achievements TEXT,
    events TEXT,
    
    -- Social media
    website_url TEXT,
    social_media_facebook TEXT,
    social_media_twitter TEXT,
    social_media_instagram TEXT,
    social_media_youtube TEXT,
    
    -- Council membership
    council_id UUID REFERENCES councils(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_user_id ON deputy_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_status ON deputy_profiles(deputy_status);
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_council_id ON deputy_profiles(council_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_deputy_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deputy_profiles_updated_at
    BEFORE UPDATE ON deputy_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_deputy_profiles_updated_at();

-- Enable Row Level Security
ALTER TABLE deputy_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Allow authenticated users to read all deputy profiles
CREATE POLICY "Anyone can view deputy profiles"
    ON deputy_profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow application admins to insert deputy profiles
CREATE POLICY "Application admins can insert deputy profiles"
    ON deputy_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'application_admin'
        )
    );

-- Allow application admins to update deputy profiles
CREATE POLICY "Application admins can update deputy profiles"
    ON deputy_profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'application_admin'
        )
    );

-- Allow application admins to delete deputy profiles
CREATE POLICY "Application admins can delete deputy profiles"
    ON deputy_profiles
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'application_admin'
        )
    );

-- Add comments
COMMENT ON TABLE deputy_profiles IS 'Stores profiles for parliament members (deputies)';
COMMENT ON COLUMN deputy_profiles.deputy_status IS 'Status of the deputy: current (active member), candidate (running for election), or former (past member)';
COMMENT ON COLUMN deputy_profiles.electoral_symbol IS 'Electoral symbol used in campaigns';
COMMENT ON COLUMN deputy_profiles.electoral_number IS 'Official electoral number';
COMMENT ON COLUMN deputy_profiles.council_id IS 'Reference to the council/parliament the deputy belongs to';

