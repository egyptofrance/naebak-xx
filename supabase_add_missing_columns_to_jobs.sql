-- =============================================================================
-- سكريبت إضافة الأعمدة الناقصة لجدول jobs
-- Add Missing Columns to Jobs Table
-- =============================================================================

-- 1. إضافة عمود category_id (ربط بجدول job_categories)
-- ========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'jobs' 
    AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.jobs 
    ADD COLUMN category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'تم إضافة عمود category_id';
  ELSE
    RAISE NOTICE 'عمود category_id موجود مسبقاً';
  END IF;
END $$;

-- 2. إضافة عمود governorate_id (ربط بجدول governorates)
-- ========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'jobs' 
    AND column_name = 'governorate_id'
  ) THEN
    ALTER TABLE public.jobs 
    ADD COLUMN governorate_id UUID REFERENCES public.governorates(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'تم إضافة عمود governorate_id';
  ELSE
    RAISE NOTICE 'عمود governorate_id موجود مسبقاً';
  END IF;
END $$;

-- 3. إنشاء Indexes للأداء
-- ========================
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON public.jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_governorate_id ON public.jobs(governorate_id);

-- 4. إضافة تعليقات للتوثيق
-- ==========================
COMMENT ON COLUMN public.jobs.category_id IS 'معرف تصنيف الوظيفة (Foreign Key to job_categories)';
COMMENT ON COLUMN public.jobs.governorate_id IS 'معرف المحافظة (Foreign Key to governorates)';

-- =============================================================================
-- ✅ انتهى السكريبت بنجاح
-- =============================================================================

-- للتحقق من نجاح الإضافة، قم بتشغيل:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'jobs' AND column_name IN ('category_id', 'governorate_id');
