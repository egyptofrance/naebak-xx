"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

/**
 * Check if the current user is a manager and return their manager profile
 */
export async function getManagerProfile() {
  const supabase = await createSupabaseUserServerComponentClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log("[getManagerProfile] User:", user?.id, user?.email);
  
  if (!user) {
    console.log("[getManagerProfile] No user found");
    return null;
  }

  // Check if user has manager permissions
  const { data: managerProfile, error } = await supabase
    .from("manager_permissions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  console.log("[getManagerProfile] Manager profile:", managerProfile, "Error:", error);

  return managerProfile;
}

/**
 * Get manager profile without caching to avoid cache collision between users
 * This is a simple query that won't impact performance
 */
export async function getCachedManagerProfile() {
  return getManagerProfile();
}

/**
 * Check if the current user is a manager
 */
export async function isManager() {
  const profile = await getManagerProfile();
  return profile !== null;
}

