-- التحقق من governorate_id للوظائف

-- 1. عرض الوظائف بدون governorate_id
SELECT 
  id,
  title,
  governorate,
  governorate_id
FROM public.jobs
WHERE governorate_id IS NULL
LIMIT 10;

-- 2. تحديث governorate_id بناءً على governorate النصي
UPDATE public.jobs
SET governorate_id = (
  SELECT id 
  FROM public.governorates 
  WHERE name_ar = jobs.governorate 
  LIMIT 1
)
WHERE governorate_id IS NULL 
  AND governorate IS NOT NULL;

-- 3. التحقق من النتائج
SELECT 
  COUNT(*) as total_jobs,
  COUNT(governorate_id) as jobs_with_governorate_id,
  COUNT(*) - COUNT(governorate_id) as jobs_without_governorate_id
FROM public.jobs;

-- 4. عرض عينة من الوظائف بعد التحديث
SELECT 
  id,
  title,
  category,
  governorate,
  governorate_id,
  status
FROM public.jobs
WHERE status = 'active'
LIMIT 10;

RAISE NOTICE '✅ Governorate IDs updated successfully';
