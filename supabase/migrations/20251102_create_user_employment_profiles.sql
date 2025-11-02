-- إنشاء جدول user_employment_profiles
-- Create user_employment_profiles table (CV/Resume for citizens)

CREATE TABLE IF NOT EXISTS public.user_employment_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- معلومات شخصية
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10), -- male, female
  phone VARCHAR(20) NOT NULL,
  national_id VARCHAR(14),
  
  -- الموقع
  governorate_id UUID REFERENCES governorates(id),
  city VARCHAR(100),
  address TEXT,
  
  -- التعليم
  education_level VARCHAR(50), -- high-school, diploma, bachelor, master, phd, other
  major VARCHAR(200), -- التخصص
  university VARCHAR(200),
  graduation_year INTEGER,
  gpa DECIMAL(3,2),
  
  -- الخبرة
  years_of_experience INTEGER DEFAULT 0,
  current_job_title VARCHAR(200),
  current_company VARCHAR(200),
  
  -- المهارات
  skills TEXT[], -- مصفوفة المهارات
  languages TEXT[], -- اللغات
  
  -- الملفات
  cv_file_url TEXT, -- رابط ملف PDF
  profile_picture_url TEXT,
  
  -- معلومات إضافية
  bio TEXT,
  linkedin_url VARCHAR(200),
  portfolio_url VARCHAR(200),
  
  -- الحالة
  is_complete BOOLEAN DEFAULT FALSE, -- هل تم إكمال البيانات؟
  is_looking_for_job BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_phone CHECK (phone ~ '^01[0-9]{9}$'),
  CONSTRAINT valid_gender CHECK (gender IN ('male', 'female')),
  CONSTRAINT valid_education CHECK (education_level IN ('high-school', 'diploma', 'bachelor', 'master', 'phd', 'other')),
  CONSTRAINT valid_national_id CHECK (national_id IS NULL OR length(national_id) = 14)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employment_profiles_user_id ON public.user_employment_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employment_profiles_governorate ON public.user_employment_profiles(governorate_id);
CREATE INDEX IF NOT EXISTS idx_employment_profiles_complete ON public.user_employment_profiles(is_complete);
CREATE INDEX IF NOT EXISTS idx_employment_profiles_looking ON public.user_employment_profiles(is_looking_for_job);
CREATE INDEX IF NOT EXISTS idx_employment_profiles_education ON public.user_employment_profiles(education_level);

-- Enable RLS
ALTER TABLE public.user_employment_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- المواطنون يمكنهم قراءة وتعديل بياناتهم فقط
CREATE POLICY "Users can view own employment profile"
  ON public.user_employment_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own employment profile"
  ON public.user_employment_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own employment profile"
  ON public.user_employment_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- الأدمن يمكنه كل شيء
CREATE POLICY "Admins can manage all employment profiles"
  ON public.user_employment_profiles FOR ALL
  USING (public.is_application_admin(auth.uid()));

-- الشركات يمكنها رؤية profiles الباحثين عن عمل فقط (عند التقديم)
-- سيتم تطبيق هذا عبر job_applications

-- Comments
COMMENT ON TABLE public.user_employment_profiles IS 'Stores employment/CV information for citizens looking for jobs';
COMMENT ON COLUMN public.user_employment_profiles.is_complete IS 'Whether the user has completed their employment profile';
COMMENT ON COLUMN public.user_employment_profiles.is_looking_for_job IS 'Whether the user is actively looking for a job';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ user_employment_profiles table created successfully';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ RLS policies created';
END $$;
