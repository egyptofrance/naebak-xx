-- Test INSERT with subqueries
INSERT INTO jobs (
  title,
  company_name,
  category_id,
  governorate_id,
  work_location,
  employment_type,
  description,
  status
)
VALUES (
  'Test Job',
  'Test Company',
  (SELECT id FROM job_categories WHERE slug = 'customer-service' LIMIT 1),
  (SELECT id FROM governorates WHERE name_ar = 'القاهرة' LIMIT 1),
  'office',
  'full-time',
  'Test description',
  'active'
);
