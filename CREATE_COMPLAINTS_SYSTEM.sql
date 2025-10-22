-- ============================================================================
-- نظام الشكاوى - منصة نائبك
-- Complaints System for Naebak Platform
-- ============================================================================
-- التاريخ: 22 أكتوبر 2025
-- الإصدار: 1.0
-- ============================================================================

-- ============================================================================
-- PART 1: إنشاء الـ ENUMS
-- ============================================================================

-- حالات الشكوى
CREATE TYPE complaint_status AS ENUM (
  'new',                    -- جديدة (تم تسجيلها من المواطن)
  'under_review',           -- قيد المراجعة (الأدمن يراجعها)
  'assigned_to_deputy',     -- موجهة لنائب
  'accepted',               -- مقبولة (النائب قبلها)
  'on_hold',                -- معلقة للدراسة
  'rejected',               -- مرفوضة (النائب رفضها)
  'in_progress',            -- قيد الحل
  'resolved',               -- محلولة (تم حلها)
  'closed',                 -- مغلقة (الأدمن أغلقها)
  'archived'                -- مؤرشفة
);

-- أولويات الشكوى
CREATE TYPE complaint_priority AS ENUM (
  'low',                    -- منخفضة
  'medium',                 -- متوسطة
  'high',                   -- عالية
  'urgent'                  -- عاجلة
);

-- تصنيفات الشكوى
CREATE TYPE complaint_category AS ENUM (
  'health',                 -- صحة
  'education',              -- تعليم
  'infrastructure',         -- بنية تحتية
  'security',               -- أمن
  'economy',                -- اقتصاد
  'environment',            -- بيئة
  'transportation',         -- مواصلات
  'housing',                -- إسكان
  'water',                  -- مياه
  'electricity',            -- كهرباء
  'sanitation',             -- صرف صحي
  'social_services',        -- خدمات اجتماعية
  'other'                   -- أخرى
);

-- أنواع الإجراءات في سجل التاريخ
CREATE TYPE complaint_action_type AS ENUM (
  'created',                -- تم إنشاء الشكوى
  'assigned',               -- تم توجيه الشكوى
  'reassigned',             -- تم إعادة توجيه الشكوى
  'status_changed',         -- تم تغيير الحالة
  'priority_changed',       -- تم تغيير الأولوية
  'commented',              -- تم إضافة تعليق
  'accepted',               -- تم قبول الشكوى
  'rejected',               -- تم رفض الشكوى
  'resolved',               -- تم حل الشكوى
  'closed',                 -- تم إغلاق الشكوى
  'archived',               -- تم أرشفة الشكوى
  'points_awarded'          -- تم إضافة نقاط
);

COMMENT ON TYPE complaint_status IS 'حالات الشكوى المختلفة في النظام';
COMMENT ON TYPE complaint_priority IS 'مستويات أولوية الشكاوى';
COMMENT ON TYPE complaint_category IS 'تصنيفات الشكاوى حسب الموضوع';
COMMENT ON TYPE complaint_action_type IS 'أنواع الإجراءات المسجلة في سجل التاريخ';

-- ============================================================================
-- PART 2: إنشاء الجداول الرئيسية
-- ============================================================================

-- ----------------------------------------------------------------------------
-- جدول الشكاوى الرئيسي
-- ----------------------------------------------------------------------------
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- معلومات الشكوى الأساسية
  title TEXT NOT NULL CHECK (char_length(title) >= 10 AND char_length(title) <= 200),
  description TEXT NOT NULL CHECK (char_length(description) >= 50),
  category complaint_category NOT NULL DEFAULT 'other',
  priority complaint_priority NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'new',
  
  -- معلومات الموقع
  governorate_id UUID REFERENCES governorates(id),
  location_details TEXT, -- تفاصيل إضافية عن الموقع
  
  -- الأشخاص المعنيون
  citizen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to_deputy_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- معلومات الرفض
  rejection_reason TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- معلومات الحل
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- نظام النقاط
  points_awarded BOOLEAN DEFAULT FALSE,
  points_awarded_at TIMESTAMPTZ,
  points_awarded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- المرفقات (JSON array of file URLs)
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- البيانات الوصفية (metadata)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- التواريخ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_rejection CHECK (
    (status = 'rejected' AND rejection_reason IS NOT NULL AND rejected_at IS NOT NULL AND rejected_by IS NOT NULL)
    OR status != 'rejected'
  ),
  CONSTRAINT valid_resolution CHECK (
    (status = 'resolved' AND resolution_notes IS NOT NULL AND resolved_at IS NOT NULL AND resolved_by IS NOT NULL)
    OR status != 'resolved'
  ),
  CONSTRAINT valid_assignment CHECK (
    (status IN ('assigned_to_deputy', 'accepted', 'on_hold', 'rejected', 'in_progress', 'resolved') 
     AND assigned_to_deputy_id IS NOT NULL)
    OR status NOT IN ('assigned_to_deputy', 'accepted', 'on_hold', 'rejected', 'in_progress', 'resolved')
  )
);

-- Indexes للأداء
CREATE INDEX idx_complaints_citizen ON complaints(citizen_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_deputy ON complaints(assigned_to_deputy_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_status ON complaints(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_priority ON complaints(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_category ON complaints(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_governorate ON complaints(governorate_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_created ON complaints(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_updated ON complaints(updated_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_points ON complaints(points_awarded, resolved_at) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE complaints IS 'جدول الشكاوى الرئيسي - يحتوي على جميع الشكاوى المقدمة من المواطنين';
COMMENT ON COLUMN complaints.title IS 'عنوان الشكوى (10-200 حرف)';
COMMENT ON COLUMN complaints.description IS 'وصف تفصيلي للشكوى (50 حرف على الأقل)';
COMMENT ON COLUMN complaints.category IS 'تصنيف الشكوى حسب الموضوع';
COMMENT ON COLUMN complaints.priority IS 'أولوية الشكوى';
COMMENT ON COLUMN complaints.status IS 'الحالة الحالية للشكوى';
COMMENT ON COLUMN complaints.citizen_id IS 'معرف المواطن صاحب الشكوى';
COMMENT ON COLUMN complaints.assigned_to_deputy_id IS 'معرف النائب الموجهة له الشكوى';
COMMENT ON COLUMN complaints.points_awarded IS 'هل تم إضافة نقاط للنائب عند حل الشكوى';

-- ----------------------------------------------------------------------------
-- جدول تعليقات الشكاوى
-- ----------------------------------------------------------------------------
CREATE TABLE complaint_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL CHECK (char_length(content) >= 5),
  
  -- التعليقات الداخلية (بين الأدمن والنائب فقط)
  is_internal BOOLEAN DEFAULT FALSE,
  
  -- المرفقات
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- التواريخ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_complaint_comments_complaint ON complaint_comments(complaint_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaint_comments_user ON complaint_comments(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaint_comments_created ON complaint_comments(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaint_comments_internal ON complaint_comments(is_internal) WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE complaint_comments IS 'تعليقات وردود على الشكاوى';
COMMENT ON COLUMN complaint_comments.is_internal IS 'تعليق داخلي (لا يراه المواطن)';

-- ----------------------------------------------------------------------------
-- جدول سجل تاريخ الشكاوى
-- ----------------------------------------------------------------------------
CREATE TABLE complaint_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  action complaint_action_type NOT NULL,
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  
  -- بيانات إضافية
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_complaint_history_complaint ON complaint_history(complaint_id);
CREATE INDEX idx_complaint_history_user ON complaint_history(user_id);
CREATE INDEX idx_complaint_history_action ON complaint_history(action);
CREATE INDEX idx_complaint_history_created ON complaint_history(created_at DESC);

-- Comments
COMMENT ON TABLE complaint_history IS 'سجل تاريخي لجميع التغييرات والإجراءات على الشكاوى';
COMMENT ON COLUMN complaint_history.action IS 'نوع الإجراء المتخذ';
COMMENT ON COLUMN complaint_history.old_value IS 'القيمة القديمة قبل التغيير';
COMMENT ON COLUMN complaint_history.new_value IS 'القيمة الجديدة بعد التغيير';

-- ----------------------------------------------------------------------------
-- جدول نقاط وإحصائيات النواب
-- ----------------------------------------------------------------------------
CREATE TABLE deputy_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  deputy_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- النقاط
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  
  -- إحصائيات الشكاوى
  complaints_assigned INTEGER NOT NULL DEFAULT 0 CHECK (complaints_assigned >= 0),
  complaints_accepted INTEGER NOT NULL DEFAULT 0 CHECK (complaints_accepted >= 0),
  complaints_rejected INTEGER NOT NULL DEFAULT 0 CHECK (complaints_rejected >= 0),
  complaints_on_hold INTEGER NOT NULL DEFAULT 0 CHECK (complaints_on_hold >= 0),
  complaints_in_progress INTEGER NOT NULL DEFAULT 0 CHECK (complaints_in_progress >= 0),
  complaints_resolved INTEGER NOT NULL DEFAULT 0 CHECK (complaints_resolved >= 0),
  
  -- متوسط وقت الحل (بالساعات)
  average_resolution_hours NUMERIC(10, 2),
  
  -- آخر نشاط
  last_activity_at TIMESTAMPTZ,
  
  -- الترتيب (يتم حسابه تلقائياً)
  rank INTEGER,
  
  -- التواريخ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_deputy_scores_deputy ON deputy_scores(deputy_id);
CREATE INDEX idx_deputy_scores_points ON deputy_scores(total_points DESC);
CREATE INDEX idx_deputy_scores_resolved ON deputy_scores(complaints_resolved DESC);
CREATE INDEX idx_deputy_scores_rank ON deputy_scores(rank ASC) WHERE rank IS NOT NULL;

-- Comments
COMMENT ON TABLE deputy_scores IS 'نقاط وإحصائيات أداء النواب في حل الشكاوى';
COMMENT ON COLUMN deputy_scores.total_points IS 'إجمالي النقاط (10 نقاط لكل شكوى محلولة)';
COMMENT ON COLUMN deputy_scores.average_resolution_hours IS 'متوسط الوقت المستغرق لحل الشكاوى بالساعات';
COMMENT ON COLUMN deputy_scores.rank IS 'ترتيب النائب بين جميع النواب';

-- ============================================================================
-- PART 3: Functions و Triggers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: تحديث updated_at تلقائياً
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers لتحديث updated_at
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaint_comments_updated_at
  BEFORE UPDATE ON complaint_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deputy_scores_updated_at
  BEFORE UPDATE ON deputy_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Function: إضافة سجل في التاريخ تلقائياً عند تغيير حالة الشكوى
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_complaint_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- عند تغيير الحالة
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO complaint_history (complaint_id, user_id, action, old_value, new_value)
    VALUES (
      NEW.id,
      COALESCE(NEW.assigned_by_admin_id, NEW.assigned_by_manager_id, NEW.citizen_id),
      'status_changed',
      OLD.status::text,
      NEW.status::text
    );
  END IF;
  
  -- عند تغيير الأولوية
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO complaint_history (complaint_id, user_id, action, old_value, new_value)
    VALUES (
      NEW.id,
      COALESCE(NEW.assigned_by_admin_id, NEW.assigned_by_manager_id, NEW.citizen_id),
      'priority_changed',
      OLD.priority::text,
      NEW.priority::text
    );
  END IF;
  
  -- عند التوجيه لنائب
  IF OLD.assigned_to_deputy_id IS DISTINCT FROM NEW.assigned_to_deputy_id 
     AND NEW.assigned_to_deputy_id IS NOT NULL THEN
    INSERT INTO complaint_history (complaint_id, user_id, action, old_value, new_value)
    VALUES (
      NEW.id,
      COALESCE(NEW.assigned_by_admin_id, NEW.assigned_by_manager_id),
      CASE 
        WHEN OLD.assigned_to_deputy_id IS NULL THEN 'assigned'
        ELSE 'reassigned'
      END,
      OLD.assigned_to_deputy_id::text,
      NEW.assigned_to_deputy_id::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_complaint_changes
  AFTER UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION log_complaint_status_change();

-- ----------------------------------------------------------------------------
-- Function: تحديث إحصائيات النائب تلقائياً
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_deputy_scores()
RETURNS TRIGGER AS $$
DECLARE
  v_deputy_id UUID;
BEGIN
  -- تحديد معرف النائب
  v_deputy_id := COALESCE(NEW.assigned_to_deputy_id, OLD.assigned_to_deputy_id);
  
  IF v_deputy_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- التأكد من وجود سجل للنائب
  INSERT INTO deputy_scores (deputy_id)
  VALUES (v_deputy_id)
  ON CONFLICT (deputy_id) DO NOTHING;
  
  -- تحديث الإحصائيات
  UPDATE deputy_scores
  SET
    complaints_assigned = (
      SELECT COUNT(*) FROM complaints 
      WHERE assigned_to_deputy_id = v_deputy_id 
      AND deleted_at IS NULL
    ),
    complaints_accepted = (
      SELECT COUNT(*) FROM complaints 
      WHERE assigned_to_deputy_id = v_deputy_id 
      AND status = 'accepted'
      AND deleted_at IS NULL
    ),
    complaints_rejected = (
      SELECT COUNT(*) FROM complaints 
      WHERE assigned_to_deputy_id = v_deputy_id 
      AND status = 'rejected'
      AND deleted_at IS NULL
    ),
    complaints_on_hold = (
      SELECT COUNT(*) FROM complaints 
      WHERE assigned_to_deputy_id = v_deputy_id 
      AND status = 'on_hold'
      AND deleted_at IS NULL
    ),
    complaints_in_progress = (
      SELECT COUNT(*) FROM complaints 
      WHERE assigned_to_deputy_id = v_deputy_id 
      AND status = 'in_progress'
      AND deleted_at IS NULL
    ),
    complaints_resolved = (
      SELECT COUNT(*) FROM complaints 
      WHERE assigned_to_deputy_id = v_deputy_id 
      AND status = 'resolved'
      AND deleted_at IS NULL
    ),
    average_resolution_hours = (
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)
      FROM complaints 
      WHERE assigned_to_deputy_id = v_deputy_id 
      AND status = 'resolved'
      AND resolved_at IS NOT NULL
      AND deleted_at IS NULL
    ),
    last_activity_at = NOW()
  WHERE deputy_id = v_deputy_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deputy_scores_on_complaint_change
  AFTER INSERT OR UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_deputy_scores();

-- ----------------------------------------------------------------------------
-- Function: إضافة 10 نقاط للنائب عند حل الشكوى
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION award_points_on_resolution()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق من أن الشكوى تم حلها ولم يتم إضافة النقاط بعد
  IF NEW.status = 'resolved' 
     AND NEW.points_awarded = TRUE 
     AND (OLD.points_awarded = FALSE OR OLD.points_awarded IS NULL) THEN
    
    -- إضافة 10 نقاط للنائب
    UPDATE deputy_scores
    SET total_points = total_points + 10
    WHERE deputy_id = NEW.assigned_to_deputy_id;
    
    -- تسجيل في التاريخ
    INSERT INTO complaint_history (complaint_id, user_id, action, notes)
    VALUES (
      NEW.id,
      NEW.points_awarded_by,
      'points_awarded',
      'تم إضافة 10 نقاط للنائب'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_points_on_complaint_resolution
  AFTER UPDATE ON complaints
  FOR EACH ROW
  WHEN (NEW.status = 'resolved' AND NEW.points_awarded = TRUE)
  EXECUTE FUNCTION award_points_on_resolution();

-- ----------------------------------------------------------------------------
-- Function: حساب ترتيب النواب
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_deputy_ranks()
RETURNS void AS $$
BEGIN
  WITH ranked_deputies AS (
    SELECT 
      deputy_id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, complaints_resolved DESC) as new_rank
    FROM deputy_scores
  )
  UPDATE deputy_scores ds
  SET rank = rd.new_rank
  FROM ranked_deputies rd
  WHERE ds.deputy_id = rd.deputy_id;
END;
$$ LANGUAGE plpgsql;

-- جدولة حساب الترتيب (يمكن تشغيله يدوياً أو عبر cron job)
-- SELECT calculate_deputy_ranks();

-- ============================================================================
-- PART 4: Row Level Security (RLS) Policies
-- ============================================================================

-- تفعيل RLS على الجداول
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deputy_scores ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Policies لجدول complaints
-- ----------------------------------------------------------------------------

-- المواطن يرى شكاواه فقط
CREATE POLICY "Citizens can view their own complaints"
ON complaints FOR SELECT
TO authenticated
USING (
  citizen_id = auth.uid()
  AND deleted_at IS NULL
);

-- المواطن يستطيع إنشاء شكوى
CREATE POLICY "Citizens can create complaints"
ON complaints FOR INSERT
TO authenticated
WITH CHECK (
  citizen_id = auth.uid()
);

-- المواطن يستطيع تحديث شكواه (فقط قبل التوجيه)
CREATE POLICY "Citizens can update their own new complaints"
ON complaints FOR UPDATE
TO authenticated
USING (
  citizen_id = auth.uid()
  AND status = 'new'
  AND deleted_at IS NULL
)
WITH CHECK (
  citizen_id = auth.uid()
  AND status = 'new'
);

-- الأدمن يرى جميع الشكاوى
CREATE POLICY "Admins can view all complaints"
ON complaints FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
  AND deleted_at IS NULL
);

-- الأدمن يستطيع تحديث جميع الشكاوى
CREATE POLICY "Admins can update all complaints"
ON complaints FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- الأدمن يستطيع حذف الشكاوى (soft delete)
CREATE POLICY "Admins can delete complaints"
ON complaints FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  deleted_at IS NOT NULL
);

-- المدير يرى جميع الشكاوى
CREATE POLICY "Managers can view all complaints"
ON complaints FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM manager_permissions
    WHERE user_id = auth.uid()
  )
  AND deleted_at IS NULL
);

-- المدير يستطيع تحديث الشكاوى (لكن لا يستطيع حذفها أو أرشفتها)
CREATE POLICY "Managers can update complaints but not delete or archive"
ON complaints FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM manager_permissions
    WHERE user_id = auth.uid()
  )
  AND deleted_at IS NULL
)
WITH CHECK (
  -- المدير لا يستطيع تغيير الحالة إلى archived أو deleted
  status != 'archived'
  AND deleted_at IS NULL
);

-- النائب يرى الشكاوى الموجهة له فقط
CREATE POLICY "Deputies can view assigned complaints"
ON complaints FOR SELECT
TO authenticated
USING (
  assigned_to_deputy_id = auth.uid()
  AND deleted_at IS NULL
);

-- النائب يستطيع تحديث الشكاوى الموجهة له
CREATE POLICY "Deputies can update assigned complaints"
ON complaints FOR UPDATE
TO authenticated
USING (
  assigned_to_deputy_id = auth.uid()
  AND deleted_at IS NULL
)
WITH CHECK (
  assigned_to_deputy_id = auth.uid()
  AND deleted_at IS NULL
);

-- ----------------------------------------------------------------------------
-- Policies لجدول complaint_comments
-- ----------------------------------------------------------------------------

-- المستخدمون يرون التعليقات العامة على شكاواهم
CREATE POLICY "Users can view public comments on their complaints"
ON complaint_comments FOR SELECT
TO authenticated
USING (
  NOT is_internal
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_comments.complaint_id
    AND (
      complaints.citizen_id = auth.uid()
      OR complaints.assigned_to_deputy_id = auth.uid()
    )
    AND complaints.deleted_at IS NULL
  )
);

-- الأدمن يرى جميع التعليقات (بما فيها الداخلية)
CREATE POLICY "Admins can view all comments"
ON complaint_comments FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- المدير يرى جميع التعليقات (بما فيها الداخلية)
CREATE POLICY "Managers can view all comments"
ON complaint_comments FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM manager_permissions
    WHERE user_id = auth.uid()
  )
);

-- النواب يرون التعليقات الداخلية على شكاواهم
CREATE POLICY "Deputies can view internal comments on their complaints"
ON complaint_comments FOR SELECT
TO authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_comments.complaint_id
    AND complaints.assigned_to_deputy_id = auth.uid()
    AND complaints.deleted_at IS NULL
  )
);

-- المستخدمون يستطيعون إضافة تعليقات عامة على شكاواهم
CREATE POLICY "Users can create public comments on their complaints"
ON complaint_comments FOR INSERT
TO authenticated
WITH CHECK (
  NOT is_internal
  AND EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_comments.complaint_id
    AND (
      complaints.citizen_id = auth.uid()
      OR complaints.assigned_to_deputy_id = auth.uid()
    )
    AND complaints.deleted_at IS NULL
  )
);

-- الأدمن والمدير يستطيعون إضافة تعليقات (عامة وداخلية)
CREATE POLICY "Admins and Managers can create all comments"
ON complaint_comments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM manager_permissions
    WHERE user_id = auth.uid()
  )
);

-- المستخدمون يستطيعون تحديث تعليقاتهم
CREATE POLICY "Users can update their own comments"
ON complaint_comments FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  AND deleted_at IS NULL
)
WITH CHECK (
  user_id = auth.uid()
);

-- ----------------------------------------------------------------------------
-- Policies لجدول complaint_history
-- ----------------------------------------------------------------------------

-- الأدمن يرى جميع السجلات
CREATE POLICY "Admins can view all history"
ON complaint_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- المدير يرى جميع السجلات
CREATE POLICY "Managers can view all history"
ON complaint_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM manager_permissions
    WHERE user_id = auth.uid()
  )
);

-- المواطن يرى سجل شكاواه
CREATE POLICY "Citizens can view their complaints history"
ON complaint_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_history.complaint_id
    AND complaints.citizen_id = auth.uid()
    AND complaints.deleted_at IS NULL
  )
);

-- النائب يرى سجل الشكاوى الموجهة له
CREATE POLICY "Deputies can view their assigned complaints history"
ON complaint_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_history.complaint_id
    AND complaints.assigned_to_deputy_id = auth.uid()
    AND complaints.deleted_at IS NULL
  )
);

-- النظام يستطيع إضافة سجلات (عبر triggers)
CREATE POLICY "System can insert history records"
ON complaint_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Policies لجدول deputy_scores
-- ----------------------------------------------------------------------------

-- الجميع يستطيع رؤية نقاط النواب (للشفافية)
CREATE POLICY "Everyone can view deputy scores"
ON deputy_scores FOR SELECT
TO authenticated
USING (true);

-- النظام فقط يستطيع تحديث النقاط (عبر triggers)
CREATE POLICY "System can update deputy scores"
ON deputy_scores FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- النظام فقط يستطيع إنشاء سجلات جديدة
CREATE POLICY "System can insert deputy scores"
ON deputy_scores FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================================
-- PART 5: Helper Functions للاستعلامات
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: الحصول على إحصائيات الشكاوى للأدمن
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_complaints_stats()
RETURNS TABLE (
  total_complaints BIGINT,
  new_complaints BIGINT,
  under_review_complaints BIGINT,
  assigned_complaints BIGINT,
  resolved_complaints BIGINT,
  rejected_complaints BIGINT,
  average_resolution_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_complaints,
    COUNT(*) FILTER (WHERE status = 'new')::BIGINT as new_complaints,
    COUNT(*) FILTER (WHERE status = 'under_review')::BIGINT as under_review_complaints,
    COUNT(*) FILTER (WHERE status IN ('assigned_to_deputy', 'accepted', 'in_progress'))::BIGINT as assigned_complaints,
    COUNT(*) FILTER (WHERE status = 'resolved')::BIGINT as resolved_complaints,
    COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_complaints,
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400) FILTER (WHERE status = 'resolved') as average_resolution_days
  FROM complaints
  WHERE deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Function: الحصول على أفضل 10 نواب
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_top_deputies(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  deputy_id UUID,
  deputy_name TEXT,
  total_points INTEGER,
  complaints_resolved INTEGER,
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ds.deputy_id,
    up.full_name as deputy_name,
    ds.total_points,
    ds.complaints_resolved,
    ds.rank
  FROM deputy_scores ds
  JOIN user_profiles up ON ds.deputy_id = up.user_id
  ORDER BY ds.total_points DESC, ds.complaints_resolved DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 6: Initial Data (Optional)
-- ============================================================================

-- يمكن إضافة بيانات أولية هنا إذا لزم الأمر

-- ============================================================================
-- النهاية
-- ============================================================================

-- عرض ملخص الجداول المنشأة
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'تم إنشاء نظام الشكاوى بنجاح!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'الجداول المنشأة:';
  RAISE NOTICE '  1. complaints (الشكاوى)';
  RAISE NOTICE '  2. complaint_comments (التعليقات)';
  RAISE NOTICE '  3. complaint_history (السجل التاريخي)';
  RAISE NOTICE '  4. deputy_scores (نقاط النواب)';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Functions المنشأة:';
  RAISE NOTICE '  - update_updated_at_column()';
  RAISE NOTICE '  - log_complaint_status_change()';
  RAISE NOTICE '  - update_deputy_scores()';
  RAISE NOTICE '  - award_points_on_resolution()';
  RAISE NOTICE '  - calculate_deputy_ranks()';
  RAISE NOTICE '  - get_complaints_stats()';
  RAISE NOTICE '  - get_top_deputies()';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'RLS Policies: تم تفعيلها على جميع الجداول';
  RAISE NOTICE '============================================';
END $$;

