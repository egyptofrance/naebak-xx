"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export async function getDeputyBySlug(slug: string) {
  console.log('========================================');
  console.log('[getDeputyBySlug] START - slug:', slug);
  console.log('========================================');
  
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    // Check if slug is a UUID (id) or actual slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    console.log('[getDeputyBySlug] isUUID:', isUUID);
    console.log('[getDeputyBySlug] Query field:', isUUID ? 'id' : 'slug');
    
    // Get deputy profile by slug or id
    const { data: deputy, error: deputyError } = (await supabase
      .from("deputy_profiles")
      .select(`
        id,
        user_id,
        deputy_status,
        council_id,
        electoral_district_id,
        candidate_type,
        bio,
        office_address,
        office_phone,
        electoral_program,
        achievements,
        events,
        rating_average,
        rating_count,
        display_name
      `)
      .eq(isUUID ? "id" : "slug", slug)
      .maybeSingle()) as any;

    console.log('[getDeputyBySlug] Query executed');
    console.log('[getDeputyBySlug] Deputy result:', deputy ? 'FOUND' : 'NULL');
    console.log('[getDeputyBySlug] Deputy error:', deputyError);
    
    if (deputyError) {
      console.error("[getDeputyBySlug] ERROR DETAILS:", JSON.stringify(deputyError, null, 2));
      return null;
    }

    if (!deputy) {
      console.error('[getDeputyBySlug] ❌ NO DEPUTY FOUND FOR SLUG:', slug);
      console.error('[getDeputyBySlug] This means the query returned NULL');
      return null;
    }
    
    console.log('[getDeputyBySlug] ✅ DEPUTY FOUND:', deputy.id, deputy.display_name);

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
    const [governorate, party, council, electoral_district] = await Promise.all([
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
      deputy.electoral_district_id
        ? supabase
            .from("electoral_districts")
            .select("id, name, district_type")
            .eq("id", deputy.electoral_district_id)
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

    // Get electoral programs, achievements, and events
    const [electoralPrograms, achievements, events] = await Promise.all([
      supabase
        .from("deputy_electoral_programs")
        .select("*")
        .eq("deputy_id", deputy.id)
        .order("display_order", { ascending: true })
        .then((res) => res.data || []),
      supabase
        .from("deputy_achievements")
        .select("*")
        .eq("deputy_id", deputy.id)
        .order("display_order", { ascending: true })
        .then((res) => res.data || []),
      supabase
        .from("deputy_events")
        .select("*")
        .eq("deputy_id", deputy.id)
        .order("display_order", { ascending: true })
        .then((res) => res.data || []),
    ]);

    return {
      deputy,
      user,
      governorate,
      party,
      council,
      electoral_district,
      bannerImage,
      electoralPrograms,
      achievements,
      events,
    };
  } catch (error) {
    console.error("[getDeputyBySlug] Exception:", error);
    return null;
  }
}

