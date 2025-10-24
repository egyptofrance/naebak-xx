"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export async function getDeputyBySlug(slug: string) {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // Get deputy profile by slug
    const { data: deputy, error: deputyError } = await supabase
      .from("deputy_profiles")
      .select(`
        id,
        user_id
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (deputyError) {
      console.error("[getDeputyBySlug] Error:", deputyError);
      return null;
    }

    if (!deputy) {
      return null;
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select(`
        id,
        full_name,
        avatar_url
      `)
      .eq("id", deputy.user_id)
      .single();

    if (userError) {
      console.error("[getDeputyBySlug] User error:", userError);
      return null;
    }

    return {
      deputy,
      user,
    };
  } catch (error) {
    console.error("[getDeputyBySlug] Exception:", error);
    return null;
  }
}

