"use server";

import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";

export async function getAllGovernorates() {
  const supabase = await createSupabaseUserServerActionClient();

  const { data, error } = await supabase
    .from("governorates")
    .select("id, name_ar, name_en")
    .order("name_ar", { ascending: true });

  if (error) {
    console.error("Error fetching governorates:", error);
    return [];
  }

  return data || [];
}

