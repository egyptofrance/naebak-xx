-- إنشاء جدول company_profiles
-- Create company_profiles table

CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- معلومات الشركة الأساسية
  company_name VARCHAR(200) NOT NULL,
  company_name_en VARCHAR(200),
  commercial_registration VARCHAR(50) UNIQUE,
  tax_id VARCHAR(50),
  
  -- معلومات الاتصال
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  website VARCHAR(200),
  
  -- العنوان
  governorate_id UUID REFERENCES governorates(id),
  city VARCHAR(100),
  address TEXT,
  
  -- معلومات إضافية
  industry VARCHAR(100), -- المجال (مقاولات، تكنولوجيا، إلخ)
  company_size VARCHAR(50), -- (1-10, 11-50, 51-200, 200+)
  founded_year INTEGER,
  description TEXT,
  logo_url TEXT,
  
  -- حالة الحساب
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, suspended
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_phone CHECK (phone ~ '^01[0-9]{9}$'),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'suspended'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON public.company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_status ON public.company_profiles(status);
CREATE INDEX IF NOT EXISTS idx_company_profiles_governorate ON public.company_profiles(governorate_id);
CREATE INDEX IF NOT EXISTS idx_company_profiles_verified ON public.company_profiles(verified);

-- Enable RLS
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- الشركات يمكنها قراءة وتعديل بياناتها فقط
CREATE POLICY "Companies can view own profile"
  ON public.company_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Companies can update own profile"
  ON public.company_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- الأدمن يمكنه كل شيء
CREATE POLICY "Admins can manage all companies"
  ON public.company_profiles FOR ALL
  USING (public.is_application_admin(auth.uid()));

-- الجميع يمكنهم رؤية الشركات النشطة والمتحقق منها
CREATE POLICY "Anyone can view active verified companies"
  ON public.company_profiles FOR SELECT
  USING (status = 'active' AND verified = TRUE);

-- Comments
COMMENT ON TABLE public.company_profiles IS 'Stores company profile information for companies registered on the platform';
COMMENT ON COLUMN public.company_profiles.status IS 'pending: awaiting admin approval, active: approved and active, suspended: temporarily disabled';
COMMENT ON COLUMN public.company_profiles.verified IS 'Whether the company has been verified by admin';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ company_profiles table created successfully';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ RLS policies created';
END $$;
