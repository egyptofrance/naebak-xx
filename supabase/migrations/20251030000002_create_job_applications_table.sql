-- إنشاء جدول طلبات التوظيف
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  
  -- بيانات المتقدم
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  national_id VARCHAR(50),
  date_of_birth DATE,
  governorate VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  
  -- المؤهلات والخبرة
  education_level VARCHAR(100),
  education_details TEXT,
  years_of_experience INTEGER,
  previous_experience TEXT,
  skills TEXT[],
  
  -- المرفقات
  cv_url TEXT,
  cover_letter TEXT,
  portfolio_url TEXT,
  additional_documents TEXT[],
  
  -- حالة الطلب
  status VARCHAR(50) DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_email ON public.job_applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.job_applications(created_at DESC);

-- تفعيل RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Anyone can submit application" ON public.job_applications;
DROP POLICY IF EXISTS "Only admins can view applications" ON public.job_applications;
DROP POLICY IF EXISTS "Only admins can update applications" ON public.job_applications;

-- سياسة الإنشاء: الجميع يمكنهم التقديم
CREATE POLICY "Anyone can submit application"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (true);

-- سياسة القراءة: فقط الأدمن
CREATE POLICY "Only admins can view applications"
  ON public.job_applications
  FOR SELECT
  USING (public.is_application_admin(auth.uid()));

-- سياسة التحديث: فقط الأدمن
CREATE POLICY "Only admins can update applications"
  ON public.job_applications
  FOR UPDATE
  USING (public.is_application_admin(auth.uid()));

-- محفز لتحديث updated_at
CREATE OR REPLACE FUNCTION update_job_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_job_applications_updated_at ON public.job_applications;

CREATE TRIGGER trigger_update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_applications_updated_at();
