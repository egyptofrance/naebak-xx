"use server";

import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";
import { revalidatePath } from "next/cache";

/**
 * Update the visibility status of a governorate
 * Only admins can perform this action
 */
export async function updateGovernorateVisibility(
  governorateId: string,
  isVisible: boolean
) {
  const supabase = await createSupabaseUserServerActionClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "غير مصرح" };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["super_admin", "admin"].includes(profile.role)) {
    return { success: false, error: "غير مصرح - يجب أن تكون مسؤولاً" };
  }

  // Update governorate visibility
  const { error } = await supabase
    .from("governorates")
    .update({ is_visible: isVisible } as any)
    .eq("id", governorateId);

  if (error) {
    console.error("Error updating governorate visibility:", error);
    return { success: false, error: "فشل في تحديث حالة المحافظة" };
  }

  // Revalidate relevant paths
  revalidatePath("/");
  revalidatePath("/deputies");
  revalidatePath("/public-complaints");
  revalidatePath("/app_admin/governorates");

  return { success: true };
}
