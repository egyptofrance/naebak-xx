-- إضافة حقل display_name إلى جدول deputy_profiles
-- هذا الحقل يسمح للنائب باختيار اسم العرض المفضل له

ALTER TABLE deputy_profiles
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- إضافة تعليق على الحقل
COMMENT ON COLUMN deputy_profiles.display_name IS 'اسم العرض المخصص للنائب - إذا كان فارغاً يتم استخدام التنسيق التلقائي (الاسم الأول + اسم الأب)';

