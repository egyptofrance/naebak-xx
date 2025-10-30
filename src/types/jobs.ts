/**
 * أنواع TypeScript لمنصة التوظيف
 * Jobs Platform Types
 */

// ============================================================
// Enums - التعدادات
// ============================================================

export type WorkLocation = 'office' | 'remote' | 'hybrid';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export type JobCategory = 
  | 'data-entry'
  | 'management'
  | 'public-relations'
  | 'secretary'
  | 'marketing'
  | 'technical'
  | 'customer-service'
  | 'other';

export type JobStatus = 'active' | 'closed' | 'draft';

export type ApplicationStatus = 
  | 'pending'
  | 'reviewing'
  | 'shortlisted'
  | 'rejected'
  | 'accepted';

export type EducationLevel =
  | 'high-school'
  | 'diploma'
  | 'bachelor'
  | 'master'
  | 'phd'
  | 'other';

// ============================================================
// Database Types - أنواع قاعدة البيانات
// ============================================================

export interface Job {
  id: string;
  title: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  work_location: WorkLocation;
  office_address: string | null;
  work_hours: string | null;
  employment_type: EmploymentType;
  category: JobCategory;
  governorate: string | null;
  requirements: string[] | null;
  responsibilities: string[] | null;
  benefits: string[] | null;
  image_url: string | null;
  status: JobStatus;
  positions_available: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface JobApplication {
  id: string;
  job_id: string;
  
  // بيانات المتقدم
  full_name: string;
  email: string;
  phone: string;
  national_id: string | null;
  date_of_birth: string | null;
  governorate: string | null;
  city: string | null;
  address: string | null;
  
  // المؤهلات والخبرة
  education_level: EducationLevel | null;
  education_details: string | null;
  years_of_experience: number | null;
  previous_experience: string | null;
  skills: string[] | null;
  
  // المرفقات
  cv_url: string | null;
  cover_letter: string | null;
  portfolio_url: string | null;
  additional_documents: string[] | null;
  
  // حالة الطلب
  status: ApplicationStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  
  // التواريخ
  created_at: string;
  updated_at: string;
}

export interface JobStatistics {
  id: string;
  job_id: string;
  views_count: number;
  applications_count: number;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Extended Types - أنواع موسعة
// ============================================================

export interface JobWithStatistics extends Job {
  statistics?: JobStatistics;
}

export interface JobApplicationWithJob extends JobApplication {
  job?: Job;
}

// ============================================================
// Form Types - أنواع النماذج
// ============================================================

export interface CreateJobInput {
  title: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  work_location: WorkLocation;
  office_address?: string;
  work_hours?: string;
  employment_type: EmploymentType;
  category: JobCategory;
  governorate?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  image_url?: string;
  status?: JobStatus;
  positions_available?: number;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {
  id: string;
}

export interface CreateJobApplicationInput {
  job_id: string;
  
  // بيانات المتقدم
  full_name: string;
  email: string;
  phone: string;
  national_id?: string;
  date_of_birth?: string;
  governorate?: string;
  city?: string;
  address?: string;
  
  // المؤهلات والخبرة
  education_level?: EducationLevel;
  education_details?: string;
  years_of_experience?: number;
  previous_experience?: string;
  skills?: string[];
  
  // المرفقات
  cv_url?: string;
  cover_letter?: string;
  portfolio_url?: string;
  additional_documents?: string[];
}

export interface UpdateJobApplicationInput {
  id: string;
  status?: ApplicationStatus;
  admin_notes?: string;
  reviewed_by?: string;
}

// ============================================================
// Filter Types - أنواع الفلاتر
// ============================================================

export interface JobFilters {
  category?: JobCategory;
  work_location?: WorkLocation;
  employment_type?: EmploymentType;
  governorate?: string;
  status?: JobStatus;
  search?: string;
}

export interface ApplicationFilters {
  job_id?: string;
  status?: ApplicationStatus;
  governorate?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// ============================================================
// Response Types - أنواع الاستجابة
// ============================================================

export interface JobsListResponse {
  jobs: JobWithStatistics[];
  total: number;
  page: number;
  limit: number;
}

export interface ApplicationsListResponse {
  applications: JobApplicationWithJob[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================
// Constants - الثوابت
// ============================================================

export const WORK_LOCATIONS: { value: WorkLocation; label: string; labelAr: string }[] = [
  { value: 'office', label: 'Office', labelAr: 'من المقر' },
  { value: 'remote', label: 'Remote', labelAr: 'عن بُعد' },
  { value: 'hybrid', label: 'Hybrid', labelAr: 'مختلط' },
];

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string; labelAr: string }[] = [
  { value: 'full-time', label: 'Full Time', labelAr: 'دوام كامل' },
  { value: 'part-time', label: 'Part Time', labelAr: 'دوام جزئي' },
  { value: 'contract', label: 'Contract', labelAr: 'عقد' },
  { value: 'internship', label: 'Internship', labelAr: 'تدريب' },
];

export const JOB_CATEGORIES: { value: JobCategory; label: string; labelAr: string }[] = [
  { value: 'data-entry', label: 'Data Entry', labelAr: 'إدخال بيانات' },
  { value: 'management', label: 'Management', labelAr: 'إدارة' },
  { value: 'public-relations', label: 'Public Relations', labelAr: 'علاقات عامة' },
  { value: 'secretary', label: 'Secretary', labelAr: 'سكرتارية' },
  { value: 'marketing', label: 'Marketing', labelAr: 'تسويق' },
  { value: 'technical', label: 'Technical', labelAr: 'تقني' },
  { value: 'customer-service', label: 'Customer Service', labelAr: 'خدمة عملاء' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' },
];

export const JOB_STATUSES: { value: JobStatus; label: string; labelAr: string }[] = [
  { value: 'active', label: 'Active', labelAr: 'نشط' },
  { value: 'closed', label: 'Closed', labelAr: 'مغلق' },
  { value: 'draft', label: 'Draft', labelAr: 'مسودة' },
];

export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string; labelAr: string }[] = [
  { value: 'pending', label: 'Pending', labelAr: 'قيد الانتظار' },
  { value: 'reviewing', label: 'Reviewing', labelAr: 'قيد المراجعة' },
  { value: 'shortlisted', label: 'Shortlisted', labelAr: 'القائمة المختصرة' },
  { value: 'rejected', label: 'Rejected', labelAr: 'مرفوض' },
  { value: 'accepted', label: 'Accepted', labelAr: 'مقبول' },
];

export const EDUCATION_LEVELS: { value: EducationLevel; label: string; labelAr: string }[] = [
  { value: 'high-school', label: 'High School', labelAr: 'ثانوية عامة' },
  { value: 'diploma', label: 'Diploma', labelAr: 'دبلوم' },
  { value: 'bachelor', label: 'Bachelor', labelAr: 'بكالوريوس' },
  { value: 'master', label: 'Master', labelAr: 'ماجستير' },
  { value: 'phd', label: 'PhD', labelAr: 'دكتوراه' },
  { value: 'other', label: 'Other', labelAr: 'أخرى' },
];

// محافظات مصر
export const GOVERNORATES = [
  { value: 'القاهرة', label: 'القاهرة' },
  { value: 'الجيزة', label: 'الجيزة' },
  { value: 'الإسكندرية', label: 'الإسكندرية' },
  { value: 'الدقهلية', label: 'الدقهلية' },
  { value: 'البحر الأحمر', label: 'البحر الأحمر' },
  { value: 'البحيرة', label: 'البحيرة' },
  { value: 'الفيوم', label: 'الفيوم' },
  { value: 'الغربية', label: 'الغربية' },
  { value: 'الإسماعيلية', label: 'الإسماعيلية' },
  { value: 'المنوفية', label: 'المنوفية' },
  { value: 'المنيا', label: 'المنيا' },
  { value: 'القليوبية', label: 'القليوبية' },
  { value: 'الوادي الجديد', label: 'الوادي الجديد' },
  { value: 'الشرقية', label: 'الشرقية' },
  { value: 'السويس', label: 'السويس' },
  { value: 'أسوان', label: 'أسوان' },
  { value: 'أسيوط', label: 'أسيوط' },
  { value: 'بني سويف', label: 'بني سويف' },
  { value: 'بورسعيد', label: 'بورسعيد' },
  { value: 'دمياط', label: 'دمياط' },
  { value: 'الأقصر', label: 'الأقصر' },
  { value: 'قنا', label: 'قنا' },
  { value: 'كفر الشيخ', label: 'كفر الشيخ' },
  { value: 'مطروح', label: 'مطروح' },
  { value: 'شمال سيناء', label: 'شمال سيناء' },
  { value: 'جنوب سيناء', label: 'جنوب سيناء' },
  { value: 'سوهاج', label: 'سوهاج' },
];

export const EGYPT_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'الشرقية',
  'السويس',
  'أسوان',
  'أسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'الأقصر',
  'قنا',
  'كفر الشيخ',
  'مطروح',
  'شمال سيناء',
  'جنوب سيناء',
  'سوهاج',
];

// Backward compatibility
export { GOVERNORATES as EGYPT_GOVERNORATES_LIST };

export const JOB_STATUSES = [
  { value: 'active', label: 'Active', labelAr: 'نشط' },
  { value: 'closed', label: 'Closed', labelAr: 'مغلق' },
  { value: 'draft', label: 'Draft', labelAr: 'مسودة' },
];
