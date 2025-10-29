-- إنشاء جدول إحصائيات الوظائف
CREATE TABLE IF NOT EXISTS public.job_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id)
);

-- فهرس
CREATE INDEX idx_job_statistics_job_id ON public.job_statistics(job_id);

-- تفعيل RLS
ALTER TABLE public.job_statistics ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع
CREATE POLICY "Anyone can view job statistics"
  ON public.job_statistics
  FOR SELECT
  USING (true);

-- سياسة الإدارة: فقط النظام (عبر الدوال)
CREATE POLICY "Only system can manage statistics"
  ON public.job_statistics
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- دالة لزيادة عدد المشاهدات
CREATE OR REPLACE FUNCTION increment_job_views(job_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.job_statistics (job_id, views_count, last_viewed_at)
  VALUES (job_uuid, 1, NOW())
  ON CONFLICT (job_id)
  DO UPDATE SET
    views_count = job_statistics.views_count + 1,
    last_viewed_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لزيادة عدد الطلبات
CREATE OR REPLACE FUNCTION increment_job_applications(job_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.job_statistics (job_id, applications_count)
  VALUES (job_uuid, 1)
  ON CONFLICT (job_id)
  DO UPDATE SET
    applications_count = job_statistics.applications_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- محفز لتحديث updated_at
CREATE OR REPLACE FUNCTION update_job_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_statistics_updated_at
  BEFORE UPDATE ON public.job_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_job_statistics_updated_at();
