"use server";

import { actionClient } from "@/lib/safe-action";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { z } from "zod";

// Schema for promoting user to manager
const promoteToManagerSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

// Schema for updating manager permissions
const updateManagerPermissionsSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  permissions: z.object({
    canManageUsers: z.boolean().optional(),
    canManageDeputies: z.boolean().optional(),
    canManageContent: z.boolean().optional(),
    canViewReports: z.boolean().optional(),
    canManageSettings: z.boolean().optional(),
  }),
});

/**
 * Promote a user to manager role
 */
export const promoteToManagerAction = actionClient
  .schema(promoteToManagerSchema)
  .action(async ({ parsedInput: { userId } }) => {
    console.log('[promoteToManager] Promoting user:', userId);
    const supabase = await createSupabaseUserServerComponentClient();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("user_profiles")
      .select("id, full_name")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new Error("User not found");
    }

    // Check if user is already a manager
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "manager")
      .single();

    if (existingRole) {
      throw new Error("User is already a manager");
    }

    // Add manager role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "manager",
      });

    if (roleError) {
      console.error('[promoteToManager] Error adding role:', roleError);
      throw new Error(`Failed to add manager role: ${roleError.message}`);
    }

    // Create manager permissions record with default permissions
    const { error: permissionsError } = await supabase
      .from("manager_permissions")
      .insert({
        user_id: userId,
        can_manage_users: false,
        can_manage_deputies: false,
        can_manage_content: false,
        can_view_reports: false,
        can_manage_settings: false,
      });

    if (permissionsError) {
      console.error('[promoteToManager] Error creating permissions:', permissionsError);
      // Don't throw error here, role is already created
    }

    console.log('[promoteToManager] Successfully promoted user to manager');
    return {
      message: `تم ترقية ${user.full_name || "المستخدم"} إلى مدير بنجاح. يمكنك الآن تخصيص صلاحياته.`,
    };
  });

/**
 * Update manager permissions
 */
export const updateManagerPermissionsAction = actionClient
  .schema(updateManagerPermissionsSchema)
  .action(async ({ parsedInput: { userId, permissions } }) => {
    console.log('[updateManagerPermissions] Updating permissions for:', userId);
    const supabase = await createSupabaseUserServerComponentClient();

    // Check if user is a manager
    const { data: managerRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "manager")
      .single();

    if (!managerRole) {
      throw new Error("User is not a manager");
    }

    // Update permissions
    const { error } = await supabase
      .from("manager_permissions")
      .upsert({
        user_id: userId,
        can_manage_users: permissions.canManageUsers ?? false,
        can_manage_deputies: permissions.canManageDeputies ?? false,
        can_manage_content: permissions.canManageContent ?? false,
        can_view_reports: permissions.canViewReports ?? false,
        can_manage_settings: permissions.canManageSettings ?? false,
      });

    if (error) {
      console.error('[updateManagerPermissions] Error:', error);
      throw new Error(`Failed to update permissions: ${error.message}`);
    }

    console.log('[updateManagerPermissions] Successfully updated permissions');
    return {
      message: "تم تحديث صلاحيات المدير بنجاح",
    };
  });

/**
 * Get manager permissions
 */
export const getManagerPermissionsAction = actionClient
  .schema(z.object({ userId: z.string().uuid() }))
  .action(async ({ parsedInput: { userId } }) => {
    const supabase = await createSupabaseUserServerComponentClient();

    const { data, error } = await supabase
      .from("manager_permissions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error('[getManagerPermissions] Error:', error);
      return { permissions: null };
    }

    return { permissions: data };
  });

