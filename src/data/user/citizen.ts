"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

/**
 * Fetch all Egyptian governorates
 */
export async function getGovernorates() {
  const supabase = await createSupabaseUserServerComponentClient();
  
  const { data, error } = await supabase
    .from("governorates")
    .select("id, name_ar, name_en")
    .order("name_en", { ascending: true });

  if (error) {
    console.error("Error fetching governorates:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Fetch all political parties
 */
export async function getParties() {
  const supabase = await createSupabaseUserServerComponentClient();
  
  const { data, error } = await supabase
    .from("parties")
    .select("id, name_ar, name_en")
    .order("name_en", { ascending: true });

  if (error) {
    console.error("Error fetching parties:", error);
    return [];
  }

  return data ?? [];
}

