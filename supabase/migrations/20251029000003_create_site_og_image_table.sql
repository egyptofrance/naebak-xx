-- Create site_og_image table for managing Open Graph share image
CREATE TABLE IF NOT EXISTS public.site_og_image (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE public.site_og_image ENABLE ROW LEVEL SECURITY;

-- Allow public to read
CREATE POLICY "Allow public read access" ON public.site_og_image
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update (will be restricted by app logic to admins only)
CREATE POLICY "Allow authenticated insert/update" ON public.site_og_image
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_site_og_image_created_at ON public.site_og_image(created_at DESC);

-- Add comment
COMMENT ON TABLE public.site_og_image IS 'Stores the Open Graph share image URL for social media sharing';
