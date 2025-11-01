"use server";

import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";

interface Governorate {
  id: string;
  name_ar: string;
  name_en: string | null;
  is_visible: boolean;
}

export async function getAllGovernorates(): Promise<Governorate[]> {
  const supabase = await createSupabaseUserServerActionClient();

  const { data, error } = await supabase
    .from("governorates")
    .select("id, name_ar, name_en, is_visible")
    .order("name_ar", { ascending: true });

  if (error) {
    console.error("Error fetching governorates:", error);
    return [];
  }

  return (data || []) as Governorate[];
}

