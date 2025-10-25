"use server";

import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";

export async function getAllElectoralDistricts() {
  const supabase = await createSupabaseUserServerActionClient();

  const { data, error } = await supabase
    .from("electoral_districts")
    .select(`
      id,
      name,
      district_type,
      governorate:governorates(id, name_ar)
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching electoral districts:", error);
    return [];
  }

  return data || [];
}

