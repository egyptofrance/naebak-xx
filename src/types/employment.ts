// Employment System Types

export type EducationLevel = 
  | 'high-school'
  | 'diploma'
  | 'bachelor'
  | 'master'
  | 'phd'
  | 'other';

export type Gender = 'male' | 'female';

export type ApplicationStatus = 
  | 'pending'
  | 'reviewing'
  | 'shortlisted'
  | 'accepted'
  | 'rejected';

export interface UserEmploymentProfile {
  id: string;
  user_id: string;
  
  // Personal Info
  full_name: string;
  date_of_birth: string | null;
  gender: Gender | null;
  phone: string;
  national_id: string | null;
  
  // Location
  governorate_id: string | null;
  city: string | null;
  address: string | null;
  
  // Education
  education_level: EducationLevel | null;
  major: string | null;
  university: string | null;
  graduation_year: number | null;
  gpa: number | null;
  
  // Experience
  years_of_experience: number;
  current_job_title: string | null;
  current_company: string | null;
  
  // Skills
  skills: string[] | null;
  languages: string[] | null;
  
  // Files
  cv_file_url: string | null;
  profile_picture_url: string | null;
  
  // Additional Info
  bio: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  
  // Status
  is_complete: boolean;
  is_looking_for_job: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateEmploymentProfileInput {
  full_name: string;
  phone: string;
  date_of_birth?: string;
  gender?: Gender;
  national_id?: string;
  governorate_id?: string;
  city?: string;
  address?: string;
  education_level?: EducationLevel;
  major?: string;
  university?: string;
  graduation_year?: number;
  gpa?: number;
  years_of_experience?: number;
  current_job_title?: string;
  current_company?: string;
  skills?: string[];
  languages?: string[];
  cv_file_url?: string;
  profile_picture_url?: string;
  bio?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  is_looking_for_job?: boolean;
}

export interface UpdateEmploymentProfileInput extends Partial<CreateEmploymentProfileInput> {
  is_complete?: boolean;
}

export interface JobApplicationWithDetails {
  id: string;
  job_id: string;
  user_id: string | null;
  employment_profile_id: string | null;
  
  // Application Data
  full_name: string;
  email: string;
  phone: string;
  cv_url: string | null;
  cover_letter: string | null;
  
  // Status
  status: ApplicationStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  company_notes: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations
  job?: {
    id: string;
    title: string;
    company_name: string | null;
    category: string;
    work_location: string | null;
  };
}

export interface CompanyProfile {
  id: string;
  user_id: string;
  
  // Company Info
  company_name: string;
  company_name_en: string | null;
  commercial_registration: string | null;
  tax_id: string | null;
  
  // Contact
  phone: string;
  email: string | null;
  website: string | null;
  
  // Address
  governorate_id: string | null;
  city: string | null;
  address: string | null;
  
  // Additional Info
  industry: string | null;
  company_size: string | null;
  founded_year: number | null;
  description: string | null;
  logo_url: string | null;
  
  // Status
  status: 'pending' | 'active' | 'suspended';
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyProfileInput {
  company_name: string;
  phone: string;
  company_name_en?: string;
  commercial_registration?: string;
  tax_id?: string;
  email?: string;
  website?: string;
  governorate_id?: string;
  city?: string;
  address?: string;
  industry?: string;
  company_size?: string;
  founded_year?: number;
  description?: string;
  logo_url?: string;
}
