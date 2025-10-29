"use server";

import { supabaseAnonClient } from "@/supabase-clients/anon/supabaseAnonClient";

export interface TickerSettings {
  id: string;
  scroll_speed: number;
  is_enabled: boolean;
  updated_at: string;
  updated_by: string | null;
}

export async function getTickerSettings(): Promise<TickerSettings | null> {
  try {
    const supabase = supabaseAnonClient;

    const { data, error } = await (supabase as any)
      .from("ticker_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("[getTickerSettings] Error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[getTickerSettings] Exception:", error);
    return null;
  }
}
