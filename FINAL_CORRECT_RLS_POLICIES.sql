-- ============================================
-- RLS Policies النهائية الصحيحة لنظام الشكاوى
-- ============================================

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
-- Policies لجدول complaints
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
-- (الأدمن: app_metadata.user_role = 'admin')
CREATE POLICY "Admins can view all complaints"
ON complaints
FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
);

-- Policy 4: المديرون يمكنهم قراءة جميع الشكاوى
-- (المدير: له سجل في manager_permissions)
CREATE POLICY "Managers can view all complaints"
ON complaints
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM manager_permissions
    WHERE manager_permissions.user_id = auth.uid()
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
  (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
  OR
  -- Manager check
  EXISTS (
    SELECT 1 FROM manager_permissions
    WHERE manager_permissions.user_id = auth.uid()
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
-- Policies لجدول complaint_actions
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
  (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
  OR
  -- Manager check
  EXISTS (
    SELECT 1 FROM manager_permissions
    WHERE manager_permissions.user_id = auth.uid()
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
  (auth.jwt() -> 'app_metadata' ->> 'user_role') = 'admin'
  OR
  -- Manager check
  EXISTS (
    SELECT 1 FROM manager_permissions
    WHERE manager_permissions.user_id = auth.uid()
  )
  OR
  -- Deputy check (على شكاواه المسندة فقط)
  EXISTS (
    SELECT 1 FROM complaints
    WHERE complaints.id = complaint_actions.complaint_id
    AND complaints.assigned_deputy_id = auth.uid()
  )
);

-- ============================================
-- تم التحديث بنجاح!
-- ============================================

-- للتحقق من نجاح العملية:
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('complaints', 'complaint_actions')
ORDER BY tablename, policyname;

