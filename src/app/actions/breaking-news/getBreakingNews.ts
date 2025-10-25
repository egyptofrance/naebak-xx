"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export interface BreakingNewsItem {
  id: string;
  content: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export async function getBreakingNews(): Promise<BreakingNewsItem[]> {
  try {
    const supabase = await createSupabaseUserServerComponentClient();

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

