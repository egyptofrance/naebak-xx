import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import type { UserEmploymentProfile, JobApplicationWithDetails } from '@/types/employment';

/**
 * Get employment profile for current user
 */
export async function getUserEmploymentProfile(): Promise<UserEmploymentProfile | null> {
  const supabase = createSupabaseUserServerComponentClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('user_employment_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data as UserEmploymentProfile;
}

/**
 * Get employment profile by ID
 */
export async function getEmploymentProfileById(id: string): Promise<UserEmploymentProfile | null> {
  const supabase = createSupabaseUserServerComponentClient();
  
  const { data, error } = await supabase
    .from('user_employment_profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data as UserEmploymentProfile;
}

/**
 * Check if user has employment profile
 */
export async function hasEmploymentProfile(): Promise<boolean> {
  const profile = await getUserEmploymentProfile();
  return profile !== null;
}

/**
 * Get user's job applications
 */
export async function getUserJobApplications(): Promise<JobApplicationWithDetails[]> {
  const supabase = createSupabaseUserServerComponentClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job:jobs (
        id,
        title,
        company_name,
        category,
        work_location
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data as JobApplicationWithDetails[];
}

/**
 * Get application by ID
 */
export async function getApplicationById(id: string): Promise<JobApplicationWithDetails | null> {
  const supabase = createSupabaseUserServerComponentClient();
  
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job:jobs (
        id,
        title,
        company_name,
        category,
        work_location
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data as JobApplicationWithDetails;
}
