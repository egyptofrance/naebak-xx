-- إنشاء جدول الوظائف
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(10) DEFAULT 'EGP',
  work_location VARCHAR(50) NOT NULL,
  office_address TEXT,
  work_hours TEXT,
  employment_type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  governorate VARCHAR(100),
  requirements TEXT[],
  responsibilities TEXT[],
  benefits TEXT[],
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  positions_available INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_governorate ON public.jobs(governorate);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- تفعيل RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Only admins can manage jobs" ON public.jobs;

-- سياسة القراءة: الجميع يمكنهم قراءة الوظائف النشطة
CREATE POLICY "Anyone can view active jobs"
  ON public.jobs
  FOR SELECT
  USING (status = 'active');

-- سياسة الإدارة: فقط الأدمن
CREATE POLICY "Only admins can manage jobs"
  ON public.jobs
  FOR ALL
  USING (public.is_application_admin(auth.uid()));

-- محفز لتحديث updated_at
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_jobs_updated_at ON public.jobs;

CREATE TRIGGER trigger_update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_jobs_updated_at();
