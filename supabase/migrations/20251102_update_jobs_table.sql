-- تحديث جدول jobs لربطه بالشركات
-- Update jobs table to link with companies

-- إضافة حقول جديدة
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON public.jobs(created_by_user_id);

-- تحديث RLS Policies
-- الشركات يمكنها إدارة وظائفها فقط
CREATE POLICY "Companies can view own jobs"
  ON public.jobs FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can insert own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update own jobs"
  ON public.jobs FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can delete own jobs"
  ON public.jobs FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
  );

-- Comments
COMMENT ON COLUMN public.jobs.company_id IS 'Reference to the company that posted this job';
COMMENT ON COLUMN public.jobs.created_by_user_id IS 'User ID who created this job (admin or company)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ jobs table updated successfully';
  RAISE NOTICE '✅ company_id and created_by_user_id columns added';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ RLS policies for companies created';
END $$;
