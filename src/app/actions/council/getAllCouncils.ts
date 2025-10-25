"use server";

import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";

export async function getAllCouncils() {
  const supabase = await createSupabaseUserServerActionClient();

  const { data, error } = await supabase
    .from("councils")
    .select("id, name_ar, name_en")
    .order("name_ar", { ascending: true});

  if (error) {
    console.error("Error fetching councils:", error);
    return [];
  }

  return data || [];
}

