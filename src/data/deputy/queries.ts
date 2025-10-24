/**
 * Deputy Public Profile Queries
 * Server-side functions to fetch deputy data for public profile pages
 */

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import type { DeputyFullData, DeputyProfile } from "@/types/deputy";

/**
 * Get deputy profile by slug for public page
 * This function fetches all necessary data for the deputy public profile page
 * 
 * @param slug - The unique slug identifier for the deputy
 * @returns DeputyFullData object or null if not found
 */
export async function getDeputyBySlug(slug: string): Promise<DeputyFullData | null> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // Step 1: Get deputy profile by slug
    const { data: deputy, error: deputyError } = await supabase
      .from("deputy_profiles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (deputyError) {
      console.error("[getDeputyBySlug] Error fetching deputy:", deputyError);
      return null;
    }

    if (!deputy) {
      console.log("[getDeputyBySlug] Deputy not found with slug:", slug);
      return null;
    }

    // Step 2: Get user profile
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", deputy.user_id)
      .single();

    if (userError) {
      console.error("[getDeputyBySlug] Error fetching user profile:", userError);
      return null;
    }

    // Step 3: Get related data in parallel
    const [
      { data: party },
      { data: council },
      { data: governorate },
      { data: ratings },
      { data: complaints }
    ] = await Promise.all([
      // Get party if exists (party_id is in user_profiles, not deputy_profiles)
      user.party_id
        ? supabase.from("parties").select("*").eq("id", user.party_id).maybeSingle()
        : Promise.resolve({ data: null }),
      
      // Get council if exists
      deputy.council_id
        ? supabase.from("councils").select("*").eq("id", deputy.council_id).maybeSingle()
        : Promise.resolve({ data: null }),
      
      // Get governorate if exists
      user.governorate_id
        ? supabase.from("governorates").select("*").eq("id", user.governorate_id).maybeSingle()
        : Promise.resolve({ data: null }),
      
      // Get ratings
      supabase
        .from("public.ratings" as any) // Bypass TS error as table exists in DB
        .select("rating") as PromiseLike<{ data: { rating: number }[] | null }>,
      
      // Get complaints count
      supabase
        .from("public.complaints" as any) // Bypass TS error as table exists in DB
        .select("id", { count: "exact", head: true }) as PromiseLike<{ data: { id: string }[] | null }>,
    ]);

    // Calculate rating average
    const ratingAverage = ratings && ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : deputy.initial_rating_avg || 0;

    const ratingCount = ratings ? ratings.length : deputy.initial_rating_count || 0;

    // Get deputy rank (optional - can be expensive query)
    // For now, we'll set it to null and implement later if needed
    const rank = null;

    // Construct full deputy data
    const fullData: DeputyFullData = {
      deputy: deputy as DeputyProfile,
      user,
      party: party || null,
      council: council || null,
      governorate: governorate || null,
      rating: {
        average: ratingAverage,
        count: ratingCount
      },
      stats: {
        points: deputy.points || 0,
        complaints_count: complaints?.length || 0,
        rank
      }
    };

    return fullData;
  } catch (error) {
    console.error("[getDeputyBySlug] Unexpected error:", error);
    return null;
  }
}

/**
 * Get all deputies with slugs (for generating static paths)
 * 
 * @returns Array of deputy slugs
 */
export async function getAllDeputySlugs(): Promise<string[]> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data: deputies, error } = await supabase
      .from("deputy_profiles")
      .select("slug")
      .not("slug", "is", null)
      .eq("deputy_status", "current"); // Only current deputies

    if (error) {
      console.error("[getAllDeputySlugs] Error:", error);
      return [];
    }

    return deputies
      .map(d => d.slug)
      .filter((slug): slug is string => slug !== null);
  } catch (error) {
    console.error("[getAllDeputySlugs] Unexpected error:", error);
    return [];
  }
}

