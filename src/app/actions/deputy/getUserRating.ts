"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export async function getUserRating(deputyId: string): Promise<number | null> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Get user's rating for this deputy
    const { data, error } = (await supabase
      .from("deputy_ratings" as any)
      .select("rating")
      .eq("deputy_id", deputyId)
      .eq("user_id", user.id)
      .maybeSingle()) as any;

    if (error) {
      console.error("[getUserRating] Error:", error);
      return null;
    }

    return data?.rating ?? null;
  } catch (error) {
    console.error("[getUserRating] Exception:", error);
    return null;
  }
}

