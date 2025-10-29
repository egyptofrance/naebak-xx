# 📋 خطة تطوير منصة التوظيف - موقع نائبك

**تاريخ البدء:** 30 أكتوبر 2025  
**الهدف:** بناء منصة توظيف كاملة متكاملة مع الموقع

---

## 🎯 نظرة عامة على المشروع

### الميزات المطلوبة
1. ✅ صفحة عرض الوظائف المتاحة
2. ✅ لوحة تحكم للأدمن لإدارة الوظائف
3. ✅ نموذج التقديم على الوظائف
4. ✅ نظام إدارة الطلبات
5. ✅ إمكانية تحميل الطلبات

### أنواع الوظائف المستهدفة
- **وظائف المقر الرئيسي:** 5 عمارات العبور، طريق صلاح سالم، مصر الجديدة
- **موظفي Data Entry:** عمل من المنزل
- **موظفي إدارة الموقع:** عمل من المقر
- **موظفي العلاقات العامة:** واحد على الأقل في كل محافظة
- **سكرتيرة تنفيذية:** عمل من المقر
- **مسوقين إلكترونيين:** تسويق على Facebook

---

## 📊 المراحل التفصيلية

### المرحلة 1: إعداد قاعدة البيانات (Database Schema) ✅

**الوقت المتوقع:** 1-2 ساعة

#### 1.1 إنشاء جدول الوظائف (jobs)
```sql
-- الملف: supabase/migrations/20251030_create_jobs_table.sql

-- جدول الوظائف
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(10) DEFAULT 'EGP',
  work_location VARCHAR(50) NOT NULL, -- 'office', 'remote', 'hybrid'
  office_address TEXT,
  work_hours TEXT, -- مثال: "9 صباحاً - 5 مساءً"
  employment_type VARCHAR(50) NOT NULL, -- 'full-time', 'part-time', 'contract'
  category VARCHAR(100) NOT NULL, -- 'data-entry', 'management', 'public-relations', etc.
  governorate VARCHAR(100), -- للوظائف في المحافظات
  requirements TEXT[], -- متطلبات الوظيفة
  responsibilities TEXT[], -- المسؤوليات
  benefits TEXT[], -- المزايا
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'closed', 'draft'
  positions_available INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- فهارس للأداء
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_governorate ON public.jobs(governorate);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

-- تفعيل RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع يمكنهم قراءة الوظائف النشطة
CREATE POLICY "Anyone can view active jobs"
  ON public.jobs
  FOR SELECT
  USING (status = 'active');

-- سياسة الإدارة: فقط الأدمن
CREATE POLICY "Only admins can manage jobs"
  ON public.jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user
      WHERE user.id = auth.uid()
      AND user.role = 'admin'
    )
  );
```

#### 1.2 إنشاء جدول طلبات التوظيف (job_applications)
```sql
-- جدول طلبات التوظيف
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  
  -- بيانات المتقدم
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  national_id VARCHAR(50),
  date_of_birth DATE,
  governorate VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  
  -- المؤهلات والخبرة
  education_level VARCHAR(100),
  education_details TEXT,
  years_of_experience INTEGER,
  previous_experience TEXT,
  skills TEXT[],
  
  -- المرفقات
  cv_url TEXT,
  cover_letter TEXT,
  portfolio_url TEXT,
  additional_documents TEXT[], -- روابط لمستندات إضافية
  
  -- حالة الطلب
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- التواريخ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهارس للأداء
CREATE INDEX idx_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_applications_status ON public.job_applications(status);
CREATE INDEX idx_applications_email ON public.job_applications(email);
CREATE INDEX idx_applications_created_at ON public.job_applications(created_at DESC);

-- تفعيل RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- سياسة الإنشاء: الجميع يمكنهم التقديم
CREATE POLICY "Anyone can submit application"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (true);

-- سياسة القراءة والإدارة: فقط الأدمن
CREATE POLICY "Only admins can view applications"
  ON public.job_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user
      WHERE user.id = auth.uid()
      AND user.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update applications"
  ON public.job_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user
      WHERE user.id = auth.uid()
      AND user.role = 'admin'
    )
  );

-- محفز لتحديث updated_at
CREATE OR REPLACE FUNCTION update_job_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_applications_updated_at();
```

#### 1.3 إنشاء جدول إحصائيات الوظائف
```sql
-- جدول الإحصائيات
CREATE TABLE IF NOT EXISTS public.job_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id)
);

-- فهرس
CREATE INDEX idx_job_statistics_job_id ON public.job_statistics(job_id);

-- تفعيل RLS
ALTER TABLE public.job_statistics ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع
CREATE POLICY "Anyone can view job statistics"
  ON public.job_statistics
  FOR SELECT
  USING (true);

-- دالة لزيادة عدد المشاهدات
CREATE OR REPLACE FUNCTION increment_job_views(job_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.job_statistics (job_id, views_count, last_viewed_at)
  VALUES (job_uuid, 1, NOW())
  ON CONFLICT (job_id)
  DO UPDATE SET
    views_count = job_statistics.views_count + 1,
    last_viewed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة لزيادة عدد الطلبات
CREATE OR REPLACE FUNCTION increment_job_applications(job_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.job_statistics (job_id, applications_count)
  VALUES (job_uuid, 1)
  ON CONFLICT (job_id)
  DO UPDATE SET
    applications_count = job_statistics.applications_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**✅ نقطة التحقق 1:**
- [ ] تشغيل ملفات الهجرة على Supabase
- [ ] التحقق من إنشاء الجداول بنجاح
- [ ] اختبار سياسات RLS
- [ ] توليد أنواع TypeScript: `pnpm run generate:types`

---

### المرحلة 2: إنشاء أنواع TypeScript والواجهات ✅

**الوقت المتوقع:** 30 دقيقة

#### 2.1 إنشاء ملف الأنواع
```typescript
// الملف: src/types/jobs.ts

export type WorkLocation = 'office' | 'remote' | 'hybrid';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobStatus = 'active' | 'closed' | 'draft';
export type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted';

export type JobCategory = 
  | 'data-entry'
  | 'management'
  | 'public-relations'
  | 'secretary'
  | 'marketing'
  | 'technical'
  | 'other';

export interface Job {
  id: string;
  title: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
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
  status: JobStatus;
  positions_available: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  national_id?: string;
  date_of_birth?: string;
  governorate?: string;
  city?: string;
  address?: string;
  education_level?: string;
  education_details?: string;
  years_of_experience?: number;
  previous_experience?: string;
  skills?: string[];
  cv_url?: string;
  cover_letter?: string;
  portfolio_url?: string;
  additional_documents?: string[];
  status: ApplicationStatus;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JobStatistics {
  id: string;
  job_id: string;
  views_count: number;
  applications_count: number;
  last_viewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JobWithStats extends Job {
  statistics?: JobStatistics;
}

export interface JobFormData {
  title: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
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
  status: JobStatus;
  positions_available: number;
}

export interface ApplicationFormData {
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  national_id?: string;
  date_of_birth?: string;
  governorate?: string;
  city?: string;
  address?: string;
  education_level?: string;
  education_details?: string;
  years_of_experience?: number;
  previous_experience?: string;
  skills?: string[];
  cv_url?: string;
  cover_letter?: string;
  portfolio_url?: string;
}
```

**✅ نقطة التحقق 2:**
- [ ] إنشاء ملف الأنواع
- [ ] التحقق من عدم وجود أخطاء TypeScript: `pnpm tsc`

---

### المرحلة 3: إنشاء دوال Supabase للتعامل مع البيانات ✅

**الوقت المتوقع:** 1 ساعة

#### 3.1 دوال الوظائف (Jobs)
```typescript
// الملف: src/lib/api/jobs.ts

import { createClient } from '@/lib/supabase/client';
import type { Job, JobFormData, JobWithStats } from '@/types/jobs';

export async function getJobs(filters?: {
  category?: string;
  governorate?: string;
  work_location?: string;
  status?: string;
}): Promise<JobWithStats[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('jobs')
    .select(`
      *,
      statistics:job_statistics(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.governorate) {
    query = query.eq('governorate', filters.governorate);
  }
  if (filters?.work_location) {
    query = query.eq('work_location', filters.work_location);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    // افتراضياً، عرض الوظائف النشطة فقط
    query = query.eq('status', 'active');
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as JobWithStats[];
}

export async function getJobById(id: string): Promise<JobWithStats | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      statistics:job_statistics(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  // زيادة عدد المشاهدات
  await supabase.rpc('increment_job_views', { job_uuid: id });
  
  return data as JobWithStats;
}

export async function createJob(jobData: JobFormData): Promise<Job> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      ...jobData,
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Job;
}

export async function updateJob(id: string, jobData: Partial<JobFormData>): Promise<Job> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('jobs')
    .update({
      ...jobData,
      updated_by: user?.id,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Job;
}

export async function deleteJob(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadJobImage(file: File): Promise<string> {
  const supabase = createClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `jobs/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('public')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
```

#### 3.2 دوال طلبات التوظيف (Applications)
```typescript
// الملف: src/lib/api/applications.ts

import { createClient } from '@/lib/supabase/client';
import type { JobApplication, ApplicationFormData } from '@/types/jobs';

export async function getApplications(filters?: {
  job_id?: string;
  status?: string;
}): Promise<JobApplication[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.job_id) {
    query = query.eq('job_id', filters.job_id);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as JobApplication[];
}

export async function getApplicationById(id: string): Promise<JobApplication | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as JobApplication;
}

export async function submitApplication(
  applicationData: ApplicationFormData
): Promise<JobApplication> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('job_applications')
    .insert(applicationData)
    .select()
    .single();

  if (error) throw error;
  
  // زيادة عدد الطلبات
  await supabase.rpc('increment_job_applications', { 
    job_uuid: applicationData.job_id 
  });
  
  return data as JobApplication;
}

export async function updateApplicationStatus(
  id: string,
  status: string,
  adminNotes?: string
): Promise<JobApplication> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('job_applications')
    .update({
      status,
      admin_notes: adminNotes,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as JobApplication;
}

export async function uploadCV(file: File): Promise<string> {
  const supabase = createClient();
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `cvs/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('private')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('private')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function exportApplicationsToCSV(jobId?: string): Promise<Blob> {
  const applications = await getApplications(jobId ? { job_id: jobId } : undefined);
  
  const headers = [
    'الاسم الكامل',
    'البريد الإلكتروني',
    'الهاتف',
    'المحافظة',
    'المؤهل',
    'سنوات الخبرة',
    'الحالة',
    'تاريخ التقديم'
  ];
  
  const rows = applications.map(app => [
    app.full_name,
    app.email,
    app.phone,
    app.governorate || '',
    app.education_level || '',
    app.years_of_experience?.toString() || '0',
    app.status,
    new Date(app.created_at).toLocaleDateString('ar-EG')
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
}
```

**✅ نقطة التحقق 3:**
- [ ] إنشاء ملفات API
- [ ] التحقق من عدم وجود أخطاء TypeScript
- [ ] اختبار الدوال في بيئة التطوير

---

### المرحلة 4: إنشاء صفحة عرض الوظائف (Public Jobs Page) ✅

**الوقت المتوقع:** 2-3 ساعات

#### 4.1 إنشاء الصفحة الرئيسية للوظائف
```typescript
// الملف: src/app/[locale]/jobs/page.tsx

import { Suspense } from 'react';
import { Metadata } from 'next';
import JobsListClient from './JobsListClient';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('jobs');
  
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  };
}

export default async function JobsPage() {
  const t = await getTranslations('jobs');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>
      
      <Suspense fallback={<JobsListSkeleton />}>
        <JobsListClient />
      </Suspense>
    </div>
  );
}

function JobsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-lg p-6 animate-pulse">
          <div className="h-48 bg-gray-200 rounded mb-4" />
          <div className="h-6 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}
```

#### 4.2 إنشاء مكون قائمة الوظائف (Client Component)
```typescript
// الملف: src/app/[locale]/jobs/JobsListClient.tsx

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getJobs } from '@/lib/api/jobs';
import type { JobWithStats } from '@/types/jobs';
import JobCard from '@/components/jobs/JobCard';
import JobFilters from '@/components/jobs/JobFilters';

export default function JobsListClient() {
  const t = useTranslations('jobs');
  const [jobs, setJobs] = useState<JobWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadJobs();
  }, [filters]);

  async function loadJobs() {
    try {
      setLoading(true);
      const data = await getJobs(filters);
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">{t('loading')}</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">{t('noJobs')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <JobFilters onFilterChange={setFilters} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
```

#### 4.3 إنشاء مكون بطاقة الوظيفة
```typescript
// الملف: src/components/jobs/JobCard.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MapPin, Clock, Briefcase, Users } from 'lucide-react';
import type { JobWithStats } from '@/types/jobs';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface JobCardProps {
  job: JobWithStats;
}

export default function JobCard({ job }: JobCardProps) {
  const t = useTranslations('jobs');
  
  const workLocationLabels = {
    office: 'من المقر',
    remote: 'عن بُعد',
    hybrid: 'مختلط',
  };
  
  const employmentTypeLabels = {
    'full-time': 'دوام كامل',
    'part-time': 'دوام جزئي',
    contract: 'عقد',
    internship: 'تدريب',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        {job.image_url && (
          <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={job.image_url}
              alt={job.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold line-clamp-2">{job.title}</h3>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {employmentTypeLabels[job.employment_type]}
            </Badge>
            <Badge variant="outline">
              {workLocationLabels[job.work_location]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.description}
        </p>
        
        <div className="space-y-2 text-sm">
          {job.office_address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-1">{job.office_address}</span>
            </div>
          )}
          
          {job.work_hours && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{job.work_hours}</span>
            </div>
          )}
          
          {(job.salary_min || job.salary_max) && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>
                {job.salary_min && job.salary_max
                  ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency}`
                  : job.salary_min
                  ? `من ${job.salary_min} ${job.salary_currency}`
                  : `حتى ${job.salary_max} ${job.salary_currency}`}
              </span>
            </div>
          )}
          
          {job.positions_available > 1 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{job.positions_available} وظائف متاحة</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          {job.statistics && (
            <span>{job.statistics.applications_count} متقدم</span>
          )}
        </div>
        
        <Link href={`/jobs/${job.id}`}>
          <Button>{t('viewDetails')}</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
```

#### 4.4 إنشاء صفحة تفاصيل الوظيفة
```typescript
// الملف: src/app/[locale]/jobs/[id]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getJobById } from '@/lib/api/jobs';
import JobDetailsClient from './JobDetailsClient';

interface JobPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const job = await getJobById(params.id);
  
  if (!job) {
    return {
      title: 'الوظيفة غير موجودة',
    };
  }
  
  return {
    title: job.title,
    description: job.description.substring(0, 160),
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const job = await getJobById(params.id);
  
  if (!job) {
    notFound();
  }
  
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <JobDetailsClient job={job} />
    </Suspense>
  );
}
```

**✅ نقطة التحقق 4:**
- [ ] إنشاء صفحة الوظائف
- [ ] اختبار عرض الوظائف
- [ ] اختبار الفلاتر
- [ ] اختبار صفحة التفاصيل
- [ ] **نشر على Vercel والتحقق من النجاح**

---

### المرحلة 5: إنشاء نموذج التقديم على الوظيفة ✅

**الوقت المتوقع:** 2-3 ساعات

#### 5.1 إنشاء مكون نموذج التقديم
```typescript
// الملف: src/components/jobs/ApplicationForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitApplication, uploadCV } from '@/lib/api/applications';
import type { ApplicationFormData } from '@/types/jobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const applicationSchema = z.object({
  full_name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(11, 'رقم الهاتف غير صحيح'),
  governorate: z.string().optional(),
  city: z.string().optional(),
  education_level: z.string().optional(),
  years_of_experience: z.number().min(0).optional(),
  cover_letter: z.string().optional(),
  cv_file: z.instanceof(File).optional(),
});

interface ApplicationFormProps {
  jobId: string;
  onSuccess?: () => void;
}

export default function ApplicationForm({ jobId, onSuccess }: ApplicationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  async function onSubmit(data: ApplicationFormData) {
    try {
      setLoading(true);
      
      // رفع السيرة الذاتية إذا كانت موجودة
      let cvUrl;
      if (cvFile) {
        cvUrl = await uploadCV(cvFile);
      }
      
      // إرسال الطلب
      await submitApplication({
        ...data,
        job_id: jobId,
        cv_url: cvUrl,
      });
      
      toast.success('تم إرسال طلبك بنجاح!');
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/jobs?success=true');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">الاسم الكامل *</Label>
          <Input
            id="full_name"
            {...register('full_name')}
            placeholder="أدخل اسمك الكامل"
          />
          {errors.full_name && (
            <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email">البريد الإلكتروني *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="01xxxxxxxxx"
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="governorate">المحافظة</Label>
          <Input
            id="governorate"
            {...register('governorate')}
            placeholder="القاهرة"
          />
        </div>
        
        <div>
          <Label htmlFor="education_level">المؤهل الدراسي</Label>
          <Input
            id="education_level"
            {...register('education_level')}
            placeholder="بكالوريوس، ماجستير، إلخ"
          />
        </div>
        
        <div>
          <Label htmlFor="years_of_experience">سنوات الخبرة</Label>
          <Input
            id="years_of_experience"
            type="number"
            {...register('years_of_experience', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="cover_letter">خطاب التقديم</Label>
        <Textarea
          id="cover_letter"
          {...register('cover_letter')}
          placeholder="اكتب نبذة عن نفسك ولماذا تريد هذه الوظيفة..."
          rows={5}
        />
      </div>
      
      <div>
        <Label htmlFor="cv_file">السيرة الذاتية (PDF)</Label>
        <Input
          id="cv_file"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setCvFile(e.target.files?.[0] || null)}
        />
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'جاري الإرسال...' : 'تقديم الطلب'}
      </Button>
    </form>
  );
}
```

**✅ نقطة التحقق 5:**
- [ ] إنشاء نموذج التقديم
- [ ] اختبار رفع الملفات
- [ ] اختبار إرسال الطلب
- [ ] التحقق من تخزين البيانات في Supabase
- [ ] **نشر على Vercel والتحقق من النجاح**

---

### المرحلة 6: لوحة تحكم الأدمن - إدارة الوظائف ✅

**الوقت المتوقع:** 3-4 ساعات

#### 6.1 صفحة قائمة الوظائف للأدمن
```typescript
// الملف: src/app/[locale]/admin/jobs/page.tsx

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AdminJobsList from './AdminJobsList';

export default function AdminJobsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">إدارة الوظائف</h1>
        <Link href="/admin/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            إضافة وظيفة جديدة
          </Button>
        </Link>
      </div>
      
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <AdminJobsList />
      </Suspense>
    </div>
  );
}
```

#### 6.2 نموذج إضافة/تعديل الوظيفة
```typescript
// الملف: src/components/admin/jobs/JobForm.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createJob, updateJob, uploadJobImage } from '@/lib/api/jobs';
import type { Job, JobFormData } from '@/types/jobs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const jobSchema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(20, 'الوصف يجب أن يكون 20 حرف على الأقل'),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  work_location: z.enum(['office', 'remote', 'hybrid']),
  office_address: z.string().optional(),
  work_hours: z.string().optional(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  category: z.string(),
  governorate: z.string().optional(),
  positions_available: z.number().min(1),
  status: z.enum(['active', 'closed', 'draft']),
});

interface JobFormProps {
  job?: Job;
  onSuccess?: () => void;
}

export default function JobForm({ job, onSuccess }: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(job?.image_url || null);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: job || {
      status: 'draft',
      positions_available: 1,
      work_location: 'office',
      employment_type: 'full-time',
    },
  });
  
  const { fields: requirementsFields, append: appendRequirement, remove: removeRequirement } = 
    useFieldArray({ control, name: 'requirements' });
  
  const { fields: responsibilitiesFields, append: appendResponsibility, remove: removeResponsibility } = 
    useFieldArray({ control, name: 'responsibilities' });
  
  const { fields: benefitsFields, append: appendBenefit, remove: removeBenefit } = 
    useFieldArray({ control, name: 'benefits' });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function onSubmit(data: JobFormData) {
    try {
      setLoading(true);
      
      // رفع الصورة إذا كانت موجودة
      let imageUrl = job?.image_url;
      if (imageFile) {
        imageUrl = await uploadJobImage(imageFile);
      }
      
      const jobData = {
        ...data,
        image_url: imageUrl,
      };
      
      if (job) {
        await updateJob(job.id, jobData);
        toast.success('تم تحديث الوظيفة بنجاح!');
      } else {
        await createJob(jobData);
        toast.success('تم إضافة الوظيفة بنجاح!');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/jobs');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('حدث خطأ أثناء حفظ الوظيفة');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* معلومات أساسية */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">المعلومات الأساسية</h2>
        
        <div>
          <Label htmlFor="title">عنوان الوظيفة *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="مثال: موظف إدخال بيانات"
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="description">وصف الوظيفة *</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="اكتب وصفاً تفصيلياً للوظيفة..."
            rows={6}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">التصنيف *</Label>
            <select
              id="category"
              {...register('category')}
              className="w-full border rounded-md p-2"
            >
              <option value="data-entry">إدخال بيانات</option>
              <option value="management">إدارة</option>
              <option value="public-relations">علاقات عامة</option>
              <option value="secretary">سكرتارية</option>
              <option value="marketing">تسويق</option>
              <option value="technical">تقني</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="employment_type">نوع التوظيف *</Label>
            <select
              id="employment_type"
              {...register('employment_type')}
              className="w-full border rounded-md p-2"
            >
              <option value="full-time">دوام كامل</option>
              <option value="part-time">دوام جزئي</option>
              <option value="contract">عقد</option>
              <option value="internship">تدريب</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* الراتب */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">الراتب</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salary_min">الحد الأدنى (جنيه)</Label>
            <Input
              id="salary_min"
              type="number"
              {...register('salary_min', { valueAsNumber: true })}
              placeholder="3000"
            />
          </div>
          
          <div>
            <Label htmlFor="salary_max">الحد الأقصى (جنيه)</Label>
            <Input
              id="salary_max"
              type="number"
              {...register('salary_max', { valueAsNumber: true })}
              placeholder="5000"
            />
          </div>
        </div>
      </div>
      
      {/* الموقع ومواعيد العمل */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">الموقع ومواعيد العمل</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="work_location">موقع العمل *</Label>
            <select
              id="work_location"
              {...register('work_location')}
              className="w-full border rounded-md p-2"
            >
              <option value="office">من المقر</option>
              <option value="remote">عن بُعد</option>
              <option value="hybrid">مختلط</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="work_hours">ساعات العمل</Label>
            <Input
              id="work_hours"
              {...register('work_hours')}
              placeholder="9 صباحاً - 5 مساءً"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="office_address">عنوان المقر</Label>
          <Input
            id="office_address"
            {...register('office_address')}
            placeholder="5 عمارات العبور، طريق صلاح سالم، مصر الجديدة"
          />
        </div>
        
        <div>
          <Label htmlFor="governorate">المحافظة (للوظائف في المحافظات)</Label>
          <Input
            id="governorate"
            {...register('governorate')}
            placeholder="القاهرة"
          />
        </div>
      </div>
      
      {/* المتطلبات */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">المتطلبات</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendRequirement('')}
          >
            <Plus className="h-4 w-4 mr-2" />
            إضافة متطلب
          </Button>
        </div>
        
        {requirementsFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...register(`requirements.${index}` as const)}
              placeholder="مثال: خبرة سنتين في المجال"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeRequirement(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* المسؤوليات */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">المسؤوليات</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendResponsibility('')}
          >
            <Plus className="h-4 w-4 mr-2" />
            إضافة مسؤولية
          </Button>
        </div>
        
        {responsibilitiesFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...register(`responsibilities.${index}` as const)}
              placeholder="مثال: إدخال البيانات بدقة"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeResponsibility(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* المزايا */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">المزايا</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendBenefit('')}
          >
            <Plus className="h-4 w-4 mr-2" />
            إضافة ميزة
          </Button>
        </div>
        
        {benefitsFields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...register(`benefits.${index}` as const)}
              placeholder="مثال: تأمين صحي"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeBenefit(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {/* الصورة */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">صورة الوظيفة</h2>
        
        {imagePreview && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <img
              src={imagePreview}
              alt="معاينة"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      
      {/* الإعدادات */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">الإعدادات</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="positions_available">عدد الوظائف المتاحة *</Label>
            <Input
              id="positions_available"
              type="number"
              {...register('positions_available', { valueAsNumber: true })}
              min="1"
            />
          </div>
          
          <div>
            <Label htmlFor="status">الحالة *</Label>
            <select
              id="status"
              {...register('status')}
              className="w-full border rounded-md p-2"
            >
              <option value="draft">مسودة</option>
              <option value="active">نشط</option>
              <option value="closed">مغلق</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* أزرار الحفظ */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'جاري الحفظ...' : job ? 'تحديث الوظيفة' : 'إضافة الوظيفة'}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          إلغاء
        </Button>
      </div>
    </form>
  );
}
```

**✅ نقطة التحقق 6:**
- [ ] إنشاء صفحات إدارة الوظائف
- [ ] اختبار إضافة وظيفة جديدة
- [ ] اختبار تعديل وظيفة
- [ ] اختبار رفع الصور
- [ ] اختبار حذف وظيفة
- [ ] **نشر على Vercel والتحقق من النجاح**

---

### المرحلة 7: لوحة تحكم الأدمن - إدارة الطلبات ✅

**الوقت المتوقع:** 2-3 ساعات

#### 7.1 صفحة قائمة الطلبات
```typescript
// الملف: src/app/[locale]/admin/applications/page.tsx

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import AdminApplicationsList from './AdminApplicationsList';
import ExportApplicationsButton from '@/components/admin/applications/ExportApplicationsButton';

export default function AdminApplicationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">إدارة طلبات التوظيف</h1>
        <ExportApplicationsButton />
      </div>
      
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <AdminApplicationsList />
      </Suspense>
    </div>
  );
}
```

#### 7.2 مكون تصدير الطلبات
```typescript
// الملف: src/components/admin/applications/ExportApplicationsButton.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportApplicationsToCSV } from '@/lib/api/applications';
import { toast } from 'sonner';

export default function ExportApplicationsButton({ jobId }: { jobId?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    try {
      setLoading(true);
      const blob = await exportApplicationsToCSV(jobId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('تم تحميل الملف بنجاح!');
    } catch (error) {
      console.error('Error exporting applications:', error);
      toast.error('حدث خطأ أثناء التصدير');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleExport} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? 'جاري التحميل...' : 'تحميل الطلبات'}
    </Button>
  );
}
```

#### 7.3 صفحة تفاصيل الطلب
```typescript
// الملف: src/app/[locale]/admin/applications/[id]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getApplicationById } from '@/lib/api/applications';
import ApplicationDetailsClient from './ApplicationDetailsClient';

interface ApplicationPageProps {
  params: {
    id: string;
  };
}

export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const application = await getApplicationById(params.id);
  
  if (!application) {
    notFound();
  }
  
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <ApplicationDetailsClient application={application} />
    </Suspense>
  );
}
```

**✅ نقطة التحقق 7:**
- [ ] إنشاء صفحات إدارة الطلبات
- [ ] اختبار عرض الطلبات
- [ ] اختبار تغيير حالة الطلب
- [ ] اختبار تصدير الطلبات إلى CSV
- [ ] اختبار تحميل الملف على الكمبيوتر
- [ ] **نشر على Vercel والتحقق من النجاح**

---

### المرحلة 8: إضافة الترجمات والتحسينات النهائية ✅

**الوقت المتوقع:** 1-2 ساعة

#### 8.1 إضافة ملفات الترجمة
```json
// الملف: messages/ar.json (إضافة القسم التالي)

{
  "jobs": {
    "title": "الوظائف المتاحة",
    "subtitle": "انضم إلى فريق نائبك واصنع الفرق",
    "pageTitle": "الوظائف - نائبك",
    "pageDescription": "تصفح الوظائف المتاحة في منصة نائبك وقدم طلبك الآن",
    "viewDetails": "عرض التفاصيل",
    "applyNow": "تقدم الآن",
    "loading": "جاري التحميل...",
    "noJobs": "لا توجد وظائف متاحة حالياً",
    "filters": {
      "category": "التصنيف",
      "location": "الموقع",
      "type": "نوع التوظيف",
      "all": "الكل"
    },
    "categories": {
      "data-entry": "إدخال بيانات",
      "management": "إدارة",
      "public-relations": "علاقات عامة",
      "secretary": "سكرتارية",
      "marketing": "تسويق",
      "technical": "تقني",
      "other": "أخرى"
    },
    "details": {
      "description": "وصف الوظيفة",
      "requirements": "المتطلبات",
      "responsibilities": "المسؤوليات",
      "benefits": "المزايا",
      "salary": "الراتب",
      "location": "الموقع",
      "workHours": "ساعات العمل",
      "positions": "عدد الوظائف المتاحة"
    },
    "application": {
      "title": "التقديم على الوظيفة",
      "success": "تم إرسال طلبك بنجاح!",
      "error": "حدث خطأ أثناء إرسال الطلب"
    }
  }
}
```

#### 8.2 إضافة روابط التنقل
```typescript
// تحديث الملف: src/components/layout/Header.tsx أو Navbar

// إضافة رابط الوظائف في القائمة الرئيسية
<Link href="/jobs">
  الوظائف
</Link>
```

**✅ نقطة التحقق 8:**
- [ ] إضافة الترجمات
- [ ] إضافة روابط التنقل
- [ ] اختبار جميع الصفحات
- [ ] التحقق من التصميم المتجاوب (Mobile)
- [ ] **نشر على Vercel والتحقق من النجاح**

---

### المرحلة 9: الاختبار الشامل والتحسينات ✅

**الوقت المتوقع:** 2-3 ساعات

#### 9.1 قائمة الاختبارات
- [ ] اختبار إضافة وظيفة جديدة من لوحة الأدمن
- [ ] اختبار تعديل وظيفة موجودة
- [ ] اختبار حذف وظيفة
- [ ] اختبار رفع صورة للوظيفة
- [ ] اختبار عرض الوظائف في الصفحة العامة
- [ ] اختبار الفلاتر (التصنيف، الموقع، نوع التوظيف)
- [ ] اختبار صفحة تفاصيل الوظيفة
- [ ] اختبار نموذج التقديم
- [ ] اختبار رفع السيرة الذاتية
- [ ] اختبار عرض الطلبات في لوحة الأدمن
- [ ] اختبار تغيير حالة الطلب
- [ ] اختبار تصدير الطلبات إلى CSV
- [ ] اختبار الصلاحيات (RLS)
- [ ] اختبار التصميم المتجاوب على الهاتف
- [ ] اختبار الأداء والسرعة

#### 9.2 تحسينات الأداء
- [ ] إضافة Lazy Loading للصور
- [ ] إضافة Caching للوظائف
- [ ] تحسين استعلامات قاعدة البيانات
- [ ] إضافة Pagination للوظائف والطلبات

#### 9.3 تحسينات UX
- [ ] إضافة رسائل تأكيد عند الحذف
- [ ] إضافة Loading States
- [ ] إضافة Error Handling
- [ ] إضافة Toast Notifications
- [ ] تحسين رسائل الأخطاء

**✅ نقطة التحقق 9:**
- [ ] إجراء جميع الاختبارات
- [ ] إصلاح أي مشاكل مكتشفة
- [ ] **نشر النسخة النهائية على Vercel**
- [ ] **التحقق من عمل جميع الميزات في الإنتاج**

---

### المرحلة 10: التوثيق والتسليم ✅

**الوقت المتوقع:** 1 ساعة

#### 10.1 إنشاء ملف التوثيق
```markdown
// الملف: docs/JOBS_PLATFORM.md

# منصة التوظيف - نائبك

## نظرة عامة
منصة توظيف متكاملة تتيح للمستخدمين تصفح الوظائف المتاحة والتقديم عليها، وللأدمن إدارة الوظائف والطلبات.

## الميزات
- عرض الوظائف المتاحة
- فلترة الوظائف حسب التصنيف والموقع
- نموذج تقديم شامل
- رفع السيرة الذاتية
- لوحة تحكم للأدمن
- إدارة الوظائف (إضافة، تعديل، حذف)
- إدارة الطلبات
- تصدير الطلبات إلى CSV

## البنية التقنية
- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** Supabase Auth

## الجداول في قاعدة البيانات
1. `jobs` - الوظائف
2. `job_applications` - طلبات التوظيف
3. `job_statistics` - إحصائيات الوظائف

## الصفحات
- `/jobs` - قائمة الوظائف
- `/jobs/[id]` - تفاصيل الوظيفة
- `/admin/jobs` - إدارة الوظائف
- `/admin/jobs/new` - إضافة وظيفة
- `/admin/jobs/[id]/edit` - تعديل وظيفة
- `/admin/applications` - إدارة الطلبات
- `/admin/applications/[id]` - تفاصيل الطلب

## الصلاحيات
- **الجميع:** عرض الوظائف النشطة، التقديم على الوظائف
- **الأدمن فقط:** إدارة الوظائف، عرض وإدارة الطلبات

## التطوير المستقبلي
- إضافة نظام إشعارات للطلبات الجديدة
- إضافة نظام تقييم المتقدمين
- إضافة نظام مقابلات أونلاين
- إضافة تكامل مع LinkedIn
```

**✅ نقطة التحقق النهائية:**
- [ ] إنشاء ملف التوثيق
- [ ] مراجعة الكود النهائي
- [ ] التأكد من نشر جميع التحديثات
- [ ] إنشاء Backup لقاعدة البيانات
- [ ] ✅ **المشروع جاهز للإطلاق!**

---

## 📝 ملاحظات مهمة

### الوظائف المطلوبة للبدء
يمكن إضافة هذه الوظائف كبيانات أولية:

1. **موظف إدخال بيانات** - عمل من المنزل
2. **موظف إدارة موقع** - مقر الشركة
3. **موظف علاقات عامة - القاهرة** - مقر الشركة
4. **موظف علاقات عامة - الإسكندرية** - الإسكندرية
5. **سكرتيرة تنفيذية** - مقر الشركة
6. **مسوق إلكتروني - Facebook** - عمل من المنزل

### عنوان المقر الرئيسي
**5 عمارات العبور، طريق صلاح سالم، مصر الجديدة، القاهرة**

---

## 🎯 الجدول الزمني المتوقع

| المرحلة | الوقت المتوقع | الحالة |
|---------|---------------|--------|
| 1. قاعدة البيانات | 1-2 ساعة | ⏳ |
| 2. الأنواع TypeScript | 30 دقيقة | ⏳ |
| 3. دوال API | 1 ساعة | ⏳ |
| 4. صفحة الوظائف | 2-3 ساعات | ⏳ |
| 5. نموذج التقديم | 2-3 ساعات | ⏳ |
| 6. لوحة الأدمن - الوظائف | 3-4 ساعات | ⏳ |
| 7. لوحة الأدمن - الطلبات | 2-3 ساعات | ⏳ |
| 8. الترجمات والتحسينات | 1-2 ساعة | ⏳ |
| 9. الاختبار الشامل | 2-3 ساعات | ⏳ |
| 10. التوثيق | 1 ساعة | ⏳ |
| **المجموع** | **16-24 ساعة** | |

---

## ✅ قائمة المراجعة النهائية

### قبل الإطلاق
- [ ] جميع الجداول منشأة في Supabase
- [ ] سياسات RLS مفعلة ومختبرة
- [ ] جميع الصفحات تعمل بشكل صحيح
- [ ] النماذج تعمل وترسل البيانات
- [ ] رفع الملفات يعمل
- [ ] تصدير CSV يعمل
- [ ] الصلاحيات مضبوطة
- [ ] التصميم متجاوب
- [ ] الترجمات كاملة
- [ ] التوثيق جاهز
- [ ] النشر على Vercel ناجح

### بعد الإطلاق
- [ ] مراقبة الأخطاء عبر Sentry
- [ ] متابعة الأداء
- [ ] جمع ملاحظات المستخدمين
- [ ] تحديثات دورية

---

**🎉 بالتوفيق في بناء منصة التوظيف! 🎉**
