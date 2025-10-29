"use server";

import { supabaseAnonClient } from "@/supabase-clients/anon/supabaseAnonClient";

export interface BreakingNewsItem {
  id: string;
  content: string;
  is_active: boolean;
  display_order: number;
  scroll_speed?: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export async function getBreakingNews(): Promise<BreakingNewsItem[]> {
  try {
    const supabase = supabaseAnonClient;

    const { data, error } = await supabase
      .from("breaking_news")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[getBreakingNews] Error:", error);
      return [];
    }

    // Ensure scroll_speed has a default value
    const newsWithSpeed = (data || []).map((item: any) => ({
      ...item,
      scroll_speed: item.scroll_speed || 50
    }));

    return newsWithSpeed as BreakingNewsItem[];
  } catch (error) {
    console.error("[getBreakingNews] Exception:", error);
    return [];
  }
}

