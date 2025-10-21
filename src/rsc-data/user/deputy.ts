"use server";

import { createClient } from "@/utils/supabase/server";
import { unstable_cache } from "next/cache";

/**
 * Check if the current user is a deputy and return their deputy profile
 */
export async function getDeputyProfile() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: deputyProfile } = await supabase
    .from("deputy_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return deputyProfile;
}

/**
 * Cached version of getDeputyProfile
 */
export const getCachedDeputyProfile = unstable_cache(
  getDeputyProfile,
  ["deputy-profile"],
  {
    tags: ["deputy-profile"],
    revalidate: 60, // Cache for 1 minute
  }
);

/**
 * Check if the current user is a deputy
 */
export async function isDeputy() {
  const profile = await getDeputyProfile();
  return profile !== null;
}

