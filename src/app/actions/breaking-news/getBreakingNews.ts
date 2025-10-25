"use server";

import { createClient } from "@/lib/supabase/server";

export async function getBreakingNews() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("breaking_news")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[getBreakingNews] Error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[getBreakingNews] Exception:", error);
    return [];
  }
}

