-- Create governorates table for Egyptian governorates
CREATE TABLE IF NOT EXISTS public.governorates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read governorates
CREATE POLICY "Anyone can view governorates"
  ON public.governorates
  FOR SELECT
  USING (true);

-- Insert 27 Egyptian governorates
INSERT INTO public.governorates (name_ar, name_en) VALUES
  ('القاهرة', 'Cairo'),
  ('الجيزة', 'Giza'),
  ('الإسكندرية', 'Alexandria'),
  ('الدقهلية', 'Dakahlia'),
  ('البحر الأحمر', 'Red Sea'),
  ('البحيرة', 'Beheira'),
  ('الفيوم', 'Fayoum'),
  ('الغربية', 'Gharbia'),
  ('الإسماعيلية', 'Ismailia'),
  ('المنوفية', 'Monufia'),
  ('المنيا', 'Minya'),
  ('القليوبية', 'Qalyubia'),
  ('الوادي الجديد', 'New Valley'),
  ('الشرقية', 'Sharqia'),
  ('سوهاج', 'Sohag'),
  ('جنوب سيناء', 'South Sinai'),
  ('كفر الشيخ', 'Kafr El Sheikh'),
  ('مطروح', 'Matrouh'),
  ('الأقصر', 'Luxor'),
  ('قنا', 'Qena'),
  ('أسوان', 'Aswan'),
  ('أسيوط', 'Assiut'),
  ('بني سويف', 'Beni Suef'),
  ('بورسعيد', 'Port Said'),
  ('دمياط', 'Damietta'),
  ('الزقازيق', 'Zagazig'),
  ('شمال سيناء', 'North Sinai')
ON CONFLICT DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_governorates_name_ar ON public.governorates(name_ar);
CREATE INDEX IF NOT EXISTS idx_governorates_name_en ON public.governorates(name_en);

