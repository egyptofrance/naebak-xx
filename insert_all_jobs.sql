-- إضافة جميع وظائف منصة نائبك
-- Complete version with all 7 job types

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
  
  -- ============================================================
  -- 1. موظف كول سنتر - شركة موسكو (إعلان شركة)
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name, company_phone, is_company_ad,
    category, category_id, work_location, employment_type,
    governorate, governorate_id, office_address,
    salary_min, salary_max, salary_currency,
    requirements, benefits, status, positions_available
  ) VALUES (
    'موظف كول سنتر',
    'تعلن شركة موسكو للمقاولات العامة عن حاجتها لموظفي كول سنتر للعمل في مقرها بمدينة نصر.

المهام الوظيفية:
• الرد على استفسارات العملاء عبر الهاتف
• تقديم المعلومات عن خدمات الشركة
• حل مشاكل العملاء وتوجيههم للأقسام المختصة
• تسجيل بيانات العملاء والطلبات
• المتابعة مع الأقسام الداخلية

ساعات العمل:
• من السبت إلى الخميس، 8 ساعات يومياً (شفت صباحي أو مسائي)
• يوم الجمعة إجازة',
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
    ARRAY['مؤهل عالي أو متوسط', 'خبرة سنة على الأقل في خدمة العملاء', 'مهارات تواصل ممتازة', 'إجادة استخدام الكمبيوتر', 'القدرة على العمل تحت الضغط', 'اللباقة في الحديث', 'الالتزام بمواعيد العمل'],
    ARRAY['راتب ثابت 4000 جنيه شهرياً', 'تأمين صحي واجتماعي', 'بدل انتقالات ووجبات', 'حوافز شهرية على الأداء', 'فرص للترقي والتطور الوظيفي', 'بيئة عمل احترافية'],
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
      title, description, company_name,
      category, category_id, work_location, employment_type,
      governorate, governorate_id,
      salary_min, salary_max, salary_currency,
      requirements, benefits, status, positions_available
    ) VALUES (
      'ممثل منصة نائبك في ' || gov_record.name_ar,
      'تعلن منصة نائبك عن حاجتها لممثلين في جميع محافظات مصر للمساهمة في تحسين التواصل بين المواطنين والنواب.

المهام الوظيفية:
• تمثيل المنصة في المحافظة
• التواصل مع المواطنين والاستماع لمشاكلهم
• مساعدة المواطنين في تقديم الشكاوى عبر المنصة
• التنسيق مع النواب والجهات المعنية
• تنظيم فعاليات توعوية في المحافظة
• إعداد تقارير دورية عن أوضاع المحافظة

ساعات العمل:
• مرونة في ساعات العمل
• يمكن العمل من المنزل + زيارات ميدانية
• دوام جزئي أو كامل حسب الرغبة',
      'منصة نائبك',
      'public-relations',
      cat_public_relations,
      'hybrid',
      'part-time',
      gov_record.name_ar,
      gov_record.id,
      2000,
      5000,
      'EGP',
      ARRAY['مؤهل عالي (يفضل علوم اجتماعية أو سياسية)', 'إقامة دائمة في المحافظة', 'معرفة جيدة بالمحافظة وقضاياها', 'مهارات تواصل وإقناع ممتازة', 'إجادة استخدام وسائل التواصل الاجتماعي', 'امتلاك هاتف ذكي وإنترنت', 'القدرة على التنقل داخل المحافظة'],
      ARRAY['راتب شهري من 2000 إلى 5000 جنيه حسب الخبرة', 'حوافز على عدد الشكاوى المسجلة', 'مكافآت على الفعاليات الناجحة', 'بدل انتقالات للزيارات الميدانية', 'تدريب مجاني على المنصة', 'شهادة خبرة معتمدة', 'فرصة لخدمة المجتمع', 'مرونة في ساعات العمل'],
      'active',
      1
    );
  END LOOP;
  
  RAISE NOTICE 'تم إضافة: ممثلي المحافظات (27 وظيفة)';
  
  -- ============================================================
  -- 3. موظف خدمة عملاء - استقبال الشكاوى
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name,
    category, category_id, work_location, employment_type,
    governorate, governorate_id, office_address,
    salary_min, salary_max, salary_currency,
    requirements, benefits, status, positions_available
  ) VALUES (
    'موظف خدمة عملاء - استقبال الشكاوى',
    'تعلن منصة نائبك عن حاجتها لموظفي خدمة عملاء متخصصين في استقبال ومعالجة شكاوى المواطنين.

المهام الوظيفية:
• استقبال شكاوى المواطنين عبر الهاتف والموقع
• تصنيف الشكاوى حسب النوع والأولوية
• إدخال بيانات الشكاوى في النظام
• المتابعة مع الأقسام المختصة
• الرد على استفسارات المواطنين
• إعداد تقارير يومية عن الشكاوى
• التواصل مع المواطنين لإبلاغهم بتطورات شكاواهم

ساعات العمل:
• من السبت إلى الخميس
• 8 ساعات يومياً
• شفت صباحي (9 ص - 5 م)',
    'منصة نائبك',
    'customer-service',
    cat_customer_service,
    'office',
    'full-time',
    'القاهرة',
    gov_cairo,
    'وسط البلد، القاهرة',
    4500,
    6000,
    'EGP',
    ARRAY['مؤهل عالي (يفضل خدمة اجتماعية أو آداب)', 'خبرة سنتين على الأقل في خدمة العملاء', 'مهارات استماع وتعاطف ممتازة', 'إجادة الكتابة العربية بشكل صحيح', 'إجادة استخدام Microsoft Office', 'الصبر والقدرة على التعامل مع الضغوط', 'الالتزام والدقة في العمل'],
    ARRAY['راتب من 4500 إلى 6000 جنيه حسب الخبرة', 'تأمين صحي شامل', 'بدل انتقالات 300 جنيه شهرياً', 'بدل وجبات 200 جنيه شهرياً', 'حوافز شهرية على الأداء', 'إجازة سنوية 21 يوم', 'تدريب مستمر على مهارات خدمة العملاء', 'بيئة عمل إيجابية'],
    'active',
    3
  );
  
  RAISE NOTICE 'تم إضافة: موظف خدمة عملاء';
  
  -- ============================================================
  -- 4. موظف تسويق إلكتروني
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name,
    category, category_id, work_location, employment_type,
    governorate, governorate_id, office_address,
    salary_min, salary_max, salary_currency,
    requirements, benefits, status, positions_available
  ) VALUES (
    'موظف تسويق إلكتروني',
    'تعلن منصة نائبك عن حاجتها لموظفي تسويق إلكتروني محترفين للترويج للمنصة وخدماتها.

المهام الوظيفية:
• إدارة حسابات المنصة على وسائل التواصل الاجتماعي
• إنشاء محتوى جذاب (نصوص، صور، فيديوهات)
• تخطيط وتنفيذ الحملات التسويقية
• التفاعل مع المتابعين والرد على التعليقات
• تحليل أداء المنشورات والحملات
• إدارة الإعلانات الممولة على Facebook و Instagram
• متابعة المنافسين والترندات
• إعداد تقارير شهرية عن الأداء

ساعات العمل:
• Hybrid: 3 أيام من المنزل، يومين من المكتب
• ساعات مرنة',
    'منصة نائبك',
    'marketing',
    cat_marketing,
    'hybrid',
    'full-time',
    'القاهرة',
    gov_cairo,
    'مدينة نصر، القاهرة',
    5000,
    8000,
    'EGP',
    ARRAY['مؤهل عالي (يفضل تسويق أو إعلام)', 'خبرة 2-3 سنوات في التسويق الإلكتروني', 'إتقان استخدام Facebook, Instagram, Twitter, TikTok', 'خبرة في إدارة الإعلانات الممولة', 'مهارات كتابة محتوى إبداعي', 'معرفة بأساسيات SEO و Google Analytics', 'إجادة اللغة الإنجليزية (قراءة وكتابة)', 'معرفة بأدوات التصميم (Canva, Photoshop) ميزة إضافية'],
    ARRAY['راتب من 5000 إلى 8000 جنيه حسب الخبرة', 'نظام عمل Hybrid (3 أيام remote)', 'ساعات عمل مرنة', 'تأمين صحي', 'بدل إنترنت ومواصلات', 'حوافز على نجاح الحملات', 'دورات تدريبية في التسويق الرقمي', 'فرصة للإبداع والابتكار'],
    'active',
    2
  );
  
  RAISE NOTICE 'تم إضافة: موظف تسويق إلكتروني';
  
  -- ============================================================
  -- 5. مطور ويب - Full Stack Developer
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name,
    category, category_id, work_location, employment_type,
    governorate, governorate_id, office_address,
    salary_min, salary_max, salary_currency,
    requirements, benefits, status, positions_available
  ) VALUES (
    'مطور ويب - Full Stack Developer',
    'تعلن منصة نائبك عن حاجتها لمطوري ويب محترفين للمساهمة في تطوير وتحسين المنصة.

المهام الوظيفية:
• تطوير ميزات جديدة للمنصة
• إصلاح الأخطاء البرمجية (Bug Fixes)
• تحسين أداء المنصة وسرعة التحميل
• كتابة كود نظيف وموثق
• مراجعة كود الزملاء (Code Review)
• تطوير APIs للتكامل مع الخدمات الخارجية
• كتابة الاختبارات (Unit Tests)
• المشاركة في اجتماعات التخطيط

التقنيات المستخدمة:
• Frontend: Next.js 15, React, TypeScript, Tailwind CSS
• Backend: Supabase (PostgreSQL), Server Actions
• Tools: Git, GitHub, Vercel

ساعات العمل:
• Hybrid: 4 أيام remote، يوم واحد من المكتب
• ساعات مرنة',
    'منصة نائبك',
    'technical',
    cat_technical,
    'hybrid',
    'full-time',
    'القاهرة',
    gov_cairo,
    'مدينة نصر، القاهرة',
    8000,
    15000,
    'EGP',
    ARRAY['خبرة 3+ سنوات في تطوير الويب', 'إتقان React و Next.js', 'إتقان TypeScript', 'خبرة في Supabase أو Firebase', 'إجادة Git و GitHub', 'فهم جيد لمبادئ UI/UX', 'القدرة على العمل ضمن فريق', 'إجادة اللغة الإنجليزية (قراءة وكتابة)', 'خبرة في PostgreSQL ميزة إضافية', 'معرفة بـ Docker ميزة إضافية'],
    ARRAY['راتب من 8000 إلى 15000 جنيه حسب الخبرة', 'نظام عمل Remote 4 أيام في الأسبوع', 'ساعات عمل مرنة', 'تأمين صحي شامل', 'Laptop و Accessories للعمل', 'دورات تدريبية مجانية', 'فرصة للعمل على مشروع مؤثر', 'فريق عمل محترف ومتعاون', 'بيئة عمل تشجع على الابتكار'],
    'active',
    2
  );
  
  RAISE NOTICE 'تم إضافة: مطور ويب';
  
  -- ============================================================
  -- 6. مصمم جرافيك
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name,
    category, category_id, work_location, employment_type,
    governorate, governorate_id, office_address,
    salary_min, salary_max, salary_currency,
    requirements, benefits, status, positions_available
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
• التعاون مع فريق التسويق
• الالتزام بالهوية البصرية للمنصة

البرامج المطلوبة:
• Adobe Photoshop
• Adobe Illustrator
• Figma
• Canva
• After Effects (ميزة إضافية)

ساعات العمل:
• Hybrid: يومين من المنزل، 3 أيام من المكتب
• ساعات مرنة',
    'منصة نائبك',
    'marketing',
    cat_marketing,
    'hybrid',
    'full-time',
    'القاهرة',
    gov_cairo,
    'مدينة نصر، القاهرة',
    4000,
    7000,
    'EGP',
    ARRAY['خبرة 2+ سنوات في التصميم الجرافيكي', 'إتقان Adobe Photoshop و Illustrator', 'معرفة جيدة بـ Figma', 'حس فني عالي وإبداع', 'القدرة على العمل تحت ضغط المواعيد', 'معرفة بمبادئ UI/UX ميزة إضافية', 'خبرة في Motion Graphics ميزة إضافية', 'Portfolio قوي يعرض الأعمال السابقة'],
    ARRAY['راتب من 4000 إلى 7000 جنيه حسب الخبرة', 'نظام عمل Hybrid (يومين remote)', 'ساعات عمل مرنة', 'تأمين صحي', 'بدل مواصلات', 'حوافز على الأداء', 'فرصة لبناء Portfolio قوي', 'بيئة عمل إبداعية'],
    'active',
    1
  );
  
  RAISE NOTICE 'تم إضافة: مصمم جرافيك';
  
  -- ============================================================
  -- 7. محلل بيانات - Data Analyst
  -- ============================================================
  INSERT INTO jobs (
    title, description, company_name,
    category, category_id, work_location, employment_type,
    governorate, governorate_id, office_address,
    salary_min, salary_max, salary_currency,
    requirements, benefits, status, positions_available
  ) VALUES (
    'محلل بيانات - Data Analyst',
    'تعلن منصة نائبك عن حاجتها لمحلل بيانات محترف لتحليل بيانات الشكاوى والمستخدمين.

المهام الوظيفية:
• تحليل بيانات الشكاوى والمستخدمين
• إعداد تقارير دورية عن أداء المنصة
• إنشاء Dashboards تفاعلية
• تحديد الأنماط والاتجاهات في البيانات
• تقديم توصيات لتحسين الخدمة
• تحسين جودة البيانات والتأكد من صحتها
• إنشاء Visualizations واضحة
• التعاون مع الفرق المختلفة

الأدوات المطلوبة:
• Excel / Google Sheets (متقدم)
• SQL
• Python (Pandas, NumPy)
• Power BI أو Tableau
• Google Analytics

ساعات العمل:
• Hybrid: 3 أيام من المنزل، يومين من المكتب
• ساعات مرنة',
    'منصة نائبك',
    'data-entry',
    cat_data_entry,
    'hybrid',
    'full-time',
    'القاهرة',
    gov_cairo,
    'مدينة نصر، القاهرة',
    6000,
    10000,
    'EGP',
    ARRAY['خبرة 2+ سنوات في تحليل البيانات', 'إتقان Excel و SQL', 'معرفة بـ Python (Pandas, NumPy) ميزة إضافية', 'خبرة في Power BI أو Tableau', 'مهارات تحليلية قوية', 'القدرة على تبسيط البيانات المعقدة', 'إجادة اللغة الإنجليزية', 'معرفة بـ Google Analytics ميزة إضافية'],
    ARRAY['راتب من 6000 إلى 10000 جنيه حسب الخبرة', 'نظام عمل Hybrid (3 أيام remote)', 'ساعات عمل مرنة', 'تأمين صحي', 'بدل مواصلات وإنترنت', 'دورات تدريبية في Data Science', 'فرصة للعمل مع بيانات حقيقية ومؤثرة', 'بيئة عمل تشجع على التعلم'],
    'active',
    1
  );
  
  RAISE NOTICE 'تم إضافة: محلل بيانات';
  
  -- ============================================================
  -- Summary
  -- ============================================================
  RAISE NOTICE '========================================';
  RAISE NOTICE 'تم الانتهاء من إضافة جميع الوظائف!';
  RAISE NOTICE 'الإجمالي: 1 إعلان شركة + 27 ممثل + 5 وظائف = 33 وظيفة';
  RAISE NOTICE 'إجمالي المناصب: 41 منصب';
  RAISE NOTICE '========================================';
  
END $$;

-- التحقق من الوظائف المضافة
SELECT 
  title, 
  company_name, 
  is_company_ad, 
  positions_available,
  category,
  governorate,
  status
FROM jobs 
ORDER BY created_at DESC 
LIMIT 15;
