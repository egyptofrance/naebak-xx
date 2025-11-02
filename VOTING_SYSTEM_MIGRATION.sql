-- ============================================================================
-- Migration: نظام التصويت الكامل (Upvotes + Downvotes)
-- Date: 2025-01-02
-- Description: إضافة نظام تصويت كامل للشكاوى مع دعم المستخدمين المسجلين والزوار
-- ============================================================================

-- ============================================================================
-- الخطوة 1: إنشاء جدول complaint_votes (للتصويت الإيجابي)
-- ============================================================================

CREATE TABLE IF NOT EXISTS complaint_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- منع التصويت المكرر
  CONSTRAINT unique_user_upvote UNIQUE(complaint_id, user_id),
  CONSTRAINT unique_ip_upvote UNIQUE(complaint_id, ip_address),
  
  -- يجب أن يكون إما user_id أو ip_address موجود (ليس كلاهما)
  CONSTRAINT check_user_or_ip_upvote CHECK (
    (user_id IS NOT NULL AND ip_address IS NULL) OR 
    (user_id IS NULL AND ip_address IS NOT NULL)
  )
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_complaint_votes_complaint_id ON complaint_votes(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_votes_user_id ON complaint_votes(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_complaint_votes_ip_address ON complaint_votes(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_complaint_votes_created_at ON complaint_votes(created_at DESC);

COMMENT ON TABLE complaint_votes IS 'جدول التصويت الإيجابي للشكاوى - كل مستخدم/IP يمكنه التصويت مرة واحدة فقط';

-- ============================================================================
-- الخطوة 2: إنشاء جدول complaint_downvotes (للتصويت السلبي)
-- ============================================================================

CREATE TABLE IF NOT EXISTS complaint_downvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- منع التصويت المكرر
  CONSTRAINT unique_user_downvote UNIQUE(complaint_id, user_id),
  CONSTRAINT unique_ip_downvote UNIQUE(complaint_id, ip_address),
  
  -- يجب أن يكون إما user_id أو ip_address موجود (ليس كلاهما)
  CONSTRAINT check_user_or_ip_downvote CHECK (
    (user_id IS NOT NULL AND ip_address IS NULL) OR 
    (user_id IS NULL AND ip_address IS NOT NULL)
  )
);

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_complaint_downvotes_complaint_id ON complaint_downvotes(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_downvotes_user_id ON complaint_downvotes(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_complaint_downvotes_ip_address ON complaint_downvotes(ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_complaint_downvotes_created_at ON complaint_downvotes(created_at DESC);

COMMENT ON TABLE complaint_downvotes IS 'جدول التصويت السلبي للشكاوى - كل مستخدم/IP يمكنه التصويت مرة واحدة فقط';

-- ============================================================================
-- الخطوة 3: إضافة أعمدة العدادات في جدول complaints
-- ============================================================================

ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS upvotes_count INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS downvotes_count INTEGER DEFAULT 0 NOT NULL;

-- Indexes للترتيب حسب الأصوات
CREATE INDEX IF NOT EXISTS idx_complaints_upvotes_count ON complaints(upvotes_count DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_downvotes_count ON complaints(downvotes_count DESC);

-- تحديث الشكاوى الموجودة لتكون العدادات = 0
UPDATE complaints SET upvotes_count = 0 WHERE upvotes_count IS NULL;
UPDATE complaints SET downvotes_count = 0 WHERE downvotes_count IS NULL;

COMMENT ON COLUMN complaints.upvotes_count IS 'عدد التصويتات الإيجابية - يتم تحديثه تلقائياً عبر trigger';
COMMENT ON COLUMN complaints.downvotes_count IS 'عدد التصويتات السلبية - يتم تحديثه تلقائياً عبر trigger';

-- ============================================================================
-- الخطوة 4: إنشاء Functions لتحديث العدادات تلقائياً
-- ============================================================================

-- Function لتحديث upvotes_count
CREATE OR REPLACE FUNCTION update_complaint_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- زيادة العداد عند إضافة تصويت
    UPDATE complaints 
    SET upvotes_count = upvotes_count + 1 
    WHERE id = NEW.complaint_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- تقليل العداد عند حذف تصويت (لا ينزل تحت 0)
    UPDATE complaints 
    SET upvotes_count = GREATEST(upvotes_count - 1, 0)
    WHERE id = OLD.complaint_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_complaint_upvotes_count() IS 'تحديث عداد التصويتات الإيجابية تلقائياً';

-- Function لتحديث downvotes_count
CREATE OR REPLACE FUNCTION update_complaint_downvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- زيادة العداد عند إضافة تصويت سلبي
    UPDATE complaints 
    SET downvotes_count = downvotes_count + 1 
    WHERE id = NEW.complaint_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- تقليل العداد عند حذف تصويت سلبي (لا ينزل تحت 0)
    UPDATE complaints 
    SET downvotes_count = GREATEST(downvotes_count - 1, 0)
    WHERE id = OLD.complaint_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_complaint_downvotes_count() IS 'تحديث عداد التصويتات السلبية تلقائياً';

-- ============================================================================
-- الخطوة 5: إنشاء Triggers
-- ============================================================================

-- Trigger لـ upvotes
DROP TRIGGER IF EXISTS trigger_update_complaint_upvotes_count ON complaint_votes;

CREATE TRIGGER trigger_update_complaint_upvotes_count
AFTER INSERT OR DELETE ON complaint_votes
FOR EACH ROW
EXECUTE FUNCTION update_complaint_upvotes_count();

COMMENT ON TRIGGER trigger_update_complaint_upvotes_count ON complaint_votes IS 'يحافظ على تزامن upvotes_count مع عدد الأصوات الفعلي';

-- Trigger لـ downvotes
DROP TRIGGER IF EXISTS trigger_update_complaint_downvotes_count ON complaint_downvotes;

CREATE TRIGGER trigger_update_complaint_downvotes_count
AFTER INSERT OR DELETE ON complaint_downvotes
FOR EACH ROW
EXECUTE FUNCTION update_complaint_downvotes_count();

COMMENT ON TRIGGER trigger_update_complaint_downvotes_count ON complaint_downvotes IS 'يحافظ على تزامن downvotes_count مع عدد الأصوات الفعلي';

-- ============================================================================
-- الخطوة 6: تفعيل Row Level Security (RLS)
-- ============================================================================

-- تفعيل RLS على جدول complaint_votes
ALTER TABLE complaint_votes ENABLE ROW LEVEL SECURITY;

-- Policy: الجميع يمكنهم مشاهدة الأصوات
CREATE POLICY "الجميع يمكنهم مشاهدة الأصوات الإيجابية"
ON complaint_votes
FOR SELECT
USING (true);

-- Policy: المستخدمون المسجلون يمكنهم إضافة أصواتهم
CREATE POLICY "المستخدمون يمكنهم إضافة أصوات إيجابية"
ON complaint_votes
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND ip_address IS NULL) OR
  (auth.uid() IS NULL AND user_id IS NULL AND ip_address IS NOT NULL)
);

-- Policy: المستخدمون يمكنهم حذف أصواتهم
CREATE POLICY "المستخدمون يمكنهم حذف أصواتهم الإيجابية"
ON complaint_votes
FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- تفعيل RLS على جدول complaint_downvotes
ALTER TABLE complaint_downvotes ENABLE ROW LEVEL SECURITY;

-- Policy: الجميع يمكنهم مشاهدة الأصوات السلبية
CREATE POLICY "الجميع يمكنهم مشاهدة الأصوات السلبية"
ON complaint_downvotes
FOR SELECT
USING (true);

-- Policy: المستخدمون المسجلون يمكنهم إضافة أصوات سلبية
CREATE POLICY "المستخدمون يمكنهم إضافة أصوات سلبية"
ON complaint_downvotes
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id AND ip_address IS NULL) OR
  (auth.uid() IS NULL AND user_id IS NULL AND ip_address IS NOT NULL)
);

-- Policy: المستخدمون يمكنهم حذف أصواتهم السلبية
CREATE POLICY "المستخدمون يمكنهم حذف أصواتهم السلبية"
ON complaint_downvotes
FOR DELETE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND user_id IS NULL)
);

-- ============================================================================
-- الخطوة 7: منح الصلاحيات
-- ============================================================================

-- صلاحيات complaint_votes
GRANT SELECT ON complaint_votes TO authenticated, anon;
GRANT INSERT ON complaint_votes TO authenticated, anon;
GRANT DELETE ON complaint_votes TO authenticated, anon;

-- صلاحيات complaint_downvotes
GRANT SELECT ON complaint_downvotes TO authenticated, anon;
GRANT INSERT ON complaint_downvotes TO authenticated, anon;
GRANT DELETE ON complaint_downvotes TO authenticated, anon;

-- ============================================================================
-- الخطوة 8: التحقق من نجاح Migration
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ تم تطبيق نظام التصويت بنجاح!';
  RAISE NOTICE '📊 الجداول المنشأة: complaint_votes, complaint_downvotes';
  RAISE NOTICE '📈 الأعمدة المضافة: upvotes_count, downvotes_count';
  RAISE NOTICE '⚡ Triggers المنشأة: trigger_update_complaint_upvotes_count, trigger_update_complaint_downvotes_count';
  RAISE NOTICE '🔒 RLS Policies مفعلة لحماية البيانات';
  RAISE NOTICE '🎉 يمكنك الآن استخدام نظام التصويت!';
END $$;

-- ============================================================================
-- Migration Complete ✅
-- ============================================================================
