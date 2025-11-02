-- التحقق من RLS policies للوظائف

-- 1. عرض جميع policies الموجودة
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'jobs';

-- 2. التحقق من RLS enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'jobs';

-- 3. اختبار: عرض الوظائف بدون authentication
SELECT 
  id,
  title,
  company_name,
  category,
  category_id,
  status,
  is_company_ad
FROM public.jobs
WHERE status = 'active'
LIMIT 10;

-- 4. إذا كانت RLS تمنع العرض، نضيف policy للقراءة العامة
DO $$
BEGIN
  -- حذف policy القديم إن وجد
  DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
  
  -- إنشاء policy جديد
  CREATE POLICY "Anyone can view active jobs"
    ON public.jobs
    FOR SELECT
    USING (status = 'active');
    
  RAISE NOTICE '✅ RLS policy for public job viewing created';
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'ℹ️ Policy already exists';
END $$;

-- 5. التحقق مرة أخرى
SELECT 
  COUNT(*) as total_active_jobs
FROM public.jobs
WHERE status = 'active';
