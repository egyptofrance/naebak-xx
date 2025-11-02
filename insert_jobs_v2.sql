-- إضافة وظائف لمنصة نائبك
-- Version 2: Using both category (text) and category_id (UUID)

DO $$
DECLARE
  cat_customer_service UUID;
  cat_public_relations UUID;
  cat_marketing UUID;
  cat_technical UUID;
  cat_data_entry UUID;
  gov_cairo UUID;
  gov_record RECORD;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_customer_service FROM job_categories WHERE slug = 'customer-service' LIMIT 1;
  SELECT id INTO cat_public_relations FROM job_categories WHERE slug = 'public-relations' LIMIT 1;
  SELECT id INTO cat_marketing FROM job_categories WHERE slug = 'marketing' LIMIT 1;
  SELECT id INTO cat_technical FROM job_categories WHERE slug = 'technical' LIMIT 1;
  SELECT id INTO cat_data_entry FROM job_categories WHERE slug = 'data-entry' LIMIT 1;
  
  -- Get Cairo governorate ID
  SELECT id INTO gov_cairo FROM governorates WHERE name_ar = 'القاهرة' LIMIT 1;
  
  -- 1. موظف كول سنتر - شركة موسكو
  INSERT INTO jobs (
    title, description, company_name, company_phone, is_company_ad,
    category, category_id, work_location, employment_type, 
    governorate, governorate_id, office_address,
    salary_min, salary_max, salary_currency,
    requirements, benefits, status, positions_available
  ) VALUES (
    'موظف كول سنتر',
    'تعلن شركة موسكو للمقاولات العامة عن حاجتها لموظفي كول سنتر للعمل في مقرها بمدينة نصر.',
    'شركة موسكو للمقاولات العامة',
    '01101051020',
    true,
    'customer-service',
    cat_customer_service,
    'office',
    'full-time',
    'القاهرة',
    gov_cairo,
    'شارع عباس العقاد، مدينة نصر، القاهرة',
    4000,
    4000,
    'EGP',
    ARRAY['مؤهل عالي أو متوسط', 'خبرة سنة في خدمة العملاء'],
    ARRAY['راتب ثابت 4000 جنيه', 'تأمين صحي'],
    'active',
    5
  );
  
  RAISE NOTICE 'تم إضافة: موظف كول سنتر';
  
END $$;
