"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export async function getDeputyBySlug(slug: string) {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // Get deputy profile by slug
    const { data: deputy, error: deputyError } = await supabase
      .from("deputy_profiles")
      .select(`
        id,
        user_id,
        deputy_status,
        council_id,
        bio,
        office_address,
        office_phone,
        electoral_program,
        achievements,
        events,
        rating_average,
        rating_count
      `) as any
      .eq("slug", slug)
      .maybeSingle();

    if (deputyError) {
      console.error("[getDeputyBySlug] Error:", deputyError);
      return null;
    }

    if (!deputy) {
      return null;
    }

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select(`
        id,
        full_name,
        avatar_url,
        phone,
        governorate_id,
        party_id
      `)
      .eq("id", deputy.user_id)
      .single();

    if (userError) {
      console.error("[getDeputyBySlug] User error:", userError);
      return null;
    }

    // Get related data
    const [governorate, party, council] = await Promise.all([
      user.governorate_id
        ? supabase
            .from("governorates")
            .select("id, name_ar, name_en")
            .eq("id", user.governorate_id)
            .single()
            .then((res) => res.data)
        : null,
      user.party_id
        ? supabase
            .from("parties")
            .select("id, name_ar, name_en")
            .eq("id", user.party_id)
            .single()
            .then((res) => res.data)
        : null,
      deputy.council_id
        ? supabase
            .from("councils")
            .select("id, name_ar, name_en")
            .eq("id", deputy.council_id)
            .single()
            .then((res) => res.data)
        : null,
    ]);

    // Get banner_image separately (to avoid TypeScript issues)
    const { data: bannerData } = await supabase
      .from("deputy_profiles")
      .select("banner_image")
      .eq("id", deputy.id)
      .single();

    const bannerImage = (bannerData as any)?.banner_image || null;

    return {
      deputy,
      user,
      governorate,
      party,
      council,
      bannerImage,
    };
  } catch (error) {
    console.error("[getDeputyBySlug] Exception:", error);
    return null;
  }
}

