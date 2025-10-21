-- ============================================
-- CREATE DEPUTY CONTENT TABLES - SIMPLE VERSION
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

-- Add Foreign Keys
ALTER TABLE public.deputy_electoral_programs
  ADD FOREIGN KEY (deputy_id) REFERENCES public.deputy_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.deputy_achievements
  ADD FOREIGN KEY (deputy_id) REFERENCES public.deputy_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.deputy_events
  ADD FOREIGN KEY (deputy_id) REFERENCES public.deputy_profiles(id) ON DELETE CASCADE;

-- Add Indexes
CREATE INDEX ON public.deputy_electoral_programs(deputy_id);
CREATE INDEX ON public.deputy_achievements(deputy_id);
CREATE INDEX ON public.deputy_events(deputy_id);

-- Enable RLS
ALTER TABLE public.deputy_electoral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deputy_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deputy_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Public read, service role write)
CREATE POLICY "Anyone can read" ON public.deputy_electoral_programs FOR SELECT USING (true);
CREATE POLICY "Anyone can read" ON public.deputy_achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can read" ON public.deputy_events FOR SELECT USING (true);

