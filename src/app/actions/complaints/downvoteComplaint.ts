"use server";

import { createClient } from "@supabase/supabase-js";
import { getClientIP } from "@/lib/helpers/getClientIP";

/**
 * Toggle downvote for a complaint
 * - If user is authenticated, use user_id
 * - If user is anonymous, use IP address
 * - Returns new votes count and hasDownvoted status
 */
export async function downvoteComplaint(complaintId: string) {
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

    // Build query to check if already downvoted
    let voteQuery = supabase
      .from("complaint_downvotes")
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
      console.error("[downvoteComplaint] Check error:", checkError);
      return {
        success: false,
        error: "Failed to check downvote status",
        downvotesCount: 0,
        hasDownvoted: false,
      };
    }

    if (existingVote) {
      // Downvote exists - remove it (toggle off)
      const { error: deleteError } = await supabase
        .from("complaint_downvotes")
        .delete()
        .eq("id", existingVote.id);

      if (deleteError) {
        console.error("[downvoteComplaint] Delete error:", deleteError);
        return {
          success: false,
          error: "Failed to remove downvote",
          downvotesCount: 0,
          hasDownvoted: true,
        };
      }

      // Get updated downvotes count
      const { data: complaint } = await supabase
        .from("complaints")
        .select("downvotes_count")
        .eq("id", complaintId)
        .single();

      return {
        success: true,
        downvotesCount: complaint?.downvotes_count || 0,
        hasDownvoted: false,
      };
    } else {
      // Downvote doesn't exist - add it (toggle on)
      const { error: insertError } = await supabase
        .from("complaint_downvotes")
        .insert({
          complaint_id: complaintId,
          user_id: user?.id || null,
          ip_address: user ? null : ip,
        });

      if (insertError) {
        console.error("[downvoteComplaint] Insert error:", insertError);
        return {
          success: false,
          error: "Failed to add downvote",
          downvotesCount: 0,
          hasDownvoted: false,
        };
      }

      // Get updated downvotes count
      const { data: complaint } = await supabase
        .from("complaints")
        .select("downvotes_count")
        .eq("id", complaintId)
        .single();

      return {
        success: true,
        downvotesCount: complaint?.downvotes_count || 0,
        hasDownvoted: true,
      };
    }
  } catch (error) {
    console.error("[downvoteComplaint] Exception:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      downvotesCount: 0,
      hasDownvoted: false,
    };
  }
}
