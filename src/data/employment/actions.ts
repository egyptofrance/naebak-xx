'use server';

import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';
import { revalidatePath } from 'next/cache';
import type { CreateEmploymentProfileInput, UpdateEmploymentProfileInput } from '@/types/employment';

/**
 * Create or update employment profile
 */
export async function upsertEmploymentProfile(
  input: CreateEmploymentProfileInput | UpdateEmploymentProfileInput
) {
  const supabase = await createSupabaseUserServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Check if profile exists
  const { data: existing } = await supabase
    .from('user_employment_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  if (existing) {
    // Update
    const { data, error } = await supabase
      .from('user_employment_profiles')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    revalidatePath('/my-cv');
    revalidatePath('/my-applications');
    
    return { success: true, data };
  } else {
    // Insert
    const { data, error } = await supabase
      .from('user_employment_profiles')
      .insert({
        user_id: user.id,
        ...input,
        is_complete: true,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    revalidatePath('/my-cv');
    revalidatePath('/my-applications');
    
    return { success: true, data };
  }
}

/**
 * Submit job application
 */
export async function submitJobApplication(jobId: string) {
  const supabase = await createSupabaseUserServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Get employment profile
  const { data: profile, error: profileError } = await supabase
    .from('user_employment_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (profileError || !profile) {
    throw new Error('Employment profile not found. Please complete your profile first.');
  }
  
  // Check if already applied
  const { data: existingApplication } = await supabase
    .from('job_applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('user_id', user.id)
    .single();
  
  if (existingApplication) {
    throw new Error('You have already applied for this job');
  }
  
  // Get user email
  const email = user.email || '';
  
  // Submit application
  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      job_id: jobId,
      user_id: user.id,
      employment_profile_id: profile.id,
      full_name: profile.full_name,
      email: email,
      phone: profile.phone,
      cv_url: profile.cv_file_url,
      national_id: profile.national_id,
      date_of_birth: profile.date_of_birth,
      governorate: profile.governorate_id, // Will be resolved by join
      city: profile.city,
      address: profile.address,
      education_level: profile.education_level,
      years_of_experience: profile.years_of_experience,
      skills: profile.skills,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) throw error;
  
  revalidatePath('/my-applications');
  revalidatePath(`/jobs/${jobId}`);
  
  return { success: true, data };
}

/**
 * Withdraw job application
 */
export async function withdrawApplication(applicationId: string) {
  const supabase = await createSupabaseUserServerActionClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Update status to rejected (withdrawn)
  const { error } = await supabase
    .from('job_applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)
    .eq('user_id', user.id);
  
  if (error) throw error;
  
  revalidatePath('/my-applications');
  
  return { success: true };
}
