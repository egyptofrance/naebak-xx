-- Check if is_public and admin_approved_public columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'complaints'
  AND column_name IN ('is_public', 'admin_approved_public')
ORDER BY column_name;

-- Check sample data
SELECT id, title, is_public, admin_approved_public
FROM complaints
LIMIT 5;

