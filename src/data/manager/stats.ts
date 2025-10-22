"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export async function getManagerStats() {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // Get total citizens count
    const { count: citizensCount } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true });

    // Get total deputies count
    const { count: deputiesCount } = await supabase
      .from("deputy_profiles")
      .select("*", { count: "exact", head: true });

    // Get current deputies count
    const { count: currentDeputiesCount } = await supabase
      .from("deputy_profiles")
      .select("*", { count: "exact", head: true })
      .eq("deputy_status", "current");

    // Get candidates count
    const { count: candidatesCount } = await supabase
      .from("deputy_profiles")
      .select("*", { count: "exact", head: true })
      .eq("deputy_status", "candidate");

    // Get managers count
    const { count: managersCount } = await supabase
      .from("manager_permissions")
      .select("*", { count: "exact", head: true });

    // Get governorates count
    const { count: governoratesCount } = await supabase
      .from("governorates")
      .select("*", { count: "exact", head: true });

    return {
      citizensCount: citizensCount || 0,
      deputiesCount: deputiesCount || 0,
      currentDeputiesCount: currentDeputiesCount || 0,
      candidatesCount: candidatesCount || 0,
      managersCount: managersCount || 0,
      governoratesCount: governoratesCount || 0,
    };
  } catch (error) {
    console.error("Error fetching manager stats:", error);
    return {
      citizensCount: 0,
      deputiesCount: 0,
      currentDeputiesCount: 0,
      candidatesCount: 0,
      managersCount: 0,
      governoratesCount: 0,
    };
  }
}

