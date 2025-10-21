"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";

export type UserRole = "admin" | "deputy" | "manager" | "citizen";

/**
 * Get the user's primary role and redirect URL
 */
export async function getUserRoleAndDashboard(): Promise<{
  role: UserRole;
  dashboardUrl: string;
}> {
  const supabase = await createSupabaseUserServerComponentClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { role: "citizen", dashboardUrl: "/citizen" };
  }

  // Check if admin
  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (adminRole) {
    return { role: "admin", dashboardUrl: "/app_admin" };
  }

  // Check if deputy
  const { data: deputyProfile } = await supabase
    .from("deputy_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (deputyProfile) {
    return { role: "deputy", dashboardUrl: "/app_deputy" };
  }

  // Check if manager
  const { data: managerPermissions } = await supabase
    .from("manager_permissions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (managerPermissions) {
    return { role: "manager", dashboardUrl: "/app_manager" };
  }

  // Default to citizen
  return { role: "citizen", dashboardUrl: "/citizen" };
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const { role: userRole } = await getUserRoleAndDashboard();
  return userRole === role;
}

