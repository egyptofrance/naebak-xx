-- Create parties table for Egyptian political parties
CREATE TABLE IF NOT EXISTS public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read parties
CREATE POLICY "Anyone can view parties"
  ON public.parties
  FOR SELECT
  USING (true);

-- Insert Egyptian political parties
INSERT INTO public.parties (name_ar, name_en) VALUES
  ('مستقل', 'Independent'),
  ('حزب الوفد', 'Wafd Party'),
  ('حزب مستقبل وطن', 'Future of a Nation Party'),
  ('حزب الشعب الجمهوري', 'Republican People''s Party'),
  ('حزب المؤتمر', 'Congress Party'),
  ('حزب التجمع', 'Tagammu Party'),
  ('حزب الإصلاح والتنمية', 'Reform and Development Party'),
  ('حزب المصريين الأحرار', 'Free Egyptians Party'),
  ('حزب الجيل الديمقراطي', 'Democratic Generation Party'),
  ('حزب حماة الوطن', 'Homeland Defenders Party')
ON CONFLICT DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_parties_name_ar ON public.parties(name_ar);
CREATE INDEX IF NOT EXISTS idx_parties_name_en ON public.parties(name_en);

