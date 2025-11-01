"use server";

import { createClient } from "@supabase/supabase-js";
import { getClientIP } from "@/lib/helpers/getClientIP";

/**
 * Check if current user/IP has voted for a complaint
 * Returns boolean
 */
export async function hasUserVoted(complaintId: string): Promise<boolean> {
  try {
    // Use service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get client IP
    const ip = await getClientIP();

    // Try to get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    // Build query
    let voteQuery = supabase
      .from("complaint_votes")
      .select("id")
      .eq("complaint_id", complaintId);

    if (user) {
      // Authenticated user: check by user_id
      voteQuery = voteQuery.eq("user_id", user.id);
    } else {
      // Anonymous user: check by IP
      voteQuery = voteQuery.eq("ip_address", ip);
    }

    const { data, error } = await voteQuery.maybeSingle();

    if (error) {
      console.error("[hasUserVoted] Error:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("[hasUserVoted] Exception:", error);
    return false;
  }
}
