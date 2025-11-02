-- =============================================================================
-- سكريبت إنشاء جدول الوظائف (jobs)
-- Create Jobs Table Script
-- =============================================================================

-- 1. إنشاء جدول jobs
-- ===================
CREATE TABLE IF NOT EXISTS public.jobs (
  -- المعرفات الأساسية
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات الوظيفة الأساسية
  title TEXT NOT NULL,                          -- عنوان الوظيفة
  description TEXT NOT NULL,                    -- الوصف التفصيلي
  company_name TEXT,                            -- اسم الشركة/الجهة
  
  -- التصنيف والموقع (Foreign Keys)
  category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,  -- التصنيف
  governorate_id UUID REFERENCES public.governorates(id) ON DELETE SET NULL, -- المحافظة
  
  -- معلومات الاتصال
  contact_person TEXT,                          -- الشخص المسؤول
  contact_phone TEXT,                           -- رقم الهاتف
  contact_email TEXT,                           -- البريد الإلكتروني
  
  -- تفاصيل الوظيفة
  requirements TEXT,                            -- المتطلبات
  responsibilities TEXT,                        -- المسؤوليات
  benefits TEXT,                                -- المزايا
  
  -- معلومات الراتب
  salary_min NUMERIC(10, 2),                    -- الحد الأدنى للراتب
  salary_max NUMERIC(10, 2),                    -- الحد الأقصى للراتب
  salary_currency TEXT DEFAULT 'EGP',           -- العملة
  
  -- نوع الوظيفة ومكان العمل
  work_location TEXT NOT NULL DEFAULT 'on_site', -- مكان العمل: on_site, remote, hybrid
  job_type TEXT NOT NULL DEFAULT 'full_time',    -- نوع الوظيفة: full_time, part_time, contract, internship
  
  -- معلومات إضافية
  experience_years INTEGER,                     -- سنوات الخبرة المطلوبة
  education_level TEXT,                         -- المستوى التعليمي
  positions_available INTEGER DEFAULT 1,        -- عدد الوظائف المتاحة
  
  -- الحالة والرؤية
  status TEXT NOT NULL DEFAULT 'draft',         -- الحالة: draft, published, closed
  is_featured BOOLEAN DEFAULT false,            -- مميزة؟
  
  -- الصورة
  image_url TEXT,                               -- رابط صورة الوظيفة
  
  -- تواريخ مهمة
  published_at TIMESTAMP WITH TIME ZONE,        -- تاريخ النشر
  expires_at TIMESTAMP WITH TIME ZONE,          -- تاريخ انتهاء الصلاحية
  
  -- معلومات التتبع
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- قيود إضافية
  CONSTRAINT valid_salary CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max),
  CONSTRAINT valid_work_location CHECK (work_location IN ('on_site', 'remote', 'hybrid')),
  CONSTRAINT valid_job_type CHECK (job_type IN ('full_time', 'part_time', 'contract', 'internship', 'temporary')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'closed'))
);

-- 2. إنشاء جدول job_applications (إذا لم يكن موجوداً)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.job_applications (
  -- المعرفات الأساسية
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- ربط بالوظيفة والمستخدم
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- معلومات المتقدم
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- المستندات
  cv_url TEXT,                                  -- رابط السيرة الذاتية
  cover_letter TEXT,                            -- خطاب التقديم
  portfolio_url TEXT,                           -- رابط الأعمال
  additional_documents JSONB,                   -- مستندات إضافية
  
  -- الحالة
  status TEXT NOT NULL DEFAULT 'pending',       -- pending, reviewed, shortlisted, rejected, accepted
  admin_notes TEXT,                             -- ملاحظات الأدمن
  
  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- قيود
  CONSTRAINT valid_application_status CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'))
);

-- 3. إنشاء جدول job_statistics (إذا لم يكن موجوداً)
-- ====================================================
CREATE TABLE IF NOT EXISTS public.job_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE UNIQUE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إنشاء Indexes للأداء
-- ========================
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON public.jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_governorate_id ON public.jobs(governorate_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON public.jobs(published_at);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON public.jobs(expires_at);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON public.job_applications(created_at);

CREATE INDEX IF NOT EXISTS idx_job_statistics_job_id ON public.job_statistics(job_id);

-- 5. إنشاء Triggers لتحديث updated_at تلقائياً
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_statistics_updated_at ON public.job_statistics;
CREATE TRIGGER update_job_statistics_updated_at
  BEFORE UPDATE ON public.job_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. إنشاء Trigger لإنشاء job_statistics تلقائياً
-- ==================================================
CREATE OR REPLACE FUNCTION create_job_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.job_statistics (job_id)
  VALUES (NEW.id)
  ON CONFLICT (job_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_job_statistics_trigger ON public.jobs;
CREATE TRIGGER create_job_statistics_trigger
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_statistics();

-- 7. إعداد Row Level Security (RLS)
-- ===================================

-- تفعيل RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_statistics ENABLE ROW LEVEL SECURITY;

-- سياسات jobs
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة الوظائف المنشورة" ON public.jobs;
CREATE POLICY "الجميع يمكنهم قراءة الوظائف المنشورة"
  ON public.jobs FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "الأدمن يمكنهم قراءة جميع الوظائف" ON public.jobs;
CREATE POLICY "الأدمن يمكنهم قراءة جميع الوظائف"
  ON public.jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'admin')
    )
  );

DROP POLICY IF EXISTS "الأدمن يمكنهم إدارة الوظائف" ON public.jobs;
CREATE POLICY "الأدمن يمكنهم إدارة الوظائف"
  ON public.jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'admin')
    )
  );

-- سياسات job_applications
DROP POLICY IF EXISTS "المستخدمون يمكنهم قراءة تقديماتهم" ON public.job_applications;
CREATE POLICY "المستخدمون يمكنهم قراءة تقديماتهم"
  ON public.job_applications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "المستخدمون يمكنهم التقديم" ON public.job_applications;
CREATE POLICY "المستخدمون يمكنهم التقديم"
  ON public.job_applications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "الأدمن يمكنهم إدارة التقديمات" ON public.job_applications;
CREATE POLICY "الأدمن يمكنهم إدارة التقديمات"
  ON public.job_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'admin')
    )
  );

-- سياسات job_statistics
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة الإحصائيات" ON public.job_statistics;
CREATE POLICY "الجميع يمكنهم قراءة الإحصائيات"
  ON public.job_statistics FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "النظام يمكنه تحديث الإحصائيات" ON public.job_statistics;
CREATE POLICY "النظام يمكنه تحديث الإحصائيات"
  ON public.job_statistics FOR ALL
  USING (true);

-- 8. إضافة تعليقات للتوثيق
-- ==========================
COMMENT ON TABLE public.jobs IS 'جدول الوظائف المتاحة في المنصة';
COMMENT ON TABLE public.job_applications IS 'جدول التقديمات على الوظائف';
COMMENT ON TABLE public.job_statistics IS 'جدول إحصائيات الوظائف';

COMMENT ON COLUMN public.jobs.category_id IS 'معرف تصنيف الوظيفة (Foreign Key to job_categories)';
COMMENT ON COLUMN public.jobs.governorate_id IS 'معرف المحافظة (Foreign Key to governorates)';
COMMENT ON COLUMN public.jobs.work_location IS 'مكان العمل: on_site (من المقر), remote (عن بُعد), hybrid (مختلط)';
COMMENT ON COLUMN public.jobs.job_type IS 'نوع الوظيفة: full_time (دوام كامل), part_time (دوام جزئي), contract (عقد), internship (تدريب), temporary (مؤقت)';
COMMENT ON COLUMN public.jobs.status IS 'حالة الوظيفة: draft (مسودة), published (منشورة), closed (مغلقة)';

-- =============================================================================
-- ✅ انتهى السكريبت بنجاح
-- =============================================================================

-- للتحقق من نجاح الإنشاء، قم بتشغيل:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'job%';
