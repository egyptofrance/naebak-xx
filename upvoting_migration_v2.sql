-- ============================================================================
-- Migration: Add Upvoting System for Complaints
-- Date: 2025-11-01
-- Instructions: Copy and paste this entire file into Supabase SQL Editor and run
-- ============================================================================

-- 1. Create complaint_votes table
-- ============================================================================

CREATE TABLE IF NOT EXISTS complaint_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints to prevent duplicate votes
  CONSTRAINT unique_user_vote UNIQUE(complaint_id, user_id),
  CONSTRAINT unique_ip_vote UNIQUE(complaint_id, ip_address),
  
  -- At least one of user_id or ip_address must be present
  CONSTRAINT check_user_or_ip CHECK (
    (user_id IS NOT NULL AND ip_address IS NULL) OR 
    (user_id IS NULL AND ip_address IS NOT NULL)
  )
);

-- Add indexes for performance
CREATE INDEX idx_complaint_votes_complaint_id ON complaint_votes(complaint_id);
CREATE INDEX idx_complaint_votes_user_id ON complaint_votes(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_complaint_votes_ip_address ON complaint_votes(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX idx_complaint_votes_created_at ON complaint_votes(created_at DESC);

-- Add comment
COMMENT ON TABLE complaint_votes IS 'Stores upvotes for complaints. Each user/IP can vote once per complaint.';


-- 2. Add votes_count column to complaints
-- ============================================================================

ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS votes_count INTEGER DEFAULT 0 NOT NULL;

-- Add index for sorting by votes
CREATE INDEX IF NOT EXISTS idx_complaints_votes_count ON complaints(votes_count DESC);

-- Update existing complaints to have votes_count = 0
UPDATE complaints SET votes_count = 0 WHERE votes_count IS NULL;

-- Add comment
COMMENT ON COLUMN complaints.votes_count IS 'Cached count of upvotes for this complaint. Updated automatically by trigger.';


-- 3. Create function to update votes_count automatically
-- ============================================================================

CREATE OR REPLACE FUNCTION update_complaint_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment votes_count when a vote is added
    UPDATE complaints 
    SET votes_count = votes_count + 1 
    WHERE id = NEW.complaint_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement votes_count when a vote is removed (never go below 0)
    UPDATE complaints 
    SET votes_count = GREATEST(votes_count - 1, 0)
    WHERE id = OLD.complaint_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION update_complaint_votes_count() IS 'Automatically updates votes_count in complaints when votes are added or removed.';


-- 4. Create trigger
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_update_complaint_votes_count ON complaint_votes;

CREATE TRIGGER trigger_update_complaint_votes_count
AFTER INSERT OR DELETE ON complaint_votes
FOR EACH ROW
EXECUTE FUNCTION update_complaint_votes_count();

-- Add comment
COMMENT ON TRIGGER trigger_update_complaint_votes_count ON complaint_votes IS 'Keeps votes_count in sync with actual vote count.';


-- 5. Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE complaint_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view votes" ON complaint_votes;
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON complaint_votes;
DROP POLICY IF EXISTS "Anonymous users can insert votes" ON complaint_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON complaint_votes;

-- Policy: Anyone can view votes
CREATE POLICY "Anyone can view votes"
ON complaint_votes
FOR SELECT
USING (true);

-- Policy: Authenticated users can insert their own votes
CREATE POLICY "Authenticated users can insert votes"
ON complaint_votes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can insert votes (using IP)
CREATE POLICY "Anonymous users can insert votes"
ON complaint_votes
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL AND ip_address IS NOT NULL);

-- Policy: Users can delete their own votes
CREATE POLICY "Users can delete their own votes"
ON complaint_votes
FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND ip_address IS NOT NULL)
);


-- 6. Grant permissions
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON complaint_votes TO authenticated;
GRANT INSERT ON complaint_votes TO authenticated;
GRANT DELETE ON complaint_votes TO authenticated;

-- Grant access to anonymous users
GRANT SELECT ON complaint_votes TO anon;
GRANT INSERT ON complaint_votes TO anon;
GRANT DELETE ON complaint_votes TO anon;


-- ============================================================================
-- Migration Complete - Verification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Upvoting system migration completed successfully!';
  RAISE NOTICE '✅ Tables created: complaint_votes';
  RAISE NOTICE '✅ Columns added: complaints.votes_count';
  RAISE NOTICE '✅ Triggers created: trigger_update_complaint_votes_count';
  RAISE NOTICE '✅ RLS policies enabled';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Next steps:';
  RAISE NOTICE '1. Verify tables exist: SELECT * FROM complaint_votes LIMIT 1;';
  RAISE NOTICE '2. Check votes_count: SELECT id, title, votes_count FROM complaints LIMIT 5;';
  RAISE NOTICE '3. Deploy the application code';
END $$;
