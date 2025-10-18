-- Add citizen-specific fields to user_profiles table
-- These fields are optional and can be filled during onboarding or later

-- Add phone number
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add location fields
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS governorate_id UUID REFERENCES public.governorates(id) ON DELETE SET NULL;

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS district TEXT;

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS village TEXT;

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add job information
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Add political affiliation
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS party_id UUID REFERENCES public.parties(id) ON DELETE SET NULL;

-- Add electoral district
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS electoral_district TEXT;

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_user_profiles_governorate_id ON public.user_profiles(governorate_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_party_id ON public.user_profiles(party_id);

-- Create indexes for searchable fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON public.user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON public.user_profiles(city);
CREATE INDEX IF NOT EXISTS idx_user_profiles_electoral_district ON public.user_profiles(electoral_district);

-- Add comment to document the purpose
COMMENT ON COLUMN public.user_profiles.phone IS 'Citizen phone number (optional)';
COMMENT ON COLUMN public.user_profiles.governorate_id IS 'Reference to Egyptian governorate';
COMMENT ON COLUMN public.user_profiles.city IS 'City or center name';
COMMENT ON COLUMN public.user_profiles.district IS 'District or neighborhood';
COMMENT ON COLUMN public.user_profiles.village IS 'Village name (if applicable)';
COMMENT ON COLUMN public.user_profiles.address IS 'Full address';
COMMENT ON COLUMN public.user_profiles.job_title IS 'Current job or occupation';
COMMENT ON COLUMN public.user_profiles.party_id IS 'Political party affiliation';
COMMENT ON COLUMN public.user_profiles.electoral_district IS 'Electoral district for voting';

