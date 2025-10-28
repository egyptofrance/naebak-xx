-- =====================================================
-- Fix Deputy Rating Calculation
-- =====================================================
-- المشكلة: التقييم الذي يضعه الأدمن (initial_rating) لا يظهر
-- الحل: دالة تحسب rating_average و rating_count من:
--   1. initial_rating_average + initial_rating_count (من الأدمن)
--   2. تقييمات المستخدمين الفعلية من جدول deputy_ratings
-- =====================================================

-- 1. دالة لحساب التقييم النهائي لنائب معين
-- =====================================================
-- حذف Function القديمة إن وجدت
DROP FUNCTION IF EXISTS calculate_deputy_rating(UUID);

-- إنشاء Function جديدة
CREATE FUNCTION calculate_deputy_rating(deputy_id_param UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  initial_avg NUMERIC;
  initial_count INTEGER;
  user_ratings_sum NUMERIC;
  user_ratings_count INTEGER;
  final_avg NUMERIC;
  final_count INTEGER;
BEGIN
  -- جلب التقييم المبدئي من الأدمن
  SELECT 
    COALESCE(initial_rating_average, 0),
    COALESCE(initial_rating_count, 0)
  INTO initial_avg, initial_count
  FROM deputy_profiles
  WHERE id = deputy_id_param;

  -- حساب مجموع وعدد تقييمات المستخدمين
  SELECT 
    COALESCE(SUM(rating), 0),
    COALESCE(COUNT(*), 0)
  INTO user_ratings_sum, user_ratings_count
  FROM deputy_ratings
  WHERE deputy_id = deputy_id_param;

  -- حساب التقييم النهائي
  final_count := initial_count + user_ratings_count;
  
  IF final_count > 0 THEN
    final_avg := ((initial_avg * initial_count) + user_ratings_sum) / final_count;
  ELSE
    final_avg := 0;
  END IF;

  -- تحديث deputy_profiles
  UPDATE deputy_profiles
  SET 
    rating_average = final_avg,
    rating_count = final_count,
    updated_at = NOW()
  WHERE id = deputy_id_param;
  
END;
$$;

-- =====================================================
-- 2. Trigger عند إضافة/تعديل/حذف تقييم مستخدم
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_recalculate_deputy_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- عند INSERT أو UPDATE
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    PERFORM calculate_deputy_rating(NEW.deputy_id);
    RETURN NEW;
  
  -- عند DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    PERFORM calculate_deputy_rating(OLD.deputy_id);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- حذف Trigger القديم إن وجد
DROP TRIGGER IF EXISTS recalculate_rating_on_user_rating ON deputy_ratings;

-- إنشاء Trigger جديد
CREATE TRIGGER recalculate_rating_on_user_rating
AFTER INSERT OR UPDATE OR DELETE ON deputy_ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_recalculate_deputy_rating();

-- =====================================================
-- 3. Trigger عند تعديل initial_rating من الأدمن
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_recalculate_on_initial_rating_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- إذا تغير initial_rating_average أو initial_rating_count
  IF (NEW.initial_rating_average IS DISTINCT FROM OLD.initial_rating_average) OR
     (NEW.initial_rating_count IS DISTINCT FROM OLD.initial_rating_count) THEN
    PERFORM calculate_deputy_rating(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- حذف Trigger القديم إن وجد
DROP TRIGGER IF EXISTS recalculate_rating_on_initial_change ON deputy_profiles;

-- إنشاء Trigger جديد
CREATE TRIGGER recalculate_rating_on_initial_change
AFTER UPDATE ON deputy_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_recalculate_on_initial_rating_change();

-- =====================================================
-- 4. إعادة حساب التقييم لجميع النواب الحاليين
-- =====================================================
-- هذا سيحدث مرة واحدة فقط عند تنفيذ Migration
DO $$
DECLARE
  deputy_record RECORD;
BEGIN
  FOR deputy_record IN SELECT id FROM deputy_profiles
  LOOP
    PERFORM calculate_deputy_rating(deputy_record.id);
  END LOOP;
END;
$$;

-- =====================================================
-- التحقق من النتائج
-- =====================================================
-- يمكنك التحقق من التقييمات باستخدام:
-- SELECT 
--   id,
--   initial_rating_average,
--   initial_rating_count,
--   rating_average,
--   rating_count
-- FROM deputy_profiles
-- WHERE initial_rating_count > 0 OR rating_count > 0;

-- =====================================================
-- النتيجة المتوقعة
-- =====================================================
-- ✅ التقييم الذي يضعه الأدمن يظهر فوراً على صفحة النائب
-- ✅ عند إضافة تقييمات من المستخدمين، يتم الحساب تلقائياً
-- ✅ المعادلة: rating_average = (initial × count + user_sum) / (initial_count + user_count)
-- =====================================================
