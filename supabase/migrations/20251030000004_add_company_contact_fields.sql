-- إضافة حقول الشركة والتواصل إلى جدول الوظائف
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS posted_by UUID REFERENCES auth.users(id);

-- إضافة تعليقات توضيحية
COMMENT ON COLUMN public.jobs.company_name IS 'اسم الشركة أو الجهة المعلنة';
COMMENT ON COLUMN public.jobs.contact_person IS 'اسم الشخص المسؤول عن التوظيف';
COMMENT ON COLUMN public.jobs.contact_phone IS 'رقم هاتف التواصل';
COMMENT ON COLUMN public.jobs.contact_email IS 'البريد الإلكتروني للتواصل (اختياري)';
COMMENT ON COLUMN public.jobs.posted_by IS 'المستخدم الذي أضاف الوظيفة';

-- تحديث سياسة الإنشاء للسماح للمستخدمين المسجلين بإضافة وظائف
DROP POLICY IF EXISTS "Allow admins to insert jobs" ON public.jobs;

CREATE POLICY "Allow authenticated users to insert jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- تحديث سياسة التعديل للسماح للمستخدم بتعديل وظائفه الخاصة
DROP POLICY IF EXISTS "Allow admins to update jobs" ON public.jobs;

CREATE POLICY "Allow users to update their own jobs and admins to update all"
ON public.jobs
FOR UPDATE
TO authenticated
USING (
  posted_by = auth.uid() OR public.is_application_admin(auth.uid())
)
WITH CHECK (
  posted_by = auth.uid() OR public.is_application_admin(auth.uid())
);

-- تحديث سياسة الحذف
DROP POLICY IF EXISTS "Allow admins to delete jobs" ON public.jobs;

CREATE POLICY "Allow users to delete their own jobs and admins to delete all"
ON public.jobs
FOR DELETE
TO authenticated
USING (
  posted_by = auth.uid() OR public.is_application_admin(auth.uid())
);
