"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

/**
 * Check if the current user is a manager and return their manager permissions
 */
export async function getManagerPermissions() {
  const supabase = await createSupabaseUserServerComponentClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log("[getManagerPermissions] User:", user?.id, user?.email);
  
  if (!user) {
    console.log("[getManagerPermissions] No user found");
    return null;
  }

  const { data: managerPermissions, error } = await supabase
    .from("manager_permissions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  console.log("[getManagerPermissions] Manager permissions:", managerPermissions, "Error:", error);

  return managerPermissions;
}

/**
 * Check if the current user is a manager
 */
export async function isManager() {
  const permissions = await getManagerPermissions();
  return permissions !== null;
}

