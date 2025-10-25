"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export async function getAllDeputies() {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // Get all deputy profiles with their related data using joins
    const { data: deputies, error: deputiesError } = await supabase
      .from("deputy_profiles")
      .select(`
        id,
        user_id,
        slug,
        deputy_status,
        council_id,
        electoral_district_id,
        candidate_type,
        rating_average,
        rating_count,
        user_profiles!inner (
          id,
          full_name,
          avatar_url,
          governorate_id,
          party_id,
          governorates (
            id,
            name_ar,
            name_en
          ),
          parties (
            id,
            name_ar,
            name_en
          )
        ),
        councils (
          id,
          name_ar,
          name_en
        ),
        electoral_districts (
          id,
          name,
          district_type
        )
      `)
      .order("created_at", { ascending: false });

    if (deputiesError) {
      console.error("[getAllDeputies] Error:", deputiesError);
      return [];
    }

    if (!deputies || deputies.length === 0) {
      return [];
    }

    // Transform the data to match the expected structure
    const transformedDeputies = deputies.map((deputy: any) => {
      const userProfile = Array.isArray(deputy.user_profiles) 
        ? deputy.user_profiles[0] 
        : deputy.user_profiles;

      const governorate = Array.isArray(userProfile?.governorates)
        ? userProfile.governorates[0]
        : userProfile?.governorates;

      const party = Array.isArray(userProfile?.parties)
        ? userProfile.parties[0]
        : userProfile?.parties;

      const council = Array.isArray(deputy.councils)
        ? deputy.councils[0]
        : deputy.councils;

      const electoral_district = Array.isArray(deputy.electoral_districts)
        ? deputy.electoral_districts[0]
        : deputy.electoral_districts;

      return {
        deputy: {
          id: deputy.id,
          user_id: deputy.user_id,
          deputy_status: deputy.deputy_status,
          council_id: deputy.council_id,
          electoral_district_id: deputy.electoral_district_id,
          candidate_type: deputy.candidate_type,
          rating_average: deputy.rating_average,
          rating_count: deputy.rating_count,
        },
        user: userProfile ? {
          id: userProfile.id,
          full_name: userProfile.full_name,
          avatar_url: userProfile.avatar_url,
          governorate_id: userProfile.governorate_id,
          party_id: userProfile.party_id,
        } : null,
        governorate: governorate || null,
        party: party || null,
        council: council || null,
        electoral_district: electoral_district || null,
        slug: deputy.slug,
      };
    });

    // Sort by rating using Bayesian average (IMDB-style)
    // Formula: weighted_rating = (v/(v+m)) * R + (m/(v+m)) * C
    // Where: v = number of votes, m = minimum votes threshold, R = average rating, C = mean rating across all deputies
    const minVotes = 5; // Minimum votes to be considered
    const meanRating = 3.0; // Assume mean rating of 3.0 (middle of 1-5 scale)
    
    transformedDeputies.sort((a, b) => {
      const aVotes = a.deputy.rating_count || 0;
      const aRating = a.deputy.rating_average || 0;
      const bVotes = b.deputy.rating_count || 0;
      const bRating = b.deputy.rating_average || 0;
      
      // Calculate weighted rating (Bayesian average)
      const aWeighted = (aVotes / (aVotes + minVotes)) * aRating + (minVotes / (aVotes + minVotes)) * meanRating;
      const bWeighted = (bVotes / (bVotes + minVotes)) * bRating + (minVotes / (bVotes + minVotes)) * meanRating;
      
      // Sort descending (highest rating first)
      return bWeighted - aWeighted;
    });

    return transformedDeputies;
  } catch (error) {
    console.error("[getAllDeputies] Exception:", error);
    return [];
  }
}

