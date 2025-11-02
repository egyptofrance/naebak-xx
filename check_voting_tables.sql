-- Check if voting tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('complaint_votes', 'complaint_downvotes')
ORDER BY table_name;

-- Check if voting columns exist in complaints table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'complaints'
  AND column_name IN ('votes_count', 'upvotes_count', 'downvotes_count')
ORDER BY column_name;

-- Check all columns in complaints table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'complaints'
ORDER BY ordinal_position;
