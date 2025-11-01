"use server";

import { createClient } from "@supabase/supabase-js";

export async function searchDeputies(query: string) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Use service role client to bypass RLS issues
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

  try {
    const searchTerm = query.trim();

    const { data: deputies, error } = await supabase
      .from("deputy_profiles")
      .select(`
        id,
        user_id,
        slug,
        deputy_status,
        display_name,
        rating_average,
        rating_count,
        user_profiles (
          id,
          full_name,
          avatar_url,
          governorate_id,
          party_id,
          governorates (
            id,
            name_ar,
            name_en,
            is_visible
          ),
          parties (
            id,
            name_ar,
            name_en
          )
        )
      `)
      .or(`display_name.ilike.%${searchTerm}%,user_profiles.full_name.ilike.%${searchTerm}%`)
      .limit(10);

    if (error) {
      console.error("[searchDeputies] Error:", error);
      return [];
    }

    if (!deputies || deputies.length === 0) {
      return [];
    }

    // Transform and filter the data
    const transformedDeputies = deputies
      .map((deputy: any) => {
        const userProfile = Array.isArray(deputy.user_profiles)
          ? deputy.user_profiles[0]
          : deputy.user_profiles;

        const governorate = Array.isArray(userProfile?.governorates)
          ? userProfile.governorates[0]
          : userProfile?.governorates;

        // Skip deputies from hidden governorates
        if (governorate && governorate.is_visible === false) {
          return null;
        }

        const party = Array.isArray(userProfile?.parties)
          ? userProfile.parties[0]
          : userProfile?.parties;

        return {
          id: deputy.id,
          slug: deputy.slug,
          name: deputy.display_name || userProfile?.full_name || "غير معروف",
          avatar_url: userProfile?.avatar_url || null,
          status: deputy.deputy_status,
          rating_average: deputy.rating_average || 0,
          rating_count: deputy.rating_count || 0,
          governorate: governorate
            ? {
                id: governorate.id,
                name_ar: governorate.name_ar,
                name_en: governorate.name_en,
              }
            : null,
          party: party
            ? {
                id: party.id,
                name_ar: party.name_ar,
                name_en: party.name_en,
              }
            : null,
        };
      })
      .filter((deputy): deputy is NonNullable<typeof deputy> => deputy !== null);

    return transformedDeputies;
  } catch (error) {
    console.error("[searchDeputies] Exception:", error);
    return [];
  }
}
