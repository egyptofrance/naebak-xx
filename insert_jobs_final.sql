-- إضافة وظائف لمنصة نائبك
-- Final version using DO block with proper variable handling

DO $$
DECLARE
  -- Category IDs
  cat_customer_service UUID;
  cat_public_relations UUID;
  cat_marketing UUID;
  cat_technical UUID;
  cat_data_entry UUID;
  
  -- Governorate IDs
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
  
  -- ============================================================
  -- 1. موظف كول سنتر - شركة موسكو (إعلان شركة)
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name, company_phone, is_company_ad,
    category_id, work_location, employment_type, governorate_id,
    office_address, salary_min, salary_max, salary_currency,
    requirements, benefits, status, positions_available
  ) VALUES (
    'موظف كول سنتر',
    'تعلن شركة موسكو للمقاولات العامة عن حاجتها لموظفي كول سنتر للعمل في مقرها بمدينة نصر.

المهام الوظيفية:
• الرد على استفسارات العملاء عبر الهاتف
• تقديم المعلومات عن خدمات الشركة
• حل مشاكل العملاء وتوجيههم للأقسام المختصة

ساعات العمل:
• من السبت إلى الخميس، 8 ساعات يومياً',
    'شركة موسكو للمقاولات العامة',
    '01101051020',
    true,
    cat_customer_service,
    'office',
    'full-time',
    gov_cairo,
    'شارع عباس العقاد، مدينة نصر، القاهرة',
    4000,
    4000,
    'EGP',
    ARRAY['مؤهل عالي أو متوسط', 'خبرة سنة في خدمة العملاء', 'مهارات تواصل ممتازة', 'إجادة الكمبيوتر', 'القدرة على العمل تحت الضغط'],
    ARRAY['راتب ثابت 4000 جنيه', 'تأمين صحي واجتماعي', 'بدل انتقالات ووجبات', 'حوافز شهرية', 'فرص ترقي'],
    'active',
    5
  );
  
  RAISE NOTICE 'تم إضافة: موظف كول سنتر - شركة موسكو';
  
  -- ============================================================
  -- 2. ممثل منصة نائبك في المحافظات (27 وظيفة)
  -- ============================================================
  FOR gov_record IN SELECT id, name_ar FROM governorates WHERE name_ar IS NOT NULL
  LOOP
    INSERT INTO jobs (
      title, description, company_name, category_id, work_location,
      employment_type, governorate_id, salary_min, salary_max, salary_currency,
      requirements, benefits, status, positions_available
    ) VALUES (
      'ممثل منصة نائبك في ' || gov_record.name_ar,
      'تعلن منصة نائبك عن حاجتها لممثلين في جميع محافظات مصر للمساهمة في تحسين التواصل بين المواطنين والنواب.

المهام الوظيفية:
• تمثيل المنصة في المحافظة
• التواصل مع المواطنين والاستماع لمشاكلهم
• مساعدة المواطنين في تقديم الشكاوى
• التنسيق مع النواب والجهات المعنية
• تنظيم فعاليات توعوية

ساعات العمل:
• مرونة في ساعات العمل، يمكن العمل من المنزل + زيارات ميدانية',
      'منصة نائبك',
      cat_public_relations,
      'hybrid',
      'part-time',
      gov_record.id,
      2000,
      5000,
      'EGP',
      ARRAY['مؤهل عالي', 'إقامة دائمة في المحافظة', 'معرفة بالمحافظة وقضاياها', 'مهارات تواصل ممتازة', 'إجادة Social Media', 'امتلاك هاتف ذكي'],
      ARRAY['راتب 2000-5000 حسب الخبرة', 'حوافز على الشكاوى', 'بدل انتقالات', 'تدريب مجاني', 'شهادة خبرة', 'مرونة في العمل'],
      'active',
      1
    );
  END LOOP;
  
  RAISE NOTICE 'تم إضافة: ممثلي المحافظات (27 وظيفة)';
  
  -- ============================================================
  -- 3. موظف خدمة عملاء - استقبال الشكاوى
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name, category_id, work_location,
    employment_type, governorate_id, office_address, salary_min, salary_max,
    salary_currency, requirements, benefits, status, positions_available
  ) VALUES (
    'موظف خدمة عملاء - استقبال الشكاوى',
    'تعلن منصة نائبك عن حاجتها لموظفي خدمة عملاء متخصصين في استقبال ومعالجة شكاوى المواطنين.

المهام الوظيفية:
• استقبال شكاوى المواطنين عبر الهاتف والموقع
• تصنيف الشكاوى حسب النوع والأولوية
• إدخال بيانات الشكاوى في النظام
• المتابعة مع الأقسام المختصة
• إعداد تقارير يومية

ساعات العمل:
• من السبت إلى الخميس، 8 ساعات يومياً (9 ص - 5 م)',
    'منصة نائبك',
    cat_customer_service,
    'office',
    'full-time',
    gov_cairo,
    'وسط البلد، القاهرة',
    4500,
    6000,
    'EGP',
    ARRAY['مؤهل عالي (يفضل خدمة اجتماعية)', 'خبرة سنتين في خدمة العملاء', 'مهارات استماع ممتازة', 'إجادة الكتابة العربية', 'إجادة Office', 'الصبر والتعاطف'],
    ARRAY['راتب 4500-6000 حسب الخبرة', 'تأمين صحي شامل', 'بدل انتقالات 300 جنيه', 'بدل وجبات 200 جنيه', 'حوافز شهرية', 'إجازة 21 يوم', 'تدريب مستمر'],
    'active',
    3
  );
  
  RAISE NOTICE 'تم إضافة: موظف خدمة عملاء';
  
  -- ============================================================
  -- 4. موظف تسويق إلكتروني
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name, category_id, work_location,
    employment_type, governorate_id, office_address, salary_min, salary_max,
    salary_currency, requirements, benefits, status, positions_available
  ) VALUES (
    'موظف تسويق إلكتروني',
    'تعلن منصة نائبك عن حاجتها لموظفي تسويق إلكتروني محترفين للترويج للمنصة وخدماتها.

المهام الوظيفية:
• إدارة حسابات المنصة على Social Media
• إنشاء محتوى جذاب (نصوص، صور، فيديوهات)
• تخطيط وتنفيذ الحملات التسويقية
• التفاعل مع المتابعين
• تحليل أداء المنشورات
• إدارة الإعلانات الممولة

ساعات العمل:
• Hybrid: 3 أيام من المنزل، يومين من المكتب، ساعات مرنة',
    'منصة نائبك',
    cat_marketing,
    'hybrid',
    'full-time',
    gov_cairo,
    'مدينة نصر، القاهرة',
    5000,
    8000,
    'EGP',
    ARRAY['مؤهل عالي (يفضل تسويق)', 'خبرة 2-3 سنوات في التسويق الإلكتروني', 'إتقان Facebook, Instagram, Twitter', 'خبرة في الإعلانات الممولة', 'مهارات كتابة محتوى', 'معرفة بـ SEO', 'إجادة الإنجليزية'],
    ARRAY['راتب 5000-8000 حسب الخبرة', 'عمل Hybrid (3 أيام remote)', 'ساعات مرنة', 'تأمين صحي', 'بدل إنترنت ومواصلات', 'حوافز', 'دورات تدريبية'],
    'active',
    2
  );
  
  RAISE NOTICE 'تم إضافة: موظف تسويق إلكتروني';
  
  -- ============================================================
  -- 5. مطور ويب - Full Stack Developer
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name, category_id, work_location,
    employment_type, governorate_id, office_address, salary_min, salary_max,
    salary_currency, requirements, benefits, status, positions_available
  ) VALUES (
    'مطور ويب - Full Stack Developer',
    'تعلن منصة نائبك عن حاجتها لمطوري ويب محترفين للمساهمة في تطوير وتحسين المنصة.

المهام الوظيفية:
• تطوير ميزات جديدة للمنصة
• إصلاح الأخطاء البرمجية (Bug Fixes)
• تحسين أداء المنصة وسرعة التحميل
• كتابة كود نظيف وموثق
• مراجعة كود الزملاء (Code Review)
• تطوير APIs

التقنيات:
• Next.js 15, React, TypeScript, Tailwind CSS
• Supabase (PostgreSQL), Server Actions
• Git, GitHub, Vercel

ساعات العمل:
• Hybrid: 4 أيام remote، يوم واحد من المكتب، ساعات مرنة',
    'منصة نائبك',
    cat_technical,
    'hybrid',
    'full-time',
    gov_cairo,
    'مدينة نصر، القاهرة',
    8000,
    15000,
    'EGP',
    ARRAY['خبرة 3+ سنوات في تطوير الويب', 'إتقان React و Next.js', 'إتقان TypeScript', 'خبرة في Supabase أو Firebase', 'إجادة Git', 'فهم UI/UX', 'إجادة الإنجليزية'],
    ARRAY['راتب 8000-15000 حسب الخبرة', 'Remote 4 أيام', 'ساعات مرنة', 'تأمين صحي شامل', 'Laptop و Accessories', 'دورات تدريبية', 'فريق محترف', 'بيئة تشجع الابتكار'],
    'active',
    2
  );
  
  RAISE NOTICE 'تم إضافة: مطور ويب';
  
  -- ============================================================
  -- 6. مصمم جرافيك
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name, category_id, work_location,
    employment_type, governorate_id, office_address, salary_min, salary_max,
    salary_currency, requirements, benefits, status, positions_available
  ) VALUES (
    'مصمم جرافيك',
    'تعلن منصة نائبك عن حاجتها لمصمم جرافيك محترف لإنشاء محتوى بصري جذاب.

المهام الوظيفية:
• تصميم منشورات لوسائل التواصل الاجتماعي
• تصميم بانرات وإعلانات للموقع
• تصميم إنفوجرافيك لعرض الإحصائيات
• تصميم هوية بصرية للحملات
• تعديل الصور والفيديوهات
• إنشاء GIFs و Motion Graphics بسيطة

البرامج:
• Adobe Photoshop, Illustrator
• Figma, Canva
• After Effects (ميزة إضافية)

ساعات العمل:
• Hybrid: يومين من المنزل، 3 أيام من المكتب، ساعات مرنة',
    'منصة نائبك',
    cat_marketing,
    'hybrid',
    'full-time',
    gov_cairo,
    'مدينة نصر، القاهرة',
    4000,
    7000,
    'EGP',
    ARRAY['خبرة 2+ سنوات في التصميم', 'إتقان Photoshop و Illustrator', 'معرفة بـ Figma', 'حس فني عالي', 'Portfolio قوي', 'معرفة بـ UI/UX ميزة إضافية'],
    ARRAY['راتب 4000-7000 حسب الخبرة', 'عمل Hybrid (يومين remote)', 'ساعات مرنة', 'تأمين صحي', 'بدل مواصلات', 'حوافز', 'فرصة لبناء Portfolio'],
    'active',
    1
  );
  
  RAISE NOTICE 'تم إضافة: مصمم جرافيك';
  
  -- ============================================================
  -- 7. محلل بيانات - Data Analyst
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name, category_id, work_location,
    employment_type, governorate_id, office_address, salary_min, salary_max,
    salary_currency, requirements, benefits, status, positions_available
  ) VALUES (
    'محلل بيانات - Data Analyst',
    'تعلن منصة نائبك عن حاجتها لمحلل بيانات محترف لتحليل بيانات الشكاوى والمستخدمين.

المهام الوظيفية:
• تحليل بيانات الشكاوى والمستخدمين
• إعداد تقارير دورية عن أداء المنصة
• إنشاء Dashboards تفاعلية
• تحديد الأنماط والاتجاهات
• تقديم توصيات لتحسين الخدمة
• تحسين جودة البيانات
• إنشاء Visualizations واضحة

الأدوات:
• Excel / Google Sheets (متقدم)
• SQL, Python (Pandas, NumPy)
• Power BI أو Tableau
• Google Analytics

ساعات العمل:
• Hybrid: 3 أيام من المنزل، يومين من المكتب، ساعات مرنة',
    'منصة نائبك',
    cat_data_entry,
    'hybrid',
    'full-time',
    gov_cairo,
    'مدينة نصر، القاهرة',
    6000,
    10000,
    'EGP',
    ARRAY['خبرة 2+ سنوات في تحليل البيانات', 'إتقان Excel و SQL', 'معرفة بـ Python ميزة إضافية', 'خبرة في Power BI أو Tableau', 'مهارات تحليلية قوية', 'إجادة الإنجليزية'],
    ARRAY['راتب 6000-10000 حسب الخبرة', 'عمل Hybrid (3 أيام remote)', 'ساعات مرنة', 'تأمين صحي', 'بدل مواصلات وإنترنت', 'دورات في Data Science', 'بيانات حقيقية ومؤثرة'],
    'active',
    1
  );
  
  RAISE NOTICE 'تم إضافة: محلل بيانات';
  
  -- ============================================================
  -- Summary
  -- ============================================================
  RAISE NOTICE '========================================';
  RAISE NOTICE 'تم الانتهاء من إضافة جميع الوظائف!';
  RAISE NOTICE '1 إعلان شركة + 27 ممثل محافظات + 5 وظائف نائبك = 33 وظيفة';
  RAISE NOTICE '========================================';
  
END $$;

-- التحقق من الوظائف المضافة
SELECT 
  title, 
  company_name, 
  is_company_ad, 
  positions_available,
  status
FROM jobs 
ORDER BY created_at DESC 
LIMIT 10;
