'use server';

import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import type {
  Job,
  JobWithStatistics,
  JobApplication,
  JobApplicationWithJob,
  JobFilters,
  ApplicationFilters,
  JobsListResponse,
  ApplicationsListResponse,
} from '@/types/jobs';

/**
 * الحصول على جميع الوظائف النشطة
 */
export async function getActiveJobs(
  filters?: JobFilters,
  page: number = 1,
  limit: number = 10
): Promise<JobsListResponse> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    let query = supabase
      .from('jobs')
      .select('*, statistics:job_statistics(*), category:job_categories(id, name_ar, name_en, slug)', { count: 'exact' })
      .eq('status', 'active');

    // تطبيق الفلاتر
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters?.work_location) {
      query = query.eq('work_location', filters.work_location);
    }
    if (filters?.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }
    if (filters?.governorate) {
      query = query.eq('governorate', filters.governorate);
    }
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // الترتيب والترقيم
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[getActiveJobs] Error:', error);
      return { jobs: [], total: 0, page, limit };
    }

    // تحويل البيانات إلى النوع الصحيح
    const jobs: JobWithStatistics[] = (data || []).map((job: any) => ({
      ...job,
      statistics: Array.isArray(job.statistics) ? job.statistics[0] : job.statistics,
    })) as JobWithStatistics[];

    return {
      jobs,
      total: count || 0,
      page,
      limit,
    };
  } catch (error) {
    console.error('[getActiveJobs] Exception:', error);
    return { jobs: [], total: 0, page, limit };
  }
}

/**
 * الحصول على وظيفة واحدة بالـ ID
 */
export async function getJobById(id: string): Promise<JobWithStatistics | null> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, statistics:job_statistics(*), category:job_categories(id, name_ar, name_en, slug)')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('[getJobById] Error:', error);
      return null;
    }

    if (!data) return null;

    // زيادة عدد المشاهدات
    await supabase.rpc('increment_job_views', { job_uuid: id });

    return {
      ...data,
      statistics: Array.isArray(data.statistics) ? data.statistics[0] : data.statistics,
    } as JobWithStatistics;
  } catch (error) {
    console.error('[getJobById] Exception:', error);
    return null;
  }
}

/**
 * الحصول على جميع الوظائف (للأدمن)
 */
export async function getAllJobs(
  filters?: JobFilters,
  page: number = 1,
  limit: number = 10
): Promise<JobsListResponse> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    let query = supabase
      .from('jobs')
      .select('*, statistics:job_statistics(*), category:job_categories(id, name_ar, name_en, slug)', { count: 'exact' });

    // تطبيق الفلاتر
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    if (filters?.work_location) {
      query = query.eq('work_location', filters.work_location);
    }
    if (filters?.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }
    if (filters?.governorate) {
      query = query.eq('governorate', filters.governorate);
    }
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // الترتيب والترقيم
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[getAllJobs] Error:', error);
      return { jobs: [], total: 0, page, limit };
    }

    const jobs: JobWithStatistics[] = (data || []).map((job: any) => ({
      ...job,
      statistics: Array.isArray(job.statistics) ? job.statistics[0] : job.statistics,
    })) as JobWithStatistics[];

    return {
      jobs,
      total: count || 0,
      page,
      limit,
    };
  } catch (error) {
    console.error('[getAllJobs] Exception:', error);
    return { jobs: [], total: 0, page, limit };
  }
}

/**
 * الحصول على طلبات التوظيف (للأدمن)
 */
export async function getJobApplications(
  filters?: ApplicationFilters,
  page: number = 1,
  limit: number = 10
): Promise<ApplicationsListResponse> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    let query = supabase
      .from('job_applications')
      .select('*, job:jobs(*)', { count: 'exact' });

    // تطبيق الفلاتر
    if (filters?.job_id) {
      query = query.eq('job_id', filters.job_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.governorate) {
      query = query.eq('governorate', filters.governorate);
    }
    if (filters?.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    // الترتيب والترقيم
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[getJobApplications] Error:', error);
      return { applications: [], total: 0, page, limit };
    }

    const applications: JobApplicationWithJob[] = (data || []).map((app: any) => ({
      ...app,
      job: Array.isArray(app.job) ? app.job[0] : app.job,
    })) as JobApplicationWithJob[];

    return {
      applications,
      total: count || 0,
      page,
      limit,
    };
  } catch (error) {
    console.error('[getJobApplications] Exception:', error);
    return { applications: [], total: 0, page, limit };
  }
}

/**
 * الحصول على طلب توظيف واحد بالـ ID (للأدمن)
 */
export async function getJobApplicationById(
  id: string
): Promise<JobApplicationWithJob | null> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*, job:jobs(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[getJobApplicationById] Error:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      job: Array.isArray(data.job) ? data.job[0] : data.job,
    } as JobApplicationWithJob;
  } catch (error) {
    console.error('[getJobApplicationById] Exception:', error);
    return null;
  }
}

/**
 * الحصول على عدد الطلبات لكل وظيفة
 */
export async function getApplicationsCountByJob(
  jobId: string
): Promise<number> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { count, error } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId);

    if (error) {
      console.error('[getApplicationsCountByJob] Error:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('[getApplicationsCountByJob] Exception:', error);
    return 0;
  }
}

/**
 * الحصول على إحصائيات عامة (للأدمن)
 */
export async function getJobsStatistics() {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // عدد الوظائف النشطة
    const { count: activeJobsCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // عدد الطلبات الجديدة (pending)
    const { count: pendingApplicationsCount } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // إجمالي الطلبات
    const { count: totalApplicationsCount } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true });

    // إجمالي المشاهدات
    const { data: statisticsData } = await supabase
      .from('job_statistics')
      .select('views_count, applications_count');

    const totalViews = statisticsData?.reduce(
      (sum, stat) => sum + (stat.views_count || 0),
      0
    ) || 0;

    return {
      activeJobs: activeJobsCount || 0,
      pendingApplications: pendingApplicationsCount || 0,
      totalApplications: totalApplicationsCount || 0,
      totalViews,
    };
  } catch (error) {
    console.error('[getJobsStatistics] Exception:', error);
    return {
      activeJobs: 0,
      pendingApplications: 0,
      totalApplications: 0,
      totalViews: 0,
    };
  }
}
