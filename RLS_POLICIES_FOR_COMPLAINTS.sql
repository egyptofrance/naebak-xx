-- ============================================
-- RLS Policies for Complaints System
-- ============================================
-- يجب تنفيذ هذا الكود في Supabase SQL Editor

-- 1. تفعيل RLS على جدول complaints
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- 2. تفعيل RLS على جدول complaint_actions
ALTER TABLE complaint_actions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies for complaints table
-- ============================================

-- Policy 1: المواطنون يمكنهم قراءة شكاواهم فقط
CREATE POLICY "Citizens can view their own complaints"
ON complaints
FOR SELECT
TO authenticated
USING (
  citizen_id = auth.uid()
);

-- Policy 2: المواطنون يمكنهم إنشاء شكاوى جديدة
CREATE POLICY "Citizens can create complaints"
ON complaints
FOR INSERT
TO authenticated
WITH CHECK (
  citizen_id = auth.uid()
);

-- Policy 3: المواطنون يمكنهم تحديث شكاواهم (إذا كانت جديدة فقط)
CREATE POLICY "Citizens can update their new complaints"
ON complaints
FOR UPDATE
TO authenticated
USING (
  citizen_id = auth.uid() AND status = 'new'
)
WITH CHECK (
  citizen_id = auth.uid()
);

-- Policy 4: الأدمن يمكنهم قراءة جميع الشكاوى
CREATE POLICY "Admins can view all complaints"
ON complaints
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.user_type = 'app_admin'
  )
);

-- Policy 5: المديرون يمكنهم قراءة جميع الشكاوى
CREATE POLICY "Managers can view all complaints"
ON complaints
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.user_type = 'manager'
  )
);

-- Policy 6: النواب يمكنهم قراءة الشكاوى المسندة لهم
CREATE POLICY "Deputies can view assigned complaints"
ON complaints
FOR SELECT
TO authenticated
USING (
  assigned_deputy_id = auth.uid()
);

-- Policy 7: الأدمن والمديرون يمكنهم تحديث جميع الشكاوى
CREATE POLICY "Admins and managers can update all complaints"
ON complaints
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.user_type IN ('app_admin', 'manager')
  )
);

-- Policy 8: النواب يمكنهم تحديث الشكاوى المسندة لهم
CREATE POLICY "Deputies can update assigned complaints"
ON complaints
FOR UPDATE
TO authenticated
USING (
  assigned_deputy_id = auth.uid()
)
WITH CHECK (
  assigned_deputy_id = auth.uid()
);

-- ============================================
-- Policies for complaint_actions table
-- ============================================

-- Policy 9: المواطنون يمكنهم قراءة إجراءات شكاواهم
CREATE POLICY "Citizens can view actions on their complaints"
ON complaint_actions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_actions.complaint_id
    AND complaints.citizen_id = auth.uid()
  )
);

-- Policy 10: الأدمن والمديرون يمكنهم قراءة جميع الإجراءات
CREATE POLICY "Admins and managers can view all actions"
ON complaint_actions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.user_type IN ('app_admin', 'manager')
  )
);

-- Policy 11: النواب يمكنهم قراءة إجراءات شكاواهم المسندة
CREATE POLICY "Deputies can view actions on assigned complaints"
ON complaint_actions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_actions.complaint_id
    AND complaints.assigned_deputy_id = auth.uid()
  )
);

-- Policy 12: الأدمن والمديرون والنواب يمكنهم إضافة إجراءات
CREATE POLICY "Authorized users can create actions"
ON complaint_actions
FOR INSERT
TO authenticated
WITH CHECK (
  -- الأدمن والمديرون يمكنهم إضافة إجراءات على أي شكوى
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.user_type IN ('app_admin', 'manager')
  )
  OR
  -- النواب يمكنهم إضافة إجراءات على شكاواهم المسندة
  EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_actions.complaint_id
    AND complaints.assigned_deputy_id = auth.uid()
  )
);

-- ============================================
-- تم إنشاء جميع الـ Policies بنجاح!
-- ============================================

