"use server";

import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";

export async function getAllParties() {
  const supabase = await createSupabaseUserServerActionClient();

  const { data, error } = await supabase
    .from("parties")
    .select("id, name_ar, name_en")
    .order("name_ar", { ascending: true });

  if (error) {
    console.error("Error fetching parties:", error);
    return [];
  }

  return data || [];
}

