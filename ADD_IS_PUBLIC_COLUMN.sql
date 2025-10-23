-- ============================================
-- إضافة عمود is_public لجدول complaints
-- ============================================

-- إضافة عمود is_public (افتراضياً false للخصوصية)
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false NOT NULL;

-- إنشاء index لتسريع الاستعلامات على الشكاوى العامة
CREATE INDEX IF NOT EXISTS idx_complaints_is_public 
ON complaints(is_public) 
WHERE is_public = true;

-- إنشاء index مركب للشكاوى العامة المرتبة حسب التاريخ
CREATE INDEX IF NOT EXISTS idx_complaints_public_created 
ON complaints(is_public, created_at DESC) 
WHERE is_public = true;

-- ============================================
-- RLS Policy للشكاوى العامة
-- ============================================

-- السماح للجميع (حتى غير المسجلين) بقراءة الشكاوى العامة
CREATE POLICY "Anyone can view public complaints"
ON complaints
FOR SELECT
TO public
USING (is_public = true);

-- ============================================
-- تعليق على العمود
-- ============================================

COMMENT ON COLUMN complaints.is_public IS 'يحدد إذا كانت الشكوى قابلة للعرض العام أم خاصة';

