"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export async function getAllDeputies() {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // Get all deputy profiles (without slug to avoid TypeScript errors)
    const { data: deputies, error: deputiesError } = await supabase
      .from("deputy_profiles")
      .select(`
        id,
        user_id,
        deputy_status,
        council_id
      `)
      .order("created_at", { ascending: false });

    if (deputiesError || !deputies || deputies.length === 0) {
      return [];
    }

    // Get slugs separately
    const { data: slugData } = await supabase
      .from("deputy_profiles")
      .select("id, slug")
      .not("slug", "is", null);

    // Filter deputies that have slugs
    const deputiesWithSlugs = deputies.filter((d) => 
      slugData?.some((s: any) => s.id === d.id && s.slug)
    );

    // Get all user profiles
    const userIds = deputiesWithSlugs.map((d) => d.user_id);
    if (userIds.length === 0) return [];

    const { data: users } = await supabase
      .from("user_profiles")
      .select("id, full_name, avatar_url, governorate_id, party_id")
      .in("id", userIds);

    // Get unique IDs for related data (with proper type guards)
    const governorateIds = [...new Set(
      users?.map((u) => u.governorate_id).filter((id): id is string => id !== null)
    )];
    const partyIds = [...new Set(
      users?.map((u) => u.party_id).filter((id): id is string => id !== null)
    )];
    const councilIds = [...new Set(
      deputiesWithSlugs.map((d) => d.council_id).filter((id): id is string => id !== null)
    )];

    // Fetch all related data
    const [governorates, parties, councils] = await Promise.all([
      governorateIds.length > 0
        ? supabase
            .from("governorates")
            .select("id, name_ar, name_en")
            .in("id", governorateIds)
            .then((res) => res.data || [])
        : [],
      partyIds.length > 0
        ? supabase
            .from("parties")
            .select("id, name_ar, name_en")
            .in("id", partyIds)
            .then((res) => res.data || [])
        : [],
      councilIds.length > 0
        ? supabase
            .from("councils")
            .select("id, name_ar, name_en")
            .in("id", councilIds)
            .then((res) => res.data || [])
        : [],
    ]);

    // Combine data
    return deputiesWithSlugs.map((deputy) => {
      const user = users?.find((u) => u.id === deputy.user_id);
      const governorate = governorates?.find((g) => g.id === user?.governorate_id);
      const party = parties?.find((p) => p.id === user?.party_id);
      const council = councils?.find((c) => c.id === deputy.council_id);
      const slug = (slugData?.find((s: any) => s.id === deputy.id) as any)?.slug || "";

      return {
        deputy,
        user,
        governorate,
        party,
        council,
        slug,
      };
    });
  } catch (error) {
    console.error("[getAllDeputies] Exception:", error);
    return [];
  }
}

