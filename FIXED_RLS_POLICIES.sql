-- ============================================
-- RLS Policies المحدثة لنظام الشكاوى
-- ============================================
-- يجب حذف الـ Policies القديمة أولاً ثم تنفيذ هذا الكود

-- 1. حذف جميع الـ Policies القديمة
DROP POLICY IF EXISTS "Citizens can view their own complaints" ON complaints;
DROP POLICY IF EXISTS "Citizens can create complaints" ON complaints;
DROP POLICY IF EXISTS "Citizens can update their new complaints" ON complaints;
DROP POLICY IF EXISTS "Admins can view all complaints" ON complaints;
DROP POLICY IF EXISTS "Managers can view all complaints" ON complaints;
DROP POLICY IF EXISTS "Deputies can view assigned complaints" ON complaints;
DROP POLICY IF EXISTS "Admins and managers can update all complaints" ON complaints;
DROP POLICY IF EXISTS "Deputies can update assigned complaints" ON complaints;

DROP POLICY IF EXISTS "Citizens can view actions on their complaints" ON complaint_actions;
DROP POLICY IF EXISTS "Admins and managers can view all actions" ON complaint_actions;
DROP POLICY IF EXISTS "Deputies can view actions on assigned complaints" ON complaint_actions;
DROP POLICY IF EXISTS "Authorized users can create actions" ON complaint_actions;

-- ============================================
-- Policies الجديدة لجدول complaints
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

-- Policy 3: الأدمن يمكنهم قراءة جميع الشكاوى
-- (الأدمن يتم تحديده من raw_app_meta_data)
CREATE POLICY "Admins can view all complaints"
ON complaints
FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
  OR
  (auth.jwt() -> 'app_metadata' ->> 'claims_admin') = 'true'
);

-- Policy 4: المديرون يمكنهم قراءة جميع الشكاوى
-- (المدير له سجل في manager_profiles)
CREATE POLICY "Managers can view all complaints"
ON complaints
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM manager_profiles
    WHERE manager_profiles.id = auth.uid()
  )
);

-- Policy 5: النواب يمكنهم قراءة الشكاوى المسندة لهم
CREATE POLICY "Deputies can view assigned complaints"
ON complaints
FOR SELECT
TO authenticated
USING (
  assigned_deputy_id = auth.uid()
);

-- Policy 6: الأدمن والمديرون يمكنهم تحديث جميع الشكاوى
CREATE POLICY "Admins and managers can update all complaints"
ON complaints
FOR UPDATE
TO authenticated
USING (
  -- Admin check
  (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'claims_admin') = 'true'
  )
  OR
  -- Manager check
  EXISTS (
    SELECT 1 FROM manager_profiles
    WHERE manager_profiles.id = auth.uid()
  )
);

-- Policy 7: النواب يمكنهم تحديث الشكاوى المسندة لهم
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
-- Policies الجديدة لجدول complaint_actions
-- ============================================

-- Policy 8: المواطنون يمكنهم قراءة إجراءات شكاواهم
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

-- Policy 9: الأدمن والمديرون يمكنهم قراءة جميع الإجراءات
CREATE POLICY "Admins and managers can view all actions"
ON complaint_actions
FOR SELECT
TO authenticated
USING (
  -- Admin check
  (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'claims_admin') = 'true'
  )
  OR
  -- Manager check
  EXISTS (
    SELECT 1 FROM manager_profiles
    WHERE manager_profiles.id = auth.uid()
  )
);

-- Policy 10: النواب يمكنهم قراءة إجراءات شكاواهم المسندة
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

-- Policy 11: الأدمن والمديرون والنواب يمكنهم إضافة إجراءات
CREATE POLICY "Authorized users can create actions"
ON complaint_actions
FOR INSERT
TO authenticated
WITH CHECK (
  -- Admin check
  (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'claims_admin') = 'true'
  )
  OR
  -- Manager check
  EXISTS (
    SELECT 1 FROM manager_profiles
    WHERE manager_profiles.id = auth.uid()
  )
  OR
  -- Deputy check
  EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_actions.complaint_id
    AND complaints.assigned_deputy_id = auth.uid()
  )
);

-- ============================================
-- تم التحديث بنجاح!
-- ============================================

