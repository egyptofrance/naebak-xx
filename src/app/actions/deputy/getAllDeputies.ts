"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export async function getAllDeputies() {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // Get all deputy profiles
    const { data: deputies, error: deputiesError } = await supabase
      .from("deputy_profiles")
      .select(`
        id,
        user_id,
        deputy_status,
        council_id,
        slug
      `)
      .not("slug", "is", null)
      .order("created_at", { ascending: false });

    if (deputiesError) {
      console.error("[getAllDeputies] Error fetching deputies:", deputiesError);
      return [];
    }

    if (!deputies || deputies.length === 0) {
      return [];
    }

    // Get all user profiles for these deputies
    const userIds = deputies.map((d) => d.user_id);
    const { data: users } = await supabase
      .from("user_profiles")
      .select("id, full_name, avatar_url, governorate_id, party_id")
      .in("id", userIds);

    // Get all governorates
    const { data: governorates } = await supabase
      .from("governorates")
      .select("id, name_ar, name_en");

    // Get all parties
    const { data: parties } = await supabase
      .from("parties")
      .select("id, name_ar, name_en");

    // Get all councils
    const { data: councils } = await supabase
      .from("councils")
      .select("id, name_ar, name_en");

    // Combine data
    const result = deputies.map((deputy) => {
      const user = users?.find((u) => u.id === deputy.user_id);
      const governorate = governorates?.find((g) => g.id === user?.governorate_id);
      const party = parties?.find((p) => p.id === user?.party_id);
      const council = councils?.find((c) => c.id === deputy.council_id);

      return {
        id: deputy.id,
        slug: deputy.slug,
        deputy_status: deputy.deputy_status,
        user: {
          full_name: user?.full_name || "",
          avatar_url: user?.avatar_url || null,
        },
        governorate: governorate
          ? { id: governorate.id, name_ar: governorate.name_ar, name_en: governorate.name_en }
          : null,
        party: party
          ? { id: party.id, name_ar: party.name_ar, name_en: party.name_en }
          : null,
        council: council
          ? { id: council.id, name_ar: council.name_ar, name_en: council.name_en }
          : null,
      };
    });

    return result;
  } catch (error) {
    console.error("[getAllDeputies] Exception:", error);
    return [];
  }
}

