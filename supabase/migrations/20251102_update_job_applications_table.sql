-- تحديث جدول job_applications لنظام التوظيف المتكامل
-- Update job_applications table for complete employment system

-- إضافة حقول جديدة
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS employment_profile_id UUID REFERENCES public.user_employment_profiles(id),
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS company_notes TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_profile ON public.job_applications(employment_profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_reviewed_by ON public.job_applications(reviewed_by);

-- Constraint
ALTER TABLE public.job_applications
  ADD CONSTRAINT IF NOT EXISTS valid_application_status 
  CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'));

-- تحديث RLS Policies
-- المتقدمون يمكنهم رؤية طلباتهم فقط
CREATE POLICY "Users can view own applications"
  ON public.job_applications FOR SELECT
  USING (
    applicant_id = auth.uid() OR
    employment_profile_id IN (
      SELECT id FROM public.user_employment_profiles WHERE user_id = auth.uid()
    )
  );

-- الشركات يمكنها رؤية الطلبات لوظائفها فقط
CREATE POLICY "Companies can view applications for their jobs"
  ON public.job_applications FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs WHERE company_id IN (
        SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- الشركات يمكنها تحديث حالة الطلبات لوظائفها
CREATE POLICY "Companies can update applications for their jobs"
  ON public.job_applications FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM public.jobs WHERE company_id IN (
        SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Comments
COMMENT ON COLUMN public.job_applications.employment_profile_id IS 'Reference to the user employment profile (CV)';
COMMENT ON COLUMN public.job_applications.status IS 'Application status: pending, reviewing, shortlisted, accepted, rejected';
COMMENT ON COLUMN public.job_applications.reviewed_at IS 'When the application was reviewed';
COMMENT ON COLUMN public.job_applications.reviewed_by IS 'User ID who reviewed the application (company or admin)';
COMMENT ON COLUMN public.job_applications.company_notes IS 'Private notes from the company about this application';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ job_applications table updated successfully';
  RAISE NOTICE '✅ New columns added: employment_profile_id, status, reviewed_at, reviewed_by, company_notes';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ Status constraint added';
  RAISE NOTICE '✅ RLS policies for companies created';
END $$;
