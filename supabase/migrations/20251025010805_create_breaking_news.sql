-- Create breaking_news table
CREATE TABLE IF NOT EXISTS public.breaking_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE public.breaking_news ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active breaking news
CREATE POLICY "Anyone can view active breaking news"
  ON public.breaking_news
  FOR SELECT
  USING (is_active = true);

-- Allow admins to manage breaking news
CREATE POLICY "Admins can manage breaking news"
  ON public.breaking_news
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX idx_breaking_news_active_order ON public.breaking_news(is_active, display_order);

-- Add trigger to update updated_at
CREATE TRIGGER update_breaking_news_updated_at
  BEFORE UPDATE ON public.breaking_news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample breaking news
INSERT INTO public.breaking_news (content, is_active, display_order) VALUES
  ('مجلس النواب يناقش مشروع قانون جديد لتحسين الخدمات الصحية', true, 1),
  ('وزير التعليم يعلن عن خطة تطوير شاملة للمدارس الحكومية', true, 2),
  ('لجنة الطاقة تستعرض مشروعات الطاقة المتجددة الجديدة', true, 3),
  ('البرلمان يوافق على زيادة الحد الأدنى للأجور', true, 4),
  ('افتتاح دورة برلمانية جديدة لمناقشة القضايا الاقتصادية', true, 5);

COMMENT ON TABLE public.breaking_news IS 'Breaking news ticker items displayed on the website';
COMMENT ON COLUMN public.breaking_news.content IS 'The news text content in Arabic';
COMMENT ON COLUMN public.breaking_news.is_active IS 'Whether this news item is currently active and should be displayed';
COMMENT ON COLUMN public.breaking_news.display_order IS 'Order in which news items should be displayed (lower numbers first)';
