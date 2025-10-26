"use server";

import { authActionClient, adminActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabaseAdminClient";
import { supabaseClientBasedOnUserRole } from "@/supabase-clients/user-role-client";
import { serverGetUserType } from "@/utils/server/serverGetUserType";
import { userRoles } from "@/utils/userTypes";
import { isSupabaseUserAppAdmin } from "@/utils/isSupabaseUserAppAdmin";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ============================================
// SCHEMAS
// ============================================

const createComplaintSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(20).max(5000),
  category: z.enum([
    "infrastructure",
    "education",
    "health",
    "security",
    "environment",
    "transportation",
    "utilities",
    "housing",
    "employment",
    "social_services",
    "legal",
    "corruption",
    "other",
  ]),
  governorate: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  location_lat: z.number().optional(),
  location_lng: z.number().optional(),
  citizen_phone: z.string().optional(),
  citizen_email: z.string().email().optional(),
  is_public: z.boolean().optional(),
});

// ============================================
// ACTIONS
// ============================================

/**
 * Create a new complaint (Citizen only)
 */
export const createComplaintAction = authActionClient
  .schema(createComplaintSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const userId = ctx.userId;

    const { data, error } = await supabase
      .from("complaints")
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        category: input.category,
        governorate: input.governorate,
        district: input.district,
        address: input.address,
        location_lat: input.location_lat,
        location_lng: input.location_lng,
        citizen_phone: input.citizen_phone,
        citizen_email: input.citizen_email,
        is_public: input.is_public || false,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create complaint: ${error.message}`);
    }

    revalidatePath("/complaints");
    return { success: true, complaint: data };
  });

/**
 * Get all complaints for the current user
 */
export async function getUserComplaints(userId: string) {
  const supabase = await createSupabaseUserServerComponentClient();

  const { data, error } = await supabase
    .from("complaints")
    .select(`
      *,
      complaint_assignments(
        deputy_id,
        assigned_at,
        deputy_profiles(
          id,
          user_profiles(
            full_name
          )
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data, error: null };
}

/**
 * Get all complaints (Admin/Manager only)
 */
export async function getAllComplaints(filters?: {
  status?: string;
  category?: string;
  governorate?: string;
  priority?: string;
}) {
  const supabase = await createSupabaseUserServerComponentClient();

  let query = supabase
    .from("complaints")
    .select(`
      *,
      user_profiles(
        full_name,
        email_readonly
      ),
      complaint_assignments(
        deputy_id,
        assigned_at,
        deputy_profiles(
          id,
          user_profiles(
            full_name
          )
        )
      )
    `);

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters?.governorate && filters.governorate !== "all") {
    query = query.eq("governorate", filters.governorate);
  }
  if (filters?.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data, error: null };
}

/**
 * Get complaints assigned to a deputy
 */
export async function getDeputyComplaints(deputyId: string) {
  const supabase = await createSupabaseUserServerComponentClient();

  const { data, error } = await supabase
    .from("complaint_assignments")
    .select(`
      *,
      complaints(
        *,
        user_profiles(
          full_name,
          email_readonly
        )
      )
    `)
    .eq("deputy_id", deputyId)
    .order("assigned_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data, error: null };
}

/**
 * Get a single complaint by ID
 */
export async function getComplaintById(complaintId: string) {
  const supabase = await createSupabaseUserServerComponentClient();

  const { data, error } = await supabase
    .from("complaints")
    .select(`
      *,
      user_profiles(
        full_name,
        email_readonly
      ),
      complaint_assignments(
        deputy_id,
        assigned_at,
        deputy_profiles(
          id,
          user_profiles(
            full_name
          )
        )
      ),
      complaint_comments(
        *,
        user_profiles(
          full_name
        )
      ),
      complaint_history(
        *,
        user_profiles(
          full_name
        )
      )
    `)
    .eq("id", complaintId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Update complaint status
 */
export async function updateComplaintStatus(
  complaintId: string,
  status: string,
  userId: string
) {
  const supabase = await createSupabaseUserServerComponentClient();

  // Update complaint status
  const { error: updateError } = await supabase
    .from("complaints")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", complaintId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Add to history
  const { error: historyError } = await supabase
    .from("complaint_history")
    .insert({
      complaint_id: complaintId,
      user_id: userId,
      action: "status_changed",
      details: `Status changed to ${status}`,
    });

  if (historyError) {
    return { success: false, error: historyError.message };
  }

  revalidatePath(`/complaints/${complaintId}`);
  return { success: true };
}

/**
 * Update complaint priority
 */
export async function updateComplaintPriority(
  complaintId: string,
  priority: string,
  userId: string
) {
  const supabase = await createSupabaseUserServerComponentClient();

  // Update complaint priority
  const { error: updateError } = await supabase
    .from("complaints")
    .update({ priority, updated_at: new Date().toISOString() })
    .eq("id", complaintId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Add to history
  const { error: historyError } = await supabase
    .from("complaint_history")
    .insert({
      complaint_id: complaintId,
      user_id: userId,
      action: "priority_changed",
      details: `Priority changed to ${priority}`,
    });

  if (historyError) {
    return { success: false, error: historyError.message };
  }

  revalidatePath(`/complaints/${complaintId}`);
  return { success: true };
}

/**
 * Assign complaint to deputy/deputies
 */
export async function assignComplaintToDeputy(
  complaintId: string,
  deputyIds: string[],
  userId: string
) {
  const supabase = await createSupabaseUserServerComponentClient();

  // Remove existing assignments
  const { error: deleteError } = await supabase
    .from("complaint_assignments")
    .delete()
    .eq("complaint_id", complaintId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  // Add new assignments
  const assignments = deputyIds.map((deputyId) => ({
    complaint_id: complaintId,
    deputy_id: deputyId,
  }));

  const { error: insertError } = await supabase
    .from("complaint_assignments")
    .insert(assignments);

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Update complaint status to 'assigned'
  const { error: updateError } = await supabase
    .from("complaints")
    .update({ status: "assigned", updated_at: new Date().toISOString() })
    .eq("id", complaintId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Add to history
  const { error: historyError } = await supabase
    .from("complaint_history")
    .insert({
      complaint_id: complaintId,
      user_id: userId,
      action: "assigned",
      details: `Assigned to ${deputyIds.length} deputy/deputies`,
    });

  if (historyError) {
    return { success: false, error: historyError.message };
  }

  revalidatePath(`/complaints/${complaintId}`);
  return { success: true };
}

/**
 * Add comment to complaint
 */
export async function addComplaintComment(
  complaintId: string,
  comment: string,
  userId: string
) {
  const supabase = await createSupabaseUserServerComponentClient();

  const { error } = await supabase
    .from("complaint_comments")
    .insert({
      complaint_id: complaintId,
      user_id: userId,
      comment,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/complaints/${complaintId}`);
  return { success: true };
}

/**
 * Close complaint
 */
export async function closeComplaint(
  complaintId: string,
  resolution: string,
  userId: string
) {
  const supabase = await createSupabaseUserServerComponentClient();

  // Update complaint
  const { error: updateError } = await supabase
    .from("complaints")
    .update({
      status: "resolved",
      resolution,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Add to history
  const { error: historyError } = await supabase
    .from("complaint_history")
    .insert({
      complaint_id: complaintId,
      user_id: userId,
      action: "resolved",
      details: resolution,
    });

  if (historyError) {
    return { success: false, error: historyError.message };
  }

  // Grant points to assigned deputies
  const { data: assignments } = await supabase
    .from("complaint_assignments")
    .select("deputy_id")
    .eq("complaint_id", complaintId);

  if (assignments && assignments.length > 0) {
    for (const assignment of assignments) {
      await grantPointsToDeputy(assignment.deputy_id, 10);
    }
  }

  revalidatePath(`/complaints/${complaintId}`);
  return { success: true };
}

/**
 * Get available deputies for assignment with filters
 * ✅ FIXED: Now uses pagination to fetch ALL deputies (not just 1000)
 */
export async function getAvailableDeputies(filters?: {
  searchName?: string;
  councilType?: string;
  deputyStatus?: string;
  gender?: string;
  governorate?: string;
}) {
  const supabaseClient = await supabaseClientBasedOnUserRole();

  // ✅ Fetch ALL deputies using pagination to bypass Supabase's 1000 row limit
  let allDeputies: any[] = [];
  let page = 0;
  const pageSize = 1000; // Supabase's default max
  let hasMore = true;

  while (hasMore) {
    const start = page * pageSize;
    const end = start + pageSize - 1;

    let query = supabaseClient
      .from("deputy_profiles")
      .select(`
        id,
        governorate,
        council_type,
        deputy_status,
        gender,
        points,
        user_profiles(
          full_name
        )
      `)
      .range(start, end);

    // Apply filters only if provided and not 'all'
    if (filters?.councilType && filters.councilType !== "all") {
      query = query.eq("council_type", filters.councilType);
    }
    if (filters?.deputyStatus && filters.deputyStatus !== "all") {
      query = query.eq("deputy_status", filters.deputyStatus);
    }
    if (filters?.gender && filters.gender !== "all") {
      query = query.eq("gender", filters.gender);
    }
    if (filters?.governorate && filters.governorate !== "all") {
      query = query.eq("governorate", filters.governorate);
    }

    const { data: deputiesPage, error } = await query;

    if (error) {
      console.error(`[getAvailableDeputies] Error on page ${page}:`, error);
      break;
    }

    if (!deputiesPage || deputiesPage.length === 0) {
      hasMore = false;
      break;
    }

    allDeputies = [...allDeputies, ...deputiesPage];

    // If we got less than pageSize, we've reached the end
    if (deputiesPage.length < pageSize) {
      hasMore = false;
    } else {
      page++;
    }
  }

  console.log(`✅ [getAvailableDeputies] Fetched ${allDeputies.length} deputies in ${page + 1} page(s)`);

  // Transform data to flatten user_profiles
  let transformedData = allDeputies.map((deputy: any) => ({
    id: deputy.id,
    full_name: deputy.user_profiles?.full_name || "غير محدد",
    governorate: deputy.governorate || "غير محدد",
    council_type: deputy.council_type || "parliament",
    deputy_status: deputy.deputy_status || "current",
    gender: deputy.gender || "male",
    points: deputy.points || 0,
  }));

  // Apply name search filter (client-side for Arabic support)
  if (filters?.searchName) {
    const searchLower = filters.searchName.toLowerCase();
    transformedData = transformedData.filter((deputy: any) =>
      deputy.full_name.toLowerCase().includes(searchLower)
    );
  }

  // Sort by full_name on client side
  transformedData.sort((a: any, b: any) => a.full_name.localeCompare(b.full_name, 'ar'));

  return { data: transformedData, error: null };
}




/**
 * Grant points to deputy when resolving a complaint
 */
export async function grantPointsToDeputy(deputyId: string, points: number = 10) {
  const { data: currentProfile, error: fetchError } = await supabaseAdminClient
    .from("deputy_profiles")
    .select("points")
    .eq("id", deputyId)
    .single();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  const newPoints = (currentProfile?.points || 0) + points;

  const { error: updateError } = await supabaseAdminClient
    .from("deputy_profiles")
    .update({ points: newPoints })
    .eq("id", deputyId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, newPoints };
}

/**
 * Get public complaints (approved and visible to everyone)
 */
export async function getPublicComplaints() {
  const supabase = await createSupabaseUserServerComponentClient();

  const { data, error } = await supabase
    .from("complaints")
    .select(`
      *,
      user_profiles(
        full_name
      ),
      complaint_assignments(
        deputy_id,
        deputy_profiles(
          id,
          user_profiles(
            full_name
          )
        )
      )
    `)
    .eq("is_public", true)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data, error: null };
}

/**
 * Approve public complaint (Admin/Manager only)
 */
export async function approvePublicComplaint(
  complaintId: string,
  userId: string
) {
  const supabase = await createSupabaseUserServerComponentClient();

  const { error: updateError } = await supabase
    .from("complaints")
    .update({ is_approved: true, updated_at: new Date().toISOString() })
    .eq("id", complaintId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Add to history
  const { error: historyError } = await supabase
    .from("complaint_history")
    .insert({
      complaint_id: complaintId,
      user_id: userId,
      action: "approved",
      details: "Complaint approved for public viewing",
    });

  if (historyError) {
    return { success: false, error: historyError.message };
  }

  revalidatePath("/public-complaints");
  return { success: true };
}

