-- تحديث category_id للوظائف الموجودة بناءً على category النصي

-- Update jobs with category 'customer-service'
UPDATE public.jobs
SET category_id = (SELECT id FROM public.job_categories WHERE slug = 'customer-service' LIMIT 1)
WHERE category = 'customer-service' AND category_id IS NULL;

-- Update jobs with category 'public-relations'
UPDATE public.jobs
SET category_id = (SELECT id FROM public.job_categories WHERE slug = 'public-relations' LIMIT 1)
WHERE category = 'public-relations' AND category_id IS NULL;

-- Update jobs with category 'marketing'
UPDATE public.jobs
SET category_id = (SELECT id FROM public.job_categories WHERE slug = 'marketing' LIMIT 1)
WHERE category = 'marketing' AND category_id IS NULL;

-- Update jobs with category 'technology'
UPDATE public.jobs
SET category_id = (SELECT id FROM public.job_categories WHERE slug = 'technology' LIMIT 1)
WHERE category = 'technology' AND category_id IS NULL;

-- Update jobs with category 'design'
UPDATE public.jobs
SET category_id = (SELECT id FROM public.job_categories WHERE slug = 'design' LIMIT 1)
WHERE category = 'design' AND category_id IS NULL;

-- Update jobs with category 'data-analysis'
UPDATE public.jobs
SET category_id = (SELECT id FROM public.job_categories WHERE slug = 'data-analysis' LIMIT 1)
WHERE category = 'data-analysis' AND category_id IS NULL;

-- Verify
SELECT 
  id, 
  title, 
  category, 
  category_id,
  (SELECT slug FROM public.job_categories WHERE id = jobs.category_id) as category_slug
FROM public.jobs
WHERE category_id IS NOT NULL
LIMIT 10;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Jobs category_id updated successfully';
END $$;
