"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import type { ElectoralDistrict, ElectoralDistrictWithGovernorate } from "@/types/deputy";

/**
 * Get all electoral districts
 */
export async function getAllElectoralDistricts(): Promise<ElectoralDistrict[]> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = (await supabase
      .from("electoral_districts")
      .select("*")
      .order("name", { ascending: true })) as any;

    if (error) {
      console.error("[getAllElectoralDistricts] Error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[getAllElectoralDistricts] Exception:", error);
    return [];
  }
}

/**
 * Get electoral districts by governorate ID
 */
export async function getElectoralDistrictsByGovernorate(
  governorateId: string,
  districtType?: "individual" | "list"
): Promise<ElectoralDistrict[]> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    let query = (supabase as any)
      .from("electoral_districts")
      .select("*")
      .eq("governorate_id", governorateId);

    if (districtType) {
      query = query.eq("district_type", districtType);
    }

    const { data, error } = await query.order("name", { ascending: true });

    if (error) {
      console.error("[getElectoralDistrictsByGovernorate] Error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[getElectoralDistrictsByGovernorate] Exception:", error);
    return [];
  }
}

/**
 * Get electoral district by ID with governorate information
 */
export async function getElectoralDistrictById(
  districtId: string
): Promise<ElectoralDistrictWithGovernorate | null> {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = (await supabase
      .from("electoral_districts")
      .select(`
        *,
        governorates (
          id,
          name_ar,
          name_en
        )
      `)
      .eq("id", districtId)
      .single()) as any;

    if (error) {
      console.error("[getElectoralDistrictById] Error:", error);
      return null;
    }

    return data as ElectoralDistrictWithGovernorate;
  } catch (error) {
    console.error("[getElectoralDistrictById] Exception:", error);
    return null;
  }
}

/**
 * Get all governorates (for dropdown filters)
 */
export async function getAllGovernorates() {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data, error } = await supabase
      .from("governorates")
      .select("id, name_ar, name_en")
      .order("name_ar", { ascending: true });

    if (error) {
      console.error("[getAllGovernorates] Error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("[getAllGovernorates] Exception:", error);
    return [];
  }
}

/**
 * Get electoral districts grouped by governorate
 */
export async function getElectoralDistrictsGroupedByGovernorate() {
  const supabase = await createSupabaseUserServerComponentClient();

  try {
    const { data: districts, error: districtsError } = (await supabase
      .from("electoral_districts")
      .select(`
        *,
        governorates (
          id,
          name_ar,
          name_en
        )
      `)
      .order("name", { ascending: true })) as any;

    if (districtsError) {
      console.error("[getElectoralDistrictsGroupedByGovernorate] Error:", districtsError);
      return {};
    }

    // Group districts by governorate
    const grouped = (districts || []).reduce((acc, district) => {
      const gov = (district as any).governorates;
      if (!gov) return acc;

      const govId = gov.id;
      if (!acc[govId]) {
        acc[govId] = {
          governorate: gov,
          districts: [],
        };
      }

      acc[govId].districts.push(district);
      return acc;
    }, {} as Record<string, { governorate: any; districts: ElectoralDistrict[] }>);

    return grouped;
  } catch (error) {
    console.error("[getElectoralDistrictsGroupedByGovernorate] Exception:", error);
    return {};
  }
}

