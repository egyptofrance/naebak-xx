-- ============================================
-- STEP 1: CLEANUP - Delete existing tables
-- ============================================
-- This is safe - it only deletes the new tables, not deputy_profiles

DROP TABLE IF EXISTS public.deputy_electoral_programs CASCADE;
DROP TABLE IF EXISTS public.deputy_achievements CASCADE;
DROP TABLE IF EXISTS public.deputy_events CASCADE;

-- ============================================
-- STEP 2: CREATE - Create fresh tables
-- ============================================

-- 1. Deputy Electoral Programs
CREATE TABLE public.deputy_electoral_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deputy_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Deputy Achievements
CREATE TABLE public.deputy_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deputy_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Deputy Events
CREATE TABLE public.deputy_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deputy_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date DATE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STEP 3: ADD FOREIGN KEYS
-- ============================================

ALTER TABLE public.deputy_electoral_programs
  ADD FOREIGN KEY (deputy_id) REFERENCES public.deputy_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.deputy_achievements
  ADD FOREIGN KEY (deputy_id) REFERENCES public.deputy_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.deputy_events
  ADD FOREIGN KEY (deputy_id) REFERENCES public.deputy_profiles(id) ON DELETE CASCADE;

-- ============================================
-- STEP 4: ADD INDEXES
-- ============================================

CREATE INDEX idx_dep_electoral_programs_deputy_id ON public.deputy_electoral_programs(deputy_id);
CREATE INDEX idx_dep_electoral_programs_order ON public.deputy_electoral_programs(display_order);

CREATE INDEX idx_dep_achievements_deputy_id ON public.deputy_achievements(deputy_id);
CREATE INDEX idx_dep_achievements_order ON public.deputy_achievements(display_order);

CREATE INDEX idx_dep_events_deputy_id ON public.deputy_events(deputy_id);
CREATE INDEX idx_dep_events_order ON public.deputy_events(display_order);
CREATE INDEX idx_dep_events_date ON public.deputy_events(event_date);

-- ============================================
-- STEP 5: ENABLE RLS
-- ============================================

ALTER TABLE public.deputy_electoral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deputy_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deputy_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: CREATE RLS POLICIES
-- ============================================

-- Electoral Programs: Public read
CREATE POLICY "public_read_electoral_programs" 
  ON public.deputy_electoral_programs 
  FOR SELECT 
  USING (true);

-- Achievements: Public read
CREATE POLICY "public_read_achievements" 
  ON public.deputy_achievements 
  FOR SELECT 
  USING (true);

-- Events: Public read
CREATE POLICY "public_read_events" 
  ON public.deputy_events 
  FOR SELECT 
  USING (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('deputy_electoral_programs', 'deputy_achievements', 'deputy_events')
ORDER BY table_name;

