-- ====================================
-- Fix: Create Workspace Trigger
-- ====================================
-- هذا الـ trigger يضمن إنشاء workspace تلقائيًا لكل مستخدم جديد

-- 1. إنشاء الدالة
CREATE OR REPLACE FUNCTION public.new_user_workspace_setup()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
  new_workspace_slug TEXT;
BEGIN
  -- إنشاء workspace
  new_workspace_id := gen_random_uuid();
  new_workspace_slug := 'w-personal-' || substring(md5(random()::text) from 1 for 7);
  
  INSERT INTO public.workspaces (id, name, slug, created_at)
  VALUES (
    new_workspace_id,
    'Personal',
    new_workspace_slug,
    NOW()
  );
  
  -- إنشاء workspace_application_settings
  INSERT INTO public.workspace_application_settings (workspace_id, membership_type)
  VALUES (new_workspace_id, 'solo');
  
  -- إضافة المستخدم كـ owner
  INSERT INTO public.workspace_members (workspace_id, workspace_member_id, workspace_member_role)
  VALUES (new_workspace_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. حذف الـ trigger القديم إن وجد
DROP TRIGGER IF EXISTS on_auth_user_created_workspace ON auth.users;

-- 3. إنشاء الـ trigger الجديد
CREATE TRIGGER on_auth_user_created_workspace
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.new_user_workspace_setup();

-- 4. إصلاح المستخدمين الموجودين بدون workspace
DO $$
DECLARE
  user_record RECORD;
  new_workspace_id UUID;
  new_workspace_slug TEXT;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN workspace_members wm ON u.id = wm.workspace_member_id
    WHERE wm.workspace_member_id IS NULL
  LOOP
    -- إنشاء workspace للمستخدم
    new_workspace_id := gen_random_uuid();
    new_workspace_slug := 'w-personal-' || substring(md5(random()::text) from 1 for 7);
    
    INSERT INTO public.workspaces (id, name, slug, created_at)
    VALUES (
      new_workspace_id,
      'Personal',
      new_workspace_slug,
      NOW()
    );
    
    -- إنشاء workspace_application_settings
    INSERT INTO public.workspace_application_settings (workspace_id, membership_type)
    VALUES (new_workspace_id, 'solo');
    
    -- إضافة المستخدم كـ owner
    INSERT INTO public.workspace_members (workspace_id, workspace_member_id, workspace_member_role)
    VALUES (new_workspace_id, user_record.id, 'owner');
    
    RAISE NOTICE 'Created workspace for user: %', user_record.email;
  END LOOP;
END $$;

-- 5. إضافة workspace_application_settings للـ workspaces القديمة
INSERT INTO workspace_application_settings (workspace_id, membership_type)
SELECT w.id, 'solo'
FROM workspaces w
LEFT JOIN workspace_application_settings was ON w.id = was.workspace_id
WHERE was.workspace_id IS NULL
ON CONFLICT (workspace_id) DO NOTHING;

