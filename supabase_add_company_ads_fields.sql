-- إضافة حقول إعلانات الشركات لجدول jobs
-- Add company advertisement fields to jobs table

-- إضافة حقل company_phone (رقم تليفون الشركة للإعلانات)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS company_phone VARCHAR(20);

-- إضافة حقل is_company_ad (لتمييز إعلانات الشركات عن الوظائف العادية)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS is_company_ad BOOLEAN DEFAULT FALSE;

-- إضافة تعليق على الحقول
COMMENT ON COLUMN jobs.company_phone IS 'رقم تليفون الشركة للإعلانات - يظهر للمتقدمين';
COMMENT ON COLUMN jobs.is_company_ad IS 'هل هذا إعلان شركة؟ true = إعلان شركة، false = وظيفة عادية';

-- إنشاء index للبحث السريع عن إعلانات الشركات
CREATE INDEX IF NOT EXISTS idx_jobs_is_company_ad ON jobs(is_company_ad) WHERE is_company_ad = true;

-- تحديث RLS policies لإعلانات الشركات
-- السماح للشركات بإضافة إعلانات (سيتم التحكم بها لاحقاً)
-- الآن نسمح للجميع بقراءة الإعلانات النشطة
