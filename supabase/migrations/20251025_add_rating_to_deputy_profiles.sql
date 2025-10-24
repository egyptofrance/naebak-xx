-- Add rating columns to deputy_profiles table
ALTER TABLE deputy_profiles
ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS initial_rating_average DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS initial_rating_count INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN deputy_profiles.rating_average IS 'Current average rating (1-5 stars) including initial values';
COMMENT ON COLUMN deputy_profiles.rating_count IS 'Total number of ratings including initial count';
COMMENT ON COLUMN deputy_profiles.initial_rating_average IS 'Initial rating set by admin (used as starting point)';
COMMENT ON COLUMN deputy_profiles.initial_rating_count IS 'Initial rating count set by admin (used as starting point)';

-- Create deputy_ratings table to store individual ratings
CREATE TABLE IF NOT EXISTS deputy_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deputy_id UUID NOT NULL REFERENCES deputy_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one rating per user per deputy
  UNIQUE(deputy_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_deputy_ratings_deputy_id ON deputy_ratings(deputy_id);
CREATE INDEX IF NOT EXISTS idx_deputy_ratings_user_id ON deputy_ratings(user_id);

-- Add RLS policies for deputy_ratings table
ALTER TABLE deputy_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view ratings
CREATE POLICY "Anyone can view deputy ratings"
  ON deputy_ratings
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own ratings
CREATE POLICY "Users can insert their own ratings"
  ON deputy_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON deputy_ratings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON deputy_ratings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to recalculate deputy rating average
CREATE OR REPLACE FUNCTION recalculate_deputy_rating(p_deputy_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_ratings_sum INTEGER;
  v_user_ratings_count INTEGER;
  v_initial_average DECIMAL(3,2);
  v_initial_count INTEGER;
  v_total_sum DECIMAL;
  v_total_count INTEGER;
  v_new_average DECIMAL(3,2);
BEGIN
  -- Get initial values set by admin
  SELECT initial_rating_average, initial_rating_count
  INTO v_initial_average, v_initial_count
  FROM deputy_profiles
  WHERE id = p_deputy_id;
  
  -- Get user ratings sum and count
  SELECT COALESCE(SUM(rating), 0), COALESCE(COUNT(*), 0)
  INTO v_user_ratings_sum, v_user_ratings_count
  FROM deputy_ratings
  WHERE deputy_id = p_deputy_id;
  
  -- Calculate total
  v_total_sum := (v_initial_average * v_initial_count) + v_user_ratings_sum;
  v_total_count := v_initial_count + v_user_ratings_count;
  
  -- Calculate new average
  IF v_total_count > 0 THEN
    v_new_average := v_total_sum / v_total_count;
  ELSE
    v_new_average := 0.00;
  END IF;
  
  -- Update deputy_profiles
  UPDATE deputy_profiles
  SET 
    rating_average = v_new_average,
    rating_count = v_total_count
  WHERE id = p_deputy_id;
END;
$$;

-- Trigger to recalculate rating after insert/update/delete
CREATE OR REPLACE FUNCTION trigger_recalculate_deputy_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_deputy_rating(OLD.deputy_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_deputy_rating(NEW.deputy_id);
    RETURN NEW;
  END IF;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_deputy_rating_insert ON deputy_ratings;
CREATE TRIGGER trigger_deputy_rating_insert
  AFTER INSERT ON deputy_ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_deputy_rating();

DROP TRIGGER IF EXISTS trigger_deputy_rating_update ON deputy_ratings;
CREATE TRIGGER trigger_deputy_rating_update
  AFTER UPDATE ON deputy_ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_deputy_rating();

DROP TRIGGER IF EXISTS trigger_deputy_rating_delete ON deputy_ratings;
CREATE TRIGGER trigger_deputy_rating_delete
  AFTER DELETE ON deputy_ratings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_deputy_rating();

