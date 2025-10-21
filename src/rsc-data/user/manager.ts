import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export async function getManagerProfile() {
  const supabase = await createSupabaseUserServerComponentClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Check if user has manager role
  const { data, error } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user.id)
    .eq("role", "manager")
    .maybeSingle();

  if (error) {
    console.error("[getManagerProfile] Error:", error);
    return null;
  }

  return data;
}

