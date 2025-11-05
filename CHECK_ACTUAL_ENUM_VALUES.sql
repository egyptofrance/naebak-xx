-- فحص القيم الفعلية الموجودة في complaint_status enum

-- 1. عرض جميع قيم enum
SELECT enumlabel as status_value
FROM pg_enum
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'complaint_status'
)
ORDER BY enumsortorder;

-- 2. عرض الشكاوى الموجودة وحالاتها
SELECT status::text, COUNT(*) as count
FROM complaints
GROUP BY status
ORDER BY count DESC;

-- 3. عرض عينة من الشكاوى
SELECT id, title, status::text, created_at
FROM complaints
ORDER BY created_at DESC
LIMIT 5;
