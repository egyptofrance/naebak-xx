-- تحديث جدول job_applications لنظام التوظيف المتكامل
-- Update job_applications table for complete employment system

-- إضافة حقول جديدة
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS employment_profile_id UUID REFERENCES public.user_employment_profiles(id),
  ADD COLUMN IF NOT EXISTS company_notes TEXT;

-- تحديث status column (موجود بالفعل، لكن نتأكد من القيم)
-- status column already exists, just ensure valid values

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_profile ON public.job_applications(employment_profile_id);

-- Constraint (using DO block to check if exists)
DO $$
BEGIN
  -- حذف constraint القديم إن وجد
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'valid_application_status'
  ) THEN
    ALTER TABLE public.job_applications DROP CONSTRAINT valid_application_status;
  END IF;
  
  -- إضافة constraint جديد
  ALTER TABLE public.job_applications
    ADD CONSTRAINT valid_application_status 
    CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'accepted', 'rejected'));
END $$;

-- حذف RLS Policies القديمة
DROP POLICY IF EXISTS "Anyone can submit application" ON public.job_applications;
DROP POLICY IF EXISTS "Only admins can view applications" ON public.job_applications;
DROP POLICY IF EXISTS "Only admins can update applications" ON public.job_applications;

-- RLS Policies الجديدة

-- 1. الجميع يمكنهم التقديم (مع أو بدون تسجيل)
CREATE POLICY "Anyone can submit application"
  ON public.job_applications FOR INSERT
  WITH CHECK (true);

-- 2. المستخدمون المسجلون يمكنهم رؤية طلباتهم فقط
CREATE POLICY "Users can view own applications"
  ON public.job_applications FOR SELECT
  USING (
    user_id = auth.uid() OR
    employment_profile_id IN (
      SELECT id FROM public.user_employment_profiles WHERE user_id = auth.uid()
    )
  );

-- 3. المستخدمون يمكنهم تحديث طلباتهم (قبل المراجعة)
CREATE POLICY "Users can update own pending applications"
  ON public.job_applications FOR UPDATE
  USING (
    user_id = auth.uid() AND status = 'pending'
  );

-- 4. الشركات يمكنها رؤية الطلبات لوظائفها فقط
CREATE POLICY "Companies can view applications for their jobs"
  ON public.job_applications FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM public.jobs WHERE company_id IN (
        SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 5. الشركات يمكنها تحديث حالة الطلبات لوظائفها
CREATE POLICY "Companies can update applications for their jobs"
  ON public.job_applications FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM public.jobs WHERE company_id IN (
        SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 6. الأدمن يمكنه كل شيء
CREATE POLICY "Admins can manage all applications"
  ON public.job_applications FOR ALL
  USING (public.is_application_admin(auth.uid()));

-- Comments
COMMENT ON COLUMN public.job_applications.user_id IS 'Reference to the user who submitted this application (if registered)';
COMMENT ON COLUMN public.job_applications.employment_profile_id IS 'Reference to the user employment profile (CV)';
COMMENT ON COLUMN public.job_applications.status IS 'Application status: pending, reviewing, shortlisted, accepted, rejected';
COMMENT ON COLUMN public.job_applications.company_notes IS 'Private notes from the company about this application';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ job_applications table updated successfully';
  RAISE NOTICE '✅ New columns added: user_id, employment_profile_id, company_notes';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ Status constraint updated';
  RAISE NOTICE '✅ RLS policies updated for users, companies, and admins';
END $$;
