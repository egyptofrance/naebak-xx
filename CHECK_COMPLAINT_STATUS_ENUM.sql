-- فحص القيم المسموحة في complaint_status enum

SELECT 
  enumlabel as status_value
FROM pg_enum
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'complaint_status'
)
ORDER BY enumsortorder;

-- عدد الشكاوى حسب الحالة (بدون فلترة)
SELECT status, COUNT(*) as count
FROM complaints
GROUP BY status
ORDER BY count DESC;

-- إجمالي الشكاوى
SELECT COUNT(*) as total_complaints
FROM complaints;
