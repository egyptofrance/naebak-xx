"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export async function getPublicStats() {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // Get total deputies count (current deputies only)
    const { count: deputiesCount } = await supabase
      .from("deputy_profiles")
      .select("*", { count: "exact", head: true })
      .eq("deputy_status", "current");

    // Get new complaints count
    const { count: newComplaintsCount } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "new");

    // Get under review complaints count
    const { count: underReviewComplaintsCount } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "under_review");

    // Get in progress complaints count
    const { count: inProgressComplaintsCount } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress");

    // Get resolved complaints count
    const { count: resolvedComplaintsCount } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved");

    return {
      deputiesCount: deputiesCount || 0,
      newComplaintsCount: newComplaintsCount || 0,
      underReviewComplaintsCount: underReviewComplaintsCount || 0,
      inProgressComplaintsCount: inProgressComplaintsCount || 0,
      resolvedComplaintsCount: resolvedComplaintsCount || 0,
    };
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return {
      deputiesCount: 0,
      newComplaintsCount: 0,
      underReviewComplaintsCount: 0,
      inProgressComplaintsCount: 0,
      resolvedComplaintsCount: 0,
    };
  }
}
