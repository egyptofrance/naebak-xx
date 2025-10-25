-- Create electoral_districts table
CREATE TABLE IF NOT EXISTS electoral_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  governorate_id UUID NOT NULL REFERENCES governorates(id) ON DELETE CASCADE,
  district_type TEXT NOT NULL CHECK (district_type IN ('individual', 'list')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: same name can't exist twice in same governorate for same type
  UNIQUE(name, governorate_id, district_type)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_electoral_districts_governorate ON electoral_districts(governorate_id);
CREATE INDEX IF NOT EXISTS idx_electoral_districts_type ON electoral_districts(district_type);

-- Add comments
COMMENT ON TABLE electoral_districts IS 'Electoral districts within governorates';
COMMENT ON COLUMN electoral_districts.district_type IS 'Type of district: individual or list';

-- Add candidate_type and electoral_district_id to deputy_profiles
ALTER TABLE deputy_profiles
ADD COLUMN IF NOT EXISTS candidate_type TEXT CHECK (candidate_type IN ('individual', 'list', 'both')),
ADD COLUMN IF NOT EXISTS electoral_district_id UUID REFERENCES electoral_districts(id) ON DELETE SET NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_electoral_district ON deputy_profiles(electoral_district_id);
CREATE INDEX IF NOT EXISTS idx_deputy_profiles_candidate_type ON deputy_profiles(candidate_type);

-- Add comments
COMMENT ON COLUMN deputy_profiles.candidate_type IS 'Type of candidacy: individual, list, or both';
COMMENT ON COLUMN deputy_profiles.electoral_district_id IS 'Electoral district the deputy belongs to';

-- Enable RLS
ALTER TABLE electoral_districts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for electoral_districts
CREATE POLICY "Anyone can view electoral districts"
  ON electoral_districts
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert electoral districts"
  ON electoral_districts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Only admins can update electoral districts"
  ON electoral_districts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Only admins can delete electoral districts"
  ON electoral_districts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Function to get electoral districts by governorate
CREATE OR REPLACE FUNCTION get_electoral_districts_by_governorate(
  p_governorate_id UUID,
  p_district_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  name_en TEXT,
  district_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ed.id,
    ed.name,
    ed.name_en,
    ed.district_type
  FROM electoral_districts ed
  WHERE ed.governorate_id = p_governorate_id
    AND (p_district_type IS NULL OR ed.district_type = p_district_type)
  ORDER BY ed.name;
END;
$$;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_electoral_districts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_electoral_districts_updated_at
  BEFORE UPDATE ON electoral_districts
  FOR EACH ROW
  EXECUTE FUNCTION update_electoral_districts_updated_at();

