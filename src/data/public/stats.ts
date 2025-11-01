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

    // Get total complaints count
    const { count: totalComplaintsCount } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true });

    // Get active complaints count
    const { count: activeComplaintsCount } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .in("status", ["new", "in_progress", "pending"]);

    // Get resolved complaints count
    const { count: resolvedComplaintsCount } = await supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved");

    // Calculate resolution rate
    const resolutionRate = totalComplaintsCount && totalComplaintsCount > 0
      ? Math.round((resolvedComplaintsCount! / totalComplaintsCount) * 100)
      : 0;

    return {
      deputiesCount: deputiesCount || 0,
      activeComplaintsCount: activeComplaintsCount || 0,
      resolvedComplaintsCount: resolvedComplaintsCount || 0,
      resolutionRate,
    };
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return {
      deputiesCount: 0,
      activeComplaintsCount: 0,
      resolvedComplaintsCount: 0,
      resolutionRate: 0,
    };
  }
}
