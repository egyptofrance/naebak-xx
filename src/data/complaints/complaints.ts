"use server";

import { authActionClient, adminActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabaseAdminClient";
import { supabaseClientBasedOnUserRole } from "@/supabase-clients/user-role-client";
import { serverGetUserType } from "@/utils/server/serverGetUserType";
import { userRoles } from "@/utils/userTypes";
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

