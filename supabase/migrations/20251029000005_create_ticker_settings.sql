-- Create ticker_settings table for global breaking news ticker settings
-- Migration: 20251029000005_create_ticker_settings.sql

-- Remove scroll_speed from breaking_news table
ALTER TABLE public.breaking_news 
DROP COLUMN IF EXISTS scroll_speed;

-- Create ticker_settings table
CREATE TABLE IF NOT EXISTS public.ticker_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scroll_speed INTEGER DEFAULT 50 CHECK (scroll_speed >= 10 AND scroll_speed <= 200),
  is_enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE public.ticker_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read ticker settings
CREATE POLICY "Anyone can view ticker settings"
  ON public.ticker_settings
  FOR SELECT
  USING (true);

-- Allow admins to manage ticker settings
CREATE POLICY "Admins can manage ticker settings"
  ON public.ticker_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default settings
INSERT INTO public.ticker_settings (scroll_speed, is_enabled)
VALUES (50, true)
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON TABLE public.ticker_settings IS 'Global settings for the breaking news ticker';
COMMENT ON COLUMN public.ticker_settings.scroll_speed IS 'Scroll speed in pixels per second (10-200)';
COMMENT ON COLUMN public.ticker_settings.is_enabled IS 'Whether the ticker is enabled globally';
