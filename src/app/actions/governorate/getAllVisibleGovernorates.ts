"use server";

import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";

interface Governorate {
  id: string;
  name_ar: string;
  name_en: string | null;
}

/**
 * Get all visible governorates (for public-facing pages)
 * Only returns governorates where is_visible = true
 */
export async function getAllVisibleGovernorates(): Promise<Governorate[]> {
  const supabase = await createSupabaseUserServerActionClient();

  const { data, error } = await supabase
    .from("governorates")
    .select("id, name_ar, name_en")
    .eq("is_visible", true)
    .order("name_ar", { ascending: true });

  if (error) {
    console.error("Error fetching visible governorates:", error);
    return [];
  }

  return (data || []) as Governorate[];
}
