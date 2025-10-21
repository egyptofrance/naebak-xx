"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

/**
 * Check if the current user is a deputy and return their deputy profile
 */
export async function getDeputyProfile() {
  const supabase = await createSupabaseUserServerComponentClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log("[getDeputyProfile] User:", user?.id, user?.email);
  
  if (!user) {
    console.log("[getDeputyProfile] No user found");
    return null;
  }

  const { data: deputyProfile, error } = await supabase
    .from("deputy_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  console.log("[getDeputyProfile] Deputy profile:", deputyProfile, "Error:", error);

  return deputyProfile;
}

/**
 * Get deputy profile without caching to avoid cache collision between users
 * This is a simple query that won't impact performance
 */
export async function getCachedDeputyProfile() {
  return getDeputyProfile();
}

/**
 * Check if the current user is a deputy
 */
export async function isDeputy() {
  const profile = await getDeputyProfile();
  return profile !== null;
}

