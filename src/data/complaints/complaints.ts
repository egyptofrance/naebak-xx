"use server";

import { authActionClient, adminActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabaseAdminClient";
import { supabaseClientBasedOnUserRole } from "@/supabase-clients/user-role-client";
import { serverGetUserType } from "@/utils/server/serverGetUserType";
import { userRoles } from "@/utils/userTypes";
import { isSupabaseUserAppAdmin } from "@/utils/isSupabaseUserAppAdmin";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { smartRevalidate } from "@/utils/smartRevalidate";
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
    "investment",
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
  .action(async ({ parsedInput, ctx: { userId } }) => {
    const supabaseClient = await supabaseClientBasedOnUserRole();

    const { data, error } = await supabaseClient
      .from("complaints")
      .insert({
        citizen_id: userId,
        title: parsedInput.title,
        description: parsedInput.description,
        category: parsedInput.category as any,
        status: "new",
        priority: "medium",
        governorate: parsedInput.governorate,
        district: parsedInput.district,
        address: parsedInput.address,
        location_lat: parsedInput.location_lat,
        location_lng: parsedInput.location_lng,
        citizen_phone: parsedInput.citizen_phone,
        citizen_email: parsedInput.citizen_email,
        is_public: parsedInput.is_public || false,
      })
      .select("*")
      .single();

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    smartRevalidate("complaints");

    return {
      status: "success",
      data,
    };
  });



/**
 * Get complaints for the current user
 */
export async function getMyComplaints() {
  const supabaseClient = await supabaseClientBasedOnUserRole();
  const userType = await serverGetUserType();
  const { data: userData } = await supabaseClient.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    return { data: [], error: "User not authenticated" };
  }

  let query = supabaseClient
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });

  // Filter based on user type
  if (userType === userRoles.USER) {
    // Citizens see only their own complaints
    query = query.eq("citizen_id", userId);
  }
  // Managers and Admins see all complaints (no filter needed)

  const { data, error } = await query;

  return { data: data || [], error: error?.message };
}



/**
 * Get complaints assigned to deputy
 */
export async function getDeputyComplaints() {
  const supabaseClient = await supabaseClientBasedOnUserRole();
  const { data: userData } = await supabaseClient.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    return { data: [], error: "User not authenticated" };
  }

  // First, get the deputy_profile_id for this user
  const { data: deputyProfile } = await supabaseClient
    .from("deputy_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!deputyProfile) {
    return { data: [], error: "Deputy profile not found" };
  }

  // Then get complaints assigned to this deputy_profile_id
  const { data, error } = await supabaseClient
    .from("complaints")
    .select("*")
    .eq("assigned_deputy_id", deputyProfile.id)
    .order("created_at", { ascending: false });

  return { data: data || [], error: error?.message };
}



/**
 * Get all complaints for managers and admins
 */
export async function getAllComplaints() {
  const supabase = await createSupabaseUserServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: [], error: "User not authenticated" };
  }

  // Check if user is admin or manager
  const isAdmin = isSupabaseUserAppAdmin(user);
  const userType = await serverGetUserType();
  const isManager = userType === userRoles.MANAGER;

  // Only managers and admins can access all complaints
  if (!isAdmin && !isManager) {
    return { data: [], error: "Unauthorized access" };
  }

  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: data || [], error: error?.message };
}



/**
 * Assign a complaint to one or more deputies
 */
export async function assignComplaintToDeputy(
  complaintId: string,
  deputyIds: string | string[], // Support single or multiple deputies
  assignedBy: string
) {
  // Use admin client for privileged operations
  
  // Convert to array if single ID
  const deputyIdsArray = Array.isArray(deputyIds) ? deputyIds : [deputyIds];
  
  // For backward compatibility, set the first deputy as the primary assigned deputy
  const primaryDeputyId = deputyIdsArray[0];

  // Update complaint with primary deputy
  const { error: updateError } = await supabaseAdminClient
    .from("complaints")
    .update({
      assigned_deputy_id: primaryDeputyId,
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log action for each deputy
  const actionInserts = deputyIdsArray.map((deputyId) => ({
    complaint_id: complaintId,
    action_type: "assignment" as const,
    performed_by: assignedBy,
    new_value: deputyId,
    comment: deputyIdsArray.length > 1 ? `تم إسناد الشكوى لـ ${deputyIdsArray.length} نواب` : null,
  }));

  const { error: actionError } = await supabaseAdminClient
    .from("complaint_actions")
    .insert(actionInserts);

  if (actionError) {
    console.error("Failed to log action:", actionError);
  }

  revalidatePath("/manager-complaints");
  revalidatePath("/deputy-complaints");

  return { success: true, assignedCount: deputyIdsArray.length };
}

/**
 * Update complaint status
 */
export async function updateComplaintStatus(
  complaintId: string,
  newStatus: string,
  userId: string,
  comment?: string
) {
  // Use admin client for privileged operations

  const updateData: any = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  // Set timestamp based on status
  if (newStatus === "accepted") {
    updateData.accepted_at = new Date().toISOString();
  } else if (newStatus === "rejected") {
    updateData.rejected_at = new Date().toISOString();
  } else if (newStatus === "resolved") {
    updateData.resolved_at = new Date().toISOString();
  } else if (newStatus === "closed") {
    updateData.closed_at = new Date().toISOString();
  }

  // Update complaint
  const { error: updateError } = await supabaseAdminClient
    .from("complaints")
    .update(updateData)
    .eq("id", complaintId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log action
  const { error: actionError } = await supabaseAdminClient
    .from("complaint_actions")
    .insert({
      complaint_id: complaintId,
      action_type: "status_change",
      performed_by: userId,
      new_value: newStatus,
      comment: comment || null,
    });

  if (actionError) {
    console.error("Failed to log action:", actionError);
  }

  // Grant points to deputy if complaint is resolved
  if (newStatus === "resolved") {
    // Get complaint to find assigned deputy
    const { data: complaint } = await supabaseAdminClient
      .from("complaints")
      .select("assigned_deputy_id")
      .eq("id", complaintId)
      .single();

    if (complaint?.assigned_deputy_id) {
      const pointsResult = await grantPointsToDeputy(complaint.assigned_deputy_id, 10);
      if (!pointsResult.success) {
        console.error("Failed to grant points:", pointsResult.error);
      }
    }
  }

  revalidatePath("/manager-complaints");
  revalidatePath("/deputy-complaints");
  revalidatePath("/complaints");

  return { success: true };
}

/**
 * Update complaint priority
 */
export async function updateComplaintPriority(
  complaintId: string,
  newPriority: string,
  userId: string
) {
  // Use admin client for privileged operations

  // Update complaint
  const { error: updateError } = await supabaseAdminClient
    .from("complaints")
    .update({
      priority: newPriority as "low" | "medium" | "high" | "urgent",
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Log action
  const { error: actionError } = await supabaseAdminClient
    .from("complaint_actions")
    .insert({
      complaint_id: complaintId,
      action_type: "priority_change",
      performed_by: userId,
      new_value: newPriority,
    });

  if (actionError) {
    console.error("Failed to log action:", actionError);
  }

  revalidatePath("/manager-complaints");
  revalidatePath("/deputy-complaints");

  return { success: true };
}




/**
 * Add a comment to a complaint
 */
export async function addComplaintComment(
  complaintId: string,
  userId: string,
  comment: string
) {
  // Log action with comment
  const { error: actionError } = await supabaseAdminClient
    .from("complaint_actions")
    .insert({
      complaint_id: complaintId,
      action_type: "comment",
      performed_by: userId,
      comment: comment,
    });

  if (actionError) {
    return { success: false, error: actionError.message };
  }

  // Update complaint timestamp
  const { error: updateError } = await supabaseAdminClient
    .from("complaints")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaintId);

  if (updateError) {
    console.error("Failed to update complaint timestamp:", updateError);
  }

  revalidatePath("/manager-complaints");
  revalidatePath("/deputy-complaints");
  revalidatePath("/complaints");

  return { success: true };
}

/**
 * Get complaint details with action history
 */
export async function getComplaintDetails(complaintId: string) {
  const supabaseClient = await supabaseClientBasedOnUserRole();

  // Get complaint
  const { data: complaint, error: complaintError } = await supabaseClient
    .from("complaints")
    .select("*")
    .eq("id", complaintId)
    .single();

  if (complaintError) {
    return { data: null, error: complaintError.message };
  }

  // Get action history
  const { data: actions, error: actionsError } = await supabaseClient
    .from("complaint_actions")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: false });

  if (actionsError) {
    return { 
      data: { complaint, actions: [] }, 
      error: "Failed to load action history" 
    };
  }

  return { data: { complaint, actions: actions || [] }, error: null };
}

/**
 * Get list of available deputies for assignment with filters
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
  const pageSize = 1000;
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
 * Approve complaint for public display (Admin only)
 */
export const approveComplaintForPublic = adminActionClient
  .schema(z.object({
    complaintId: z.string().uuid(),
    approved: z.boolean(),
  }))
  .action(async ({ parsedInput: { complaintId, approved } }) => {
    const { error } = await supabaseAdminClient
      .from("complaints")
      .update({ admin_approved_public: approved })
      .eq("id", complaintId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/manager-complaints");
    revalidatePath(`/manager-complaints/${complaintId}`);
    
    return { success: true };
  });

/**
 * Force complaint to be public (Admin only)
 * This allows admin to make complaint public even if citizen didn't request it
 */
export const forceComplaintPublic = adminActionClient
  .schema(z.object({
    complaintId: z.string().uuid(),
    makePublic: z.boolean(),
  }))
  .action(async ({ parsedInput: { complaintId, makePublic } }) => {
    const { error } = await supabaseAdminClient
      .from("complaints")
      .update({ 
        is_public: makePublic,
        admin_approved_public: makePublic 
      })
      .eq("id", complaintId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/manager-complaints");
    revalidatePath(`/manager-complaints/${complaintId}`);
    revalidatePath("/public-complaints");
    
    return { success: true };
  });



/**
 * Archive complaint (Admin only)
 */
export const archiveComplaint = adminActionClient
  .schema(z.object({
    complaintId: z.string().uuid(),
  }))
  .action(async ({ parsedInput: { complaintId } }) => {
    const { error } = await supabaseAdminClient
      .from("complaints")
      .update({ 
        is_archived: true,
        archived_at: new Date().toISOString()
      })
      .eq("id", complaintId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/manager-complaints");
    
    return { success: true };
  });

/**
 * Delete complaint permanently (Admin only)
 */
export const deleteComplaint = adminActionClient
  .schema(z.object({
    complaintId: z.string().uuid(),
  }))
  .action(async ({ parsedInput: { complaintId } }) => {
    const { error } = await supabaseAdminClient
      .from("complaints")
      .delete()
      .eq("id", complaintId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/manager-complaints");
    
    return { success: true };
  });



/**
 * Get archived complaints (Admin/Manager only)
 */
export async function getArchivedComplaints() {
  const supabase = await createSupabaseUserServerComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: [], error: "User not authenticated" };
  }

  // Check if user is admin or manager
  const isAdmin = isSupabaseUserAppAdmin(user);
  const userType = await serverGetUserType();
  const isManager = userType === userRoles.MANAGER;

  // Only managers and admins can access archived complaints
  if (!isAdmin && !isManager) {
    return { data: [], error: "Unauthorized access" };
  }

  const { data, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("is_archived", true)
    .order("archived_at", { ascending: false });

  return { data: data || [], error: error?.message };
}

/**
 * Unarchive complaint (Admin only)
 */
export const unarchiveComplaint = adminActionClient
  .schema(z.object({
    complaintId: z.string().uuid(),
  }))
  .action(async ({ parsedInput: { complaintId } }) => {
    const { error } = await supabaseAdminClient
      .from("complaints")
      .update({ 
        is_archived: false,
        archived_at: null
      })
      .eq("id", complaintId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/manager-complaints");
    revalidatePath("/manager-complaints/archived");
    
    return { success: true };
  });



/**
 * Get public complaints (accessible to everyone, no authentication required)
 */
export async function getPublicComplaints() {
  const supabase = await createSupabaseUserServerComponentClient();

  const { data, error } = await supabase
    .from("complaints")
    .select(`
      id,
      title,
      description,
      category,
      status,
      governorate,
      district,
      created_at,
      resolved_at,
      votes_count
    `)
    .eq("is_public", true)
    .eq("admin_approved_public", true)
    .eq("is_archived", false)
    .order("votes_count", { ascending: false })
    .order("created_at", { ascending: false });

  // Type assertion to include votes_count
  type ComplaintWithVotes = {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    governorate: string | null;
    district: string | null;
    created_at: string;
    resolved_at: string | null;
    votes_count: number;
  };

  return { 
    data: (data || []) as unknown as ComplaintWithVotes[], 
    error: error?.message 
  };
}



/**
 * Close complaint and award points to deputy (Admin only)
 * This should only be called for complaints in "resolved" status
 */
export const closeComplaint = adminActionClient
  .schema(z.object({
    complaintId: z.string().uuid(),
  }))
  .action(async ({ parsedInput: { complaintId } }) => {
    // Get complaint details to find assigned deputy
    const { data: complaint, error: fetchError } = await supabaseAdminClient
      .from("complaints")
      .select("assigned_deputy_id, status")
      .eq("id", complaintId)
      .single();

    if (fetchError || !complaint) {
      return { success: false, error: "Complaint not found" };
    }

    // Check if complaint is in resolved status
    if (complaint.status !== "resolved") {
      return { success: false, error: "Complaint must be in resolved status to close" };
    }

    // Check if deputy is assigned
    if (!complaint.assigned_deputy_id) {
      return { success: false, error: "No deputy assigned to this complaint" };
    }

    // Update complaint status to closed
    const { error: updateError } = await supabaseAdminClient
      .from("complaints")
      .update({ 
        status: "closed",
        resolved_at: new Date().toISOString()
      })
      .eq("id", complaintId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Get current points
    const { data: deputyData, error: deputyError } = await supabaseAdminClient
      .from("deputy_profiles")
      .select("points")
      .eq("id", complaint.assigned_deputy_id)
      .single();

    if (deputyError) {
      return { 
        success: true, 
        warning: "Complaint closed but failed to fetch deputy points: " + deputyError.message 
      };
    }

    // Award 10 points to the deputy
    const currentPoints = deputyData?.points || 0;
    const { error: pointsError } = await supabaseAdminClient
      .from("deputy_profiles")
      .update({ points: currentPoints + 10 })
      .eq("id", complaint.assigned_deputy_id);

    if (pointsError) {
      return { 
        success: true, 
        warning: "Complaint closed but failed to award points: " + pointsError.message 
      };
    }

    revalidatePath("/manager-complaints");
    revalidatePath(`/manager-complaints/${complaintId}`);
    
    return { success: true, message: "Complaint closed and 10 points awarded to deputy" };
  });



/**
 * Get single public complaint details (accessible to everyone, no authentication required)
 */
export async function getPublicComplaintById(complaintId: string) {
  const supabase = await createSupabaseUserServerComponentClient();

  const { data, error } = await supabase
    .from("complaints")
    .select(`
      id,
      title,
      description,
      category,
      status,
      governorate,
      district,
      created_at,
      resolved_at,
      priority
    `)
    .eq("id", complaintId)
    .eq("is_public", true)
    .eq("admin_approved_public", true)
    .eq("is_archived", false)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}


/**
 * Update complaint details (Admin/Manager only)
 */
export const updateComplaintDetails = adminActionClient
  .schema(z.object({
    complaintId: z.string().uuid(),
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
      "investment",
      "other",
    ]),
    governorate: z.string().nullable(),
    district: z.string().nullable(),
    createdAt: z.string(),
  }))
  .action(async ({ parsedInput: { complaintId, title, description, category, governorate, district, createdAt } }) => {
    // Update complaint
    const { error } = await supabaseAdminClient
      .from("complaints")
      .update({
        title,
        description,
        category: category as any,
        governorate,
        district,
        created_at: createdAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", complaintId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Revalidate paths
    revalidatePath("/manager-complaints");
    revalidatePath(`/manager-complaints/${complaintId}`);
    revalidatePath("/deputy-complaints");
    revalidatePath(`/deputy-complaints/${complaintId}`);
    revalidatePath("/public-complaints");
    revalidatePath(`/public-complaints/${complaintId}`);

    return { success: true };
  });
