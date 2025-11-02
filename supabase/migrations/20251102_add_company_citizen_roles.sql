-- إضافة أنواع حسابات جديدة: company و citizen
-- Add new account types: company and citizen

-- إضافة 'company' إلى app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'company';

-- إضافة 'citizen' إلى app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'citizen';

-- التحقق من القيم الجديدة
-- Verify new values
DO $$
BEGIN
  RAISE NOTICE 'app_role enum values:';
  RAISE NOTICE '- admin';
  RAISE NOTICE '- company (NEW)';
  RAISE NOTICE '- citizen (NEW)';
END $$;
