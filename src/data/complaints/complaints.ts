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
        category: parsedInput.category,
        status: "new",
        priority: "medium",
        governorate: parsedInput.governorate,
        district: parsedInput.district,
        address: parsedInput.address,
        location_lat: parsedInput.location_lat,
        location_lng: parsedInput.location_lng,
        citizen_phone: parsedInput.citizen_phone,
        citizen_email: parsedInput.citizen_email,
      })
      .select("*")
      .single();

    if (error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    revalidatePath("/complaints");
    revalidatePath("/app_admin/complaints");
    revalidatePath("/manager-complaints");

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

  const { data, error } = await supabaseClient
    .from("complaints")
    .select("*")
    .eq("assigned_deputy_id", userId)
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
 * Assign a complaint to a deputy
 */
export async function assignComplaintToDeputy(
  complaintId: string,
  deputyId: string,
  assignedBy: string
) {
  // Use admin client for privileged operations

  // Update complaint
  const { error: updateError } = await supabaseAdminClient
    .from("complaints")
    .update({
      assigned_deputy_id: deputyId,
      assigned_at: new Date().toISOString(),
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
      action_type: "assignment",
      performed_by: assignedBy,
      new_value: deputyId,
    });

  if (actionError) {
    console.error("Failed to log action:", actionError);
  }

  revalidatePath("/manager-complaints");
  revalidatePath("/deputy-complaints");

  return { success: true };
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
 * Get list of available deputies for assignment
 */
export async function getAvailableDeputies() {
  const supabaseClient = await supabaseClientBasedOnUserRole();

  const { data, error } = await supabaseClient
    .from("deputy_profiles")
    .select(`
      id,
      governorate,
      party,
      user_profiles!deputy_profiles_user_id_fkey(
        full_name
      )
    `)
    .order("user_profiles(full_name)", { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  // Transform data to flatten user_profiles
  const transformedData = data?.map((deputy: any) => ({
    id: deputy.id,
    full_name: deputy.user_profiles?.full_name || "غير محدد",
    governorate: deputy.governorate,
    party: deputy.party,
  })) || [];

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

