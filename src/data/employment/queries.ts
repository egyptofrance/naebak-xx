import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';

export async function hasEmploymentProfile(): Promise<boolean> {
  const supabase = createSupabaseUserServerComponentClient();
  const user = await serverGetLoggedInUser();

  if (!user) {
    return false;
  }

  const { data, error } = await supabase
    .from('user_employment_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  return !!data && !error;
}

export async function getEmploymentProfile() {
  const supabase = createSupabaseUserServerComponentClient();
  const user = await serverGetLoggedInUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('user_employment_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching employment profile:', error);
    return null;
  }

  return data;
}
