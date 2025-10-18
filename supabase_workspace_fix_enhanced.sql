-- =====================================================
-- حل شامل ومحسن لمشكلة Workspace - NAEBAK Project
-- نسخة آمنة مع معالجة Duplicate Keys
-- =====================================================
-- 
-- هذا الملف يجمع أفضل ما في:
-- 1. fix_workspace_creation.sql (user_profiles + permissions)
-- 2. supabase_fix_workspace_trigger.sql (workspace_application_settings)
--
-- الميزات:
-- ✅ إنشاء workspace تلقائياً للمستخدمين الجدد
-- ✅ إنشاء user_profiles تلقائياً
-- ✅ إضافة workspace_application_settings (membership_type)
-- ✅ إضافة permissions كاملة للـ owner
-- ✅ إصلاح المستخدمين الحاليين بدون workspace
-- ✅ معالجة آمنة للـ duplicate keys
-- ✅ error handling محسن
--
-- تاريخ الإنشاء: 18 أكتوبر 2025
-- النسخة: 2.0 (Safe)
-- =====================================================

-- الجزء 1: إنشاء Function محسنة
-- =====================================================

CREATE OR REPLACE FUNCTION public.new_user_workspace_setup() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    workspace_name text;
    workspace_slug text;
    new_workspace_id uuid;
    user_avatar text;
BEGIN
    -- استخراج اسم المستخدم من البيانات
    IF new.raw_user_meta_data ->> 'name' IS NOT NULL THEN
        workspace_name := new.raw_user_meta_data ->> 'name';
    ELSIF new.email IS NOT NULL THEN
        workspace_name := split_part(new.email, '@', 1);
    ELSE
        workspace_name := 'User';
    END IF;

    -- استخراج الصورة الرمزية
    IF new.raw_user_meta_data ->> 'avatar_url' IS NOT NULL THEN
        user_avatar := new.raw_user_meta_data ->> 'avatar_url';
    ELSE
        user_avatar := NULL;
    END IF;

    -- إنشاء slug فريد للـ workspace
    workspace_slug := 'w-personal-' || substr(md5(random()::text || new.id::text), 1, 7);

    -- إنشاء workspace جديد
    INSERT INTO public.workspaces (name, slug, created_at)
    VALUES ('Personal', workspace_slug, NOW())
    RETURNING id INTO new_workspace_id;

    -- ✅ إضافة workspace_application_settings (مع ON CONFLICT للأمان)
    INSERT INTO public.workspace_application_settings (workspace_id, membership_type)
    VALUES (new_workspace_id, 'solo')
    ON CONFLICT (workspace_id) DO NOTHING;

    -- إنشاء user profile
    INSERT INTO public.user_profiles (id, full_name, avatar_url, created_at)
    VALUES (new.id, workspace_name, user_avatar, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- إضافة المستخدم كـ owner في workspace_members مع permissions كاملة
    INSERT INTO public.workspace_members (
        workspace_id,
        workspace_member_id,
        workspace_member_role,
        added_at,
        permissions
    )
    VALUES (
        new_workspace_id,
        new.id,
        'owner',
        NOW(),
        jsonb_build_object(
            'add_projects', true,
            'edit_members', true,
            'view_billing', true,
            'view_members', true,
            'edit_projects', true,
            'edit_settings', true,
            'view_projects', true,
            'view_settings', true,
            'delete_members', true,
            'manage_billing', true,
            'delete_projects', true
        )
    );

    RETURN new;
EXCEPTION
    WHEN others THEN
        -- في حالة حدوث خطأ، نسجل الخطأ ونعيد new
        RAISE WARNING 'Error creating workspace for user %: %', new.id, SQLERRM;
        RETURN new;
END;
$$;

-- الجزء 2: إنشاء Trigger
-- =====================================================

-- حذف الـ trigger القديم إذا كان موجوداً
DROP TRIGGER IF EXISTS on_auth_user_created_workspace ON auth.users;

-- إنشاء الـ trigger الجديد
CREATE TRIGGER on_auth_user_created_workspace
    AFTER INSERT ON auth.users
    FOR EACH ROW
EXECUTE PROCEDURE public.new_user_workspace_setup();

-- الجزء 3: إصلاح المستخدمين الحاليين بدون Workspace
-- =====================================================

DO $$
DECLARE
    user_record RECORD;
    new_workspace_id uuid;
    workspace_slug text;
BEGIN
    -- البحث عن المستخدمين الذين ليس لديهم workspace
    FOR user_record IN 
        SELECT up.id, up.full_name, up.avatar_url, au.email, au.raw_user_meta_data
        FROM public.user_profiles up
        JOIN auth.users au ON au.id = up.id
        WHERE up.id NOT IN (
            SELECT workspace_member_id FROM public.workspace_members
        )
    LOOP
        RAISE NOTICE 'Creating workspace for user: %', user_record.id;
        
        -- إنشاء slug فريد
        workspace_slug := 'w-personal-' || substr(md5(random()::text || user_record.id::text), 1, 7);
        
        -- إنشاء workspace
        INSERT INTO public.workspaces (name, slug, created_at)
        VALUES ('Personal', workspace_slug, NOW())
        RETURNING id INTO new_workspace_id;
        
        -- ✅ إضافة workspace_application_settings (مع ON CONFLICT للأمان)
        INSERT INTO public.workspace_application_settings (workspace_id, membership_type)
        VALUES (new_workspace_id, 'solo')
        ON CONFLICT (workspace_id) DO NOTHING;
        
        -- إضافة المستخدم كـ owner
        INSERT INTO public.workspace_members (
            workspace_id,
            workspace_member_id,
            workspace_member_role,
            added_at,
            permissions
        )
        VALUES (
            new_workspace_id,
            user_record.id,
            'owner',
            NOW(),
            jsonb_build_object(
                'add_projects', true,
                'edit_members', true,
                'view_billing', true,
                'view_members', true,
                'edit_projects', true,
                'edit_settings', true,
                'view_projects', true,
                'view_settings', true,
                'delete_members', true,
                'manage_billing', true,
                'delete_projects', true
            )
        );
        
        RAISE NOTICE 'Workspace created successfully for user: % with workspace_id: %', user_record.id, new_workspace_id;
    END LOOP;
END $$;

-- الجزء 4: إضافة workspace_application_settings للـ workspaces القديمة
-- =====================================================
-- هذا الجزء يضيف settings للـ workspaces الموجودة التي ليس لها settings

INSERT INTO public.workspace_application_settings (workspace_id, membership_type)
SELECT w.id, 'solo'
FROM public.workspaces w
LEFT JOIN public.workspace_application_settings was ON w.id = was.workspace_id
WHERE was.workspace_id IS NULL
ON CONFLICT (workspace_id) DO NOTHING;

-- الجزء 5: التحقق من النتائج
-- =====================================================

-- عرض إحصائيات بعد التطبيق
SELECT 'Total Users' as metric, COUNT(*) as count FROM public.user_profiles
UNION ALL
SELECT 'Total Workspaces' as metric, COUNT(*) as count FROM public.workspaces
UNION ALL
SELECT 'Total Workspace Members' as metric, COUNT(*) as count FROM public.workspace_members
UNION ALL
SELECT 'Total Workspace Settings' as metric, COUNT(*) as count FROM public.workspace_application_settings
UNION ALL
SELECT 'Users Without Workspace' as metric, COUNT(*) as count 
FROM public.user_profiles up
WHERE up.id NOT IN (SELECT workspace_member_id FROM public.workspace_members)
UNION ALL
SELECT 'Workspaces Without Settings' as metric, COUNT(*) as count
FROM public.workspaces w
WHERE w.id NOT IN (SELECT workspace_id FROM public.workspace_application_settings);

-- =====================================================
-- ملاحظات مهمة:
-- =====================================================
-- 
-- 1. هذا الملف آمن للتشغيل عدة مرات (idempotent)
-- 2. يستخدم ON CONFLICT DO NOTHING لتجنب أخطاء duplicate key
-- 3. يجب تطبيقه في Supabase SQL Editor
-- 4. بعد التطبيق، يجب أن تكون جميع القيم في التحقق = 0 ما عدا:
--    - Total Users
--    - Total Workspaces
--    - Total Workspace Members
--    - Total Workspace Settings
-- 5. إذا كانت "Users Without Workspace" = 0 فالإصلاح نجح
-- 6. إذا كانت "Workspaces Without Settings" = 0 فالإصلاح نجح
--
-- التغييرات في النسخة 2.0:
-- ✅ إضافة ON CONFLICT (workspace_id) DO NOTHING في Function
-- ✅ إضافة ON CONFLICT (workspace_id) DO NOTHING في DO block
-- ✅ الملف الآن آمن تماماً للتشغيل حتى لو كانت بعض البيانات موجودة
--
-- =====================================================

