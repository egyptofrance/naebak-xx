-- ====================================================
-- Migration: إنشاء جدول تصنيفات الوظائف (job_categories)
-- التاريخ: 2 نوفمبر 2025
-- الهدف: جعل تصنيفات الوظائف ديناميكية وقابلة للإدارة
-- ====================================================

-- 1. إنشاء جدول job_categories
CREATE TABLE IF NOT EXISTS public.job_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar TEXT NOT NULL UNIQUE,           -- الاسم بالعربية (مطلوب وفريد)
  name_en TEXT,                            -- الاسم بالإنجليزية (اختياري)
  slug TEXT NOT NULL UNIQUE,               -- معرف فريد للاستخدام في URLs
  description TEXT,                        -- وصف التصنيف
  icon TEXT,                               -- أيقونة التصنيف (اختياري)
  is_active BOOLEAN DEFAULT true,          -- هل التصنيف نشط؟
  display_order INTEGER DEFAULT 0,         -- ترتيب العرض
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. إضافة فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_job_categories_slug ON public.job_categories(slug);
CREATE INDEX IF NOT EXISTS idx_job_categories_is_active ON public.job_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_job_categories_display_order ON public.job_categories(display_order);

-- 3. إضافة trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_job_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_categories_updated_at
BEFORE UPDATE ON public.job_categories
FOR EACH ROW
EXECUTE FUNCTION update_job_categories_updated_at();

-- 4. إدراج التصنيفات الافتراضية بالعربية
INSERT INTO public.job_categories (name_ar, name_en, slug, description, display_order, is_active) VALUES
('إدخال بيانات', 'Data Entry', 'data-entry', 'وظائف إدخال البيانات والمعلومات', 1, true),
('إدارة', 'Management', 'management', 'وظائف إدارية وقيادية', 2, true),
('علاقات عامة', 'Public Relations', 'public-relations', 'وظائف العلاقات العامة والإعلام', 3, true),
('سكرتارية', 'Secretary', 'secretary', 'وظائف السكرتارية والدعم الإداري', 4, true),
('تسويق', 'Marketing', 'marketing', 'وظائف التسويق والمبيعات', 5, true),
('تقني', 'Technical', 'technical', 'وظائف تقنية وبرمجية', 6, true),
('خدمة عملاء', 'Customer Service', 'customer-service', 'وظائف خدمة العملاء والدعم الفني', 7, true),
('أخرى', 'Other', 'other', 'وظائف أخرى متنوعة', 8, true)
ON CONFLICT (name_ar) DO NOTHING;

-- 5. تحديث جدول jobs لاستخدام job_categories
-- ملاحظة: هذا سيتطلب تحديث السجلات الموجودة يدوياً أو عبر سكريبت

-- إضافة عمود category_id إلى جدول jobs (إذا لم يكن موجوداً)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.jobs ADD COLUMN category_id UUID REFERENCES public.job_categories(id);
    CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON public.jobs(category_id);
  END IF;
END $$;

-- 6. سكريبت لتحويل البيانات القديمة (category text) إلى (category_id UUID)
-- تحويل القيم الإنجليزية القديمة إلى IDs
UPDATE public.jobs 
SET category_id = (
  SELECT id FROM public.job_categories 
  WHERE slug = jobs.category
)
WHERE category_id IS NULL AND category IS NOT NULL;

-- 7. إضافة صلاحيات RLS (Row Level Security)
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;

-- السماح للجميع بالقراءة
CREATE POLICY "Allow public read access to job_categories"
ON public.job_categories
FOR SELECT
TO public
USING (is_active = true);

-- السماح للأدمن فقط بالإضافة والتعديل والحذف
-- ملاحظة: يجب تعديل هذه السياسة حسب نظام الصلاحيات في مشروعك
CREATE POLICY "Allow admin full access to job_categories"
ON public.job_categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- 8. إضافة تعليقات على الجدول والأعمدة
COMMENT ON TABLE public.job_categories IS 'جدول تصنيفات الوظائف - يحتوي على جميع التصنيفات المتاحة للوظائف';
COMMENT ON COLUMN public.job_categories.name_ar IS 'اسم التصنيف بالعربية (مطلوب وفريد)';
COMMENT ON COLUMN public.job_categories.name_en IS 'اسم التصنيف بالإنجليزية (اختياري)';
COMMENT ON COLUMN public.job_categories.slug IS 'معرف فريد للاستخدام في URLs والكود';
COMMENT ON COLUMN public.job_categories.is_active IS 'هل التصنيف نشط ومتاح للاستخدام؟';
COMMENT ON COLUMN public.job_categories.display_order IS 'ترتيب عرض التصنيف في القوائم';

-- ====================================================
-- ملاحظات مهمة:
-- ====================================================
-- 1. يجب تنفيذ هذا السكريبت في Supabase SQL Editor
-- 2. بعد التنفيذ، يجب تحديث الكود ليستخدم category_id بدلاً من category
-- 3. يمكن للأدمن إضافة/تعديل/حذف التصنيفات من لوحة التحكم
-- 4. التصنيفات غير النشطة (is_active = false) لن تظهر للمستخدمين
-- 5. يمكن ترتيب التصنيفات باستخدام display_order
-- ====================================================

-- ====================================================
-- للتحقق من نجاح التنفيذ:
-- ====================================================
-- SELECT * FROM public.job_categories ORDER BY display_order;
-- ====================================================
