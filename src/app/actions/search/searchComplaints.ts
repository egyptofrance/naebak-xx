"use server";

import { createClient } from "@supabase/supabase-js";

export async function searchComplaints(query: string) {
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

    const { data: complaints, error } = await supabase
      .from("public_complaints")
      .select(`
        id,
        title,
        description,
        status,
        category,
        created_at,
        governorate_id,
        governorates (
          id,
          name_ar,
          name_en,
          is_visible
        )
      `)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("[searchComplaints] Error:", error);
      return [];
    }

    if (!complaints || complaints.length === 0) {
      return [];
    }

    // Transform the data
    const transformedComplaints = complaints.map((complaint: any) => {
      const governorate = Array.isArray(complaint.governorates)
        ? complaint.governorates[0]
        : complaint.governorates;

      // Check if it's a general complaint (no governorate)
      const isGeneral = !complaint.governorate_id;

      return {
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        status: complaint.status,
        category: complaint.category,
        created_at: complaint.created_at,
        is_general: isGeneral,
        governorate: governorate
          ? {
              id: governorate.id,
              name_ar: governorate.name_ar,
              name_en: governorate.name_en,
              is_visible: governorate.is_visible,
            }
          : null,
      };
    });

    return transformedComplaints;
  } catch (error) {
    console.error("[searchComplaints] Exception:", error);
    return [];
  }
}
