"use server";

import { createClient } from "@supabase/supabase-js";
import { getClientIP } from "@/lib/helpers/getClientIP";

/**
 * Toggle upvote for a complaint
 * - If user is authenticated, use user_id
 * - If user is anonymous, use IP address
 * - Returns new votes count and hasVoted status
 */
export async function upvoteComplaint(complaintId: string) {
  try {
    // Use service role client to bypass RLS for checking
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

    // Build query to check if already voted
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

    const { data: existingVote, error: checkError } = await voteQuery.maybeSingle();

    if (checkError) {
      console.error("[upvoteComplaint] Check error:", checkError);
      return {
        success: false,
        error: "Failed to check vote status",
        votesCount: 0,
        hasVoted: false,
      };
    }

    if (existingVote) {
      // Vote exists - remove it (toggle off)
      const { error: deleteError } = await supabase
        .from("complaint_votes")
        .delete()
        .eq("id", existingVote.id);

      if (deleteError) {
        console.error("[upvoteComplaint] Delete error:", deleteError);
        return {
          success: false,
          error: "Failed to remove vote",
          votesCount: 0,
          hasVoted: true,
        };
      }

      // Get updated votes count
      const { count } = await supabase
        .from("complaint_votes")
        .select("*", { count: "exact", head: true })
        .eq("complaint_id", complaintId);

      return {
        success: true,
        votesCount: count || 0,
        hasVoted: false,
      };
    } else {
      // Vote doesn't exist - add it (toggle on)
      const { error: insertError } = await supabase
        .from("complaint_votes")
        .insert({
          complaint_id: complaintId,
          user_id: user?.id || null,
          ip_address: user ? null : ip,
        });

      if (insertError) {
        console.error("[upvoteComplaint] Insert error:", insertError);
        return {
          success: false,
          error: "Failed to add vote",
          votesCount: 0,
          hasVoted: false,
        };
      }

      // Get updated votes count
      const { count } = await supabase
        .from("complaint_votes")
        .select("*", { count: "exact", head: true })
        .eq("complaint_id", complaintId);

      return {
        success: true,
        votesCount: count || 0,
        hasVoted: true,
      };
    }
  } catch (error) {
    console.error("[upvoteComplaint] Exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      votesCount: 0,
      hasVoted: false,
    };
  }
}
