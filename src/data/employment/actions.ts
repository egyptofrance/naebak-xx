'use server';

import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';
import { getUserProfile } from '../user/queries';
import { revalidatePath } from 'next/cache';

export async function createOrUpdateEmploymentProfile(formData: {
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
  portfolio_url?: string;
  additional_documents?: string[];
}) {
  const supabase = createSupabaseUserServerActionClient();
  const user = await getUserProfile();

  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  // Check if profile exists
  const { data: existing } = await supabase
    .from('user_employment_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Update existing profile
    const { error } = await supabase
      .from('user_employment_profiles')
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating employment profile:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/my-cv');
    return { success: true, profileId: existing.id };
  } else {
    // Create new profile
    const { data, error } = await supabase
      .from('user_employment_profiles')
      .insert({
        user_id: user.id,
        ...formData,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating employment profile:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/my-cv');
    return { success: true, profileId: data.id };
  }
}

export async function submitJobApplication(jobId: string, employmentProfileId: string) {
  const supabase = createSupabaseUserServerActionClient();
  const user = await getUserProfile();

  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  // Check if already applied
  const { data: existing } = await supabase
    .from('job_applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    return { success: false, error: 'Already applied to this job' };
  }

  // Create application
  const { error } = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      user_id: user.id,
      employment_profile_id: employmentProfileId,
      status: 'pending',
    });

  if (error) {
    console.error('Error submitting job application:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/my-applications');
  return { success: true };
}
