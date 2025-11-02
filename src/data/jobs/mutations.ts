/**
 * Job Mutations - إضافة وتعديل الوظائف
 */

import { supabaseUserClientComponent } from '@/supabase-clients/user/supabaseUserClientComponent';
import type { CreateJobInput, UpdateJobInput } from '@/types/jobs';

/**
 * إنشاء وظيفة جديدة أو إعلان شركة
 */
export async function createJob(input: CreateJobInput) {
  try {
    const supabase = supabaseUserClientComponent;

    // Prepare job data
    const jobData = {
      title: input.title,
      description: input.description,
      company_name: input.company_name || null,
      company_phone: input.company_phone || null,
      is_company_ad: input.is_company_ad || false,
      salary_min: input.salary_min || null,
      salary_max: input.salary_max || null,
      salary_currency: input.salary_currency || 'EGP',
      work_location: input.work_location,
      office_address: input.office_address || null,
      work_hours: input.work_hours || null,
      employment_type: input.employment_type,
      category_id: input.category_id,
      governorate_id: input.governorate_id || null,
      requirements: input.requirements || null,
      responsibilities: input.responsibilities || null,
      benefits: input.benefits || null,
      image_url: input.image_url || null,
      status: input.status || 'active',
      positions_available: input.positions_available || 1,
    };

    const { data, error } = await (supabase as any)
      .from('jobs')
      .insert(jobData)
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return { success: false, error: error.message };
    }

    // Create statistics record
    if (data) {
      await (supabase as any)
        .from('job_statistics')
        .insert({
          job_id: data.id,
          views_count: 0,
          applications_count: 0,
        });
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error in createJob:', error);
    return { success: false, error: error.message };
  }
}

/**
 * تحديث وظيفة موجودة
 */
export async function updateJob(input: UpdateJobInput) {
  try {
    const supabase = supabaseUserClientComponent;

    const { id, ...updateData } = input;

    const { data, error } = await (supabase as any)
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error in updateJob:', error);
    return { success: false, error: error.message };
  }
}

/**
 * حذف وظيفة
 */
export async function deleteJob(jobId: string) {
  try {
    const supabase = supabaseUserClientComponent;

    const { error } = await (supabase as any)
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteJob:', error);
    return { success: false, error: error.message };
  }
}
