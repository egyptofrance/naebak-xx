-- إنشاء جدول الوظائف
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(10) DEFAULT 'EGP',
  work_location VARCHAR(50) NOT NULL, -- 'office', 'remote', 'hybrid'
  office_address TEXT,
  work_hours TEXT, -- مثال: "9 صباحاً - 5 مساءً"
  employment_type VARCHAR(50) NOT NULL, -- 'full-time', 'part-time', 'contract', 'internship'
  category VARCHAR(100) NOT NULL, -- 'data-entry', 'management', 'public-relations', etc.
  governorate VARCHAR(100), -- للوظائف في المحافظات
  requirements TEXT[], -- متطلبات الوظيفة
  responsibilities TEXT[], -- المسؤوليات
  benefits TEXT[], -- المزايا
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'closed', 'draft'
  positions_available INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- فهارس للأداء
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_governorate ON public.jobs(governorate);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

-- تفعيل RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع يمكنهم قراءة الوظائف النشطة
CREATE POLICY "Anyone can view active jobs"
  ON public.jobs
  FOR SELECT
  USING (status = 'active');

-- سياسة الإدارة: فقط الأدمن
CREATE POLICY "Only admins can manage jobs"
  ON public.jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user
      WHERE user.id = auth.uid()
      AND user.role = 'admin'
    )
  );

-- محفز لتحديث updated_at
CREATE OR REPLACE FUNCTION update_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_jobs_updated_at();
