'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';
import type {
  CreateJobInput,
  UpdateJobInput,
  CreateJobApplicationInput,
  UpdateJobApplicationInput,
} from '@/types/jobs';

/**
 * إنشاء وظيفة جديدة (للأدمن فقط)
 */
export async function createJob(input: CreateJobInput) {
  const supabase = await createSupabaseUserServerActionClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { data, error } = await (supabase as any)
      .from('jobs')
      .insert({
        ...input,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[createJob] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/jobs');
    revalidatePath('/app_admin/jobs');

    return { success: true, data };
  } catch (error) {
    console.error('[createJob] Exception:', error);
    return { success: false, error: 'Failed to create job' };
  }
}

/**
 * تحديث وظيفة (للأدمن فقط)
 */
export async function updateJob(input: UpdateJobInput) {
  const supabase = await createSupabaseUserServerActionClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { id, ...updateData } = input;

    const { data, error } = await (supabase as any)
      .from('jobs')
      .update({
        ...updateData,
        updated_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateJob] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/jobs');
    revalidatePath(`/jobs/${id}`);
    revalidatePath('/app_admin/jobs');

    return { success: true, data };
  } catch (error) {
    console.error('[updateJob] Exception:', error);
    return { success: false, error: 'Failed to update job' };
  }
}

/**
 * حذف وظيفة (للأدمن فقط)
 */
export async function deleteJob(id: string) {
  const supabase = await createSupabaseUserServerActionClient();

  try {
    const { error } = await supabase.from('jobs').delete().eq('id', id);

    if (error) {
      console.error('[deleteJob] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/jobs');
    revalidatePath('/app_admin/jobs');

    return { success: true };
  } catch (error) {
    console.error('[deleteJob] Exception:', error);
    return { success: false, error: 'Failed to delete job' };
  }
}

/**
 * تقديم طلب توظيف (للجميع)
 */
export async function submitJobApplication(input: CreateJobApplicationInput) {
  const supabase = await createSupabaseUserServerActionClient();

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .insert(input)
      .select()
      .single();

    if (error) {
      console.error('[submitJobApplication] Error:', error);
      return { success: false, error: error.message };
    }

    // زيادة عدد الطلبات في الإحصائيات
    await supabase.rpc('increment_job_applications', {
      job_uuid: input.job_id,
    });

    revalidatePath(`/jobs/${input.job_id}`);
    revalidatePath('/app_admin/job-applications');

    return { success: true, data };
  } catch (error) {
    console.error('[submitJobApplication] Exception:', error);
    return { success: false, error: 'Failed to submit application' };
  }
}

/**
 * تحديث حالة طلب التوظيف (للأدمن فقط)
 */
export async function updateJobApplication(input: UpdateJobApplicationInput) {
  const supabase = await createSupabaseUserServerActionClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { id, ...updateData } = input;

    const updatePayload: any = { ...updateData };

    // إذا تم تحديث الحالة، نضيف معلومات المراجع
    if (updateData.status) {
      updatePayload.reviewed_by = user.id;
      updatePayload.reviewed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('job_applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateJobApplication] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/app_admin/job-applications');
    revalidatePath(`/app_admin/job-applications/${id}`);

    return { success: true, data };
  } catch (error) {
    console.error('[updateJobApplication] Exception:', error);
    return { success: false, error: 'Failed to update application' };
  }
}

/**
 * حذف طلب توظيف (للأدمن فقط)
 */
export async function deleteJobApplication(id: string) {
  const supabase = await createSupabaseUserServerActionClient();

  try {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deleteJobApplication] Error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/app_admin/job-applications');

    return { success: true };
  } catch (error) {
    console.error('[deleteJobApplication] Exception:', error);
    return { success: false, error: 'Failed to delete application' };
  }
}

/**
 * رفع صورة وظيفة إلى Storage (بنفس آلية البنرات)
 * @param fileData - base64 encoded file
 * @param fileName - original file name
 * @param fileType - MIME type
 * @param jobId - job ID
 */
export async function uploadJobImage(
  fileData: string,
  fileName: string,
  fileType: string,
  jobId: string
) {
  const supabase = await createSupabaseUserServerActionClient();

  try {
    // Convert base64 to buffer
    const base64Data = fileData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `job-${jobId}-${timestamp}-${fileName}`;

    // Upload to Supabase Storage (same bucket as banners)
    const { data, error } = await supabase.storage
      .from('public-user-assets')
      .upload(uniqueFileName, buffer, {
        contentType: fileType,
        upsert: false,
      });

    if (error) {
      console.error('[uploadJobImage] Error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('public-user-assets').getPublicUrl(uniqueFileName);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('[uploadJobImage] Exception:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}

/**
 * رفع ملف CV إلى Storage
 */
export async function uploadCV(file: File, applicationId: string) {
  const supabase = await createSupabaseUserServerActionClient();

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${applicationId}-${Date.now()}.${fileExt}`;
    const filePath = `cvs/${fileName}`;

    const { data, error } = await supabase.storage
      .from('private')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('[uploadCV] Error:', error);
      return { success: false, error: error.message };
    }

    // للملفات الخاصة، نحتاج signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('private')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // صالح لمدة سنة

    if (signedUrlError) {
      console.error('[uploadCV] Signed URL Error:', signedUrlError);
      return { success: false, error: signedUrlError.message };
    }

    return { success: true, url: signedUrlData.signedUrl };
  } catch (error) {
    console.error('[uploadCV] Exception:', error);
    return { success: false, error: 'Failed to upload CV' };
  }
}

/**
 * تصدير الطلبات إلى CSV
 */
export async function exportApplicationsToCSV(filters?: any) {
  const supabase = await createSupabaseUserServerActionClient();

  try {
    let query = supabase
      .from('job_applications')
      .select('*, job:jobs(title)');

    // تطبيق الفلاتر إذا وجدت
    if (filters?.job_id) {
      query = query.eq('job_id', filters.job_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      console.error('[exportApplicationsToCSV] Error:', error);
      return { success: false, error: error.message };
    }

    // تحويل البيانات إلى CSV
    const headers = [
      'ID',
      'Job Title',
      'Full Name',
      'Email',
      'Phone',
      'Governorate',
      'Education Level',
      'Years of Experience',
      'Status',
      'Applied At',
    ];

    const rows = data?.map((app: any) => [
      app.id,
      app.job?.title || '',
      app.full_name,
      app.email,
      app.phone,
      app.governorate || '',
      app.education_level || '',
      app.years_of_experience || '',
      app.status,
      new Date(app.created_at).toLocaleDateString('ar-EG'),
    ]);

    const csv = [headers, ...(rows || [])].map((row) => row.join(',')).join('\n');

    return { success: true, csv };
  } catch (error) {
    console.error('[exportApplicationsToCSV] Exception:', error);
    return { success: false, error: 'Failed to export applications' };
  }
}
