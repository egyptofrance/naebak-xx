-- Add scroll_speed column to breaking_news table
-- Migration: 20251029000004_add_scroll_speed_to_breaking_news.sql

-- Add scroll_speed column (default 50 pixels per second)
ALTER TABLE public.breaking_news 
ADD COLUMN IF NOT EXISTS scroll_speed INTEGER DEFAULT 50 CHECK (scroll_speed >= 10 AND scroll_speed <= 200);

-- Add comment
COMMENT ON COLUMN public.breaking_news.scroll_speed IS 'Scroll speed in pixels per second (10-200)';
