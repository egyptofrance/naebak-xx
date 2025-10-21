-- ============================================
-- CREATE DEPUTY CONTENT TABLES
-- ============================================
-- Purpose: Store structured content for deputies (electoral programs, achievements, events)
-- Each item has: title, description, image_url, and display_order
-- Safe to run: Uses IF NOT EXISTS, no data will be lost
-- ============================================

-- 1. Deputy Electoral Programs Table
CREATE TABLE IF NOT EXISTS public.deputy_electoral_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deputy_id UUID NOT NULL REFERENCES public.deputy_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Deputy Achievements Table
CREATE TABLE IF NOT EXISTS public.deputy_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deputy_id UUID NOT NULL REFERENCES public.deputy_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Deputy Events Table
CREATE TABLE IF NOT EXISTS public.deputy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deputy_id UUID NOT NULL REFERENCES public.deputy_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

-- Electoral Programs indexes
CREATE INDEX IF NOT EXISTS idx_deputy_electoral_programs_deputy_id 
  ON public.deputy_electoral_programs(deputy_id);
CREATE INDEX IF NOT EXISTS idx_deputy_electoral_programs_display_order 
  ON public.deputy_electoral_programs(display_order);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_deputy_achievements_deputy_id 
  ON public.deputy_achievements(deputy_id);
CREATE INDEX IF NOT EXISTS idx_deputy_achievements_display_order 
  ON public.deputy_achievements(display_order);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_deputy_events_deputy_id 
  ON public.deputy_events(deputy_id);
CREATE INDEX IF NOT EXISTS idx_deputy_events_display_order 
  ON public.deputy_events(display_order);
CREATE INDEX IF NOT EXISTS idx_deputy_events_event_date 
  ON public.deputy_events(event_date);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.deputy_electoral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deputy_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deputy_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access to deputy_electoral_programs" ON public.deputy_electoral_programs;
DROP POLICY IF EXISTS "Service role has full access to deputy_electoral_programs" ON public.deputy_electoral_programs;

DROP POLICY IF EXISTS "Public read access to deputy_achievements" ON public.deputy_achievements;
DROP POLICY IF EXISTS "Service role has full access to deputy_achievements" ON public.deputy_achievements;

DROP POLICY IF EXISTS "Public read access to deputy_events" ON public.deputy_events;
DROP POLICY IF EXISTS "Service role has full access to deputy_events" ON public.deputy_events;

-- Electoral Programs policies
CREATE POLICY "Public read access to deputy_electoral_programs"
  ON public.deputy_electoral_programs
  FOR SELECT
  USING (true);

CREATE POLICY "Service role has full access to deputy_electoral_programs"
  ON public.deputy_electoral_programs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Achievements policies
CREATE POLICY "Public read access to deputy_achievements"
  ON public.deputy_achievements
  FOR SELECT
  USING (true);

CREATE POLICY "Service role has full access to deputy_achievements"
  ON public.deputy_achievements
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Events policies
CREATE POLICY "Public read access to deputy_events"
  ON public.deputy_events
  FOR SELECT
  USING (true);

CREATE POLICY "Service role has full access to deputy_events"
  ON public.deputy_events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Create or replace the trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Electoral Programs trigger
DROP TRIGGER IF EXISTS update_deputy_electoral_programs_updated_at ON public.deputy_electoral_programs;
CREATE TRIGGER update_deputy_electoral_programs_updated_at
  BEFORE UPDATE ON public.deputy_electoral_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Achievements trigger
DROP TRIGGER IF EXISTS update_deputy_achievements_updated_at ON public.deputy_achievements;
CREATE TRIGGER update_deputy_achievements_updated_at
  BEFORE UPDATE ON public.deputy_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Events trigger
DROP TRIGGER IF EXISTS update_deputy_events_updated_at ON public.deputy_events;
CREATE TRIGGER update_deputy_events_updated_at
  BEFORE UPDATE ON public.deputy_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.deputy_electoral_programs IS 'Stores electoral program items for deputies';
COMMENT ON COLUMN public.deputy_electoral_programs.deputy_id IS 'Reference to deputy profile';
COMMENT ON COLUMN public.deputy_electoral_programs.title IS 'Title of the electoral program item';
COMMENT ON COLUMN public.deputy_electoral_programs.description IS 'Detailed description of the program item';
COMMENT ON COLUMN public.deputy_electoral_programs.image_url IS 'URL of the associated image';
COMMENT ON COLUMN public.deputy_electoral_programs.display_order IS 'Order for displaying items';

COMMENT ON TABLE public.deputy_achievements IS 'Stores achievement items for deputies';
COMMENT ON COLUMN public.deputy_achievements.deputy_id IS 'Reference to deputy profile';
COMMENT ON COLUMN public.deputy_achievements.title IS 'Title of the achievement';
COMMENT ON COLUMN public.deputy_achievements.description IS 'Detailed description of the achievement';
COMMENT ON COLUMN public.deputy_achievements.image_url IS 'URL of the associated image';
COMMENT ON COLUMN public.deputy_achievements.display_order IS 'Order for displaying items';

COMMENT ON TABLE public.deputy_events IS 'Stores event items for deputies';
COMMENT ON COLUMN public.deputy_events.deputy_id IS 'Reference to deputy profile';
COMMENT ON COLUMN public.deputy_events.title IS 'Title of the event';
COMMENT ON COLUMN public.deputy_events.description IS 'Detailed description of the event';
COMMENT ON COLUMN public.deputy_events.image_url IS 'URL of the associated image';
COMMENT ON COLUMN public.deputy_events.event_date IS 'Date when the event occurred or will occur';
COMMENT ON COLUMN public.deputy_events.display_order IS 'Order for displaying items';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these queries after executing the script to verify:

-- 1. Check if tables were created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('deputy_electoral_programs', 'deputy_achievements', 'deputy_events');

-- 2. Check table structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'deputy_electoral_programs'
-- ORDER BY ordinal_position;

-- 3. Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('deputy_electoral_programs', 'deputy_achievements', 'deputy_events');

-- 4. Check RLS policies
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('deputy_electoral_programs', 'deputy_achievements', 'deputy_events');

