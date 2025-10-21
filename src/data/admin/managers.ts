"use server";

import { actionClient } from "@/lib/safe-action";
import { createClient } from "@supabase/supabase-js";
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
    
    // Use service role client to bypass RLS issues
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    try {
      // Check if user exists
      console.log('[promoteToManager] Checking if user exists...');
      const { data: user, error: userError } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        console.error('[promoteToManager] User not found:', userError);
        throw new Error("المستخدم غير موجود");
      }

      console.log('[promoteToManager] User found:', user.full_name);

      // Check if user is already a manager
      console.log('[promoteToManager] Checking if user is already a manager...');
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "manager")
        .maybeSingle();

      if (existingRole) {
        console.log('[promoteToManager] User is already a manager');
        throw new Error("هذا المستخدم مدير بالفعل");
      }

      // Step 1: Remove "citizen" role if exists
      console.log('[promoteToManager] Removing citizen role if exists...');
      const { error: removeCitizenError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "citizen");

      if (removeCitizenError) {
        console.error('[promoteToManager] Error removing citizen role:', removeCitizenError);
        // Don't throw error, citizen role might not exist
      } else {
        console.log('[promoteToManager] Citizen role removed successfully');
      }

      // Step 2: Add manager role
      console.log('[promoteToManager] Adding manager role...');
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "manager",
        })
        .select()
        .single();

      if (roleError) {
        console.error('[promoteToManager] Error adding role:', roleError);
        throw new Error(`فشل إضافة دور المدير: ${roleError.message}`);
      }

      console.log('[promoteToManager] Manager role added successfully:', roleData);

      // Step 3: Create manager permissions record with default permissions
      console.log('[promoteToManager] Creating manager permissions...');
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
        // Rollback: remove the role if permissions creation fails
        await supabase
          .from("user_roles")
          .delete()
          .eq("id", roleData.id);
        throw new Error(`فشل إنشاء صلاحيات المدير: ${permissionsError.message}`);
      }

      console.log('[promoteToManager] Manager permissions created successfully');
      console.log('[promoteToManager] Successfully promoted user to manager');
      
      return {
        message: `تم ترقية ${user.full_name || "المستخدم"} إلى مدير بنجاح. تم حذفه من قائمة المواطنين وإضافته إلى قائمة المديرين.`,
      };
    } catch (error) {
      console.error('[promoteToManager] Unexpected error:', error);
      throw error;
    }
  });

/**
 * Update manager permissions
 */
export const updateManagerPermissionsAction = actionClient
  .schema(updateManagerPermissionsSchema)
  .action(async ({ parsedInput: { userId, permissions } }) => {
    console.log('[updateManagerPermissions] Updating permissions for:', userId);
    
    // Use service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user is a manager
    const { data: managerRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "manager")
      .maybeSingle();

    if (!managerRole) {
      throw new Error("المستخدم ليس مديراً");
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
      throw new Error(`فشل تحديث الصلاحيات: ${error.message}`);
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
    // Use service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data, error } = await supabase
      .from("manager_permissions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error('[getManagerPermissions] Error:', error);
      return { permissions: null };
    }

    return { permissions: data };
  });



/**
 * Demote manager to citizen (remove manager role and permissions)
 */
const demoteManagerSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

export const demoteManagerAction = actionClient
  .schema(demoteManagerSchema)
  .action(async ({ parsedInput: { userId } }) => {
    console.log('[demoteManager] Demoting manager:', userId);
    
    // Use service role client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    try {
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from("user_profiles")
        .select("id, full_name")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        throw new Error("المستخدم غير موجود");
      }

      // Check if user is a manager
      const { data: managerRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", "manager")
        .maybeSingle();

      if (!managerRole) {
        throw new Error("المستخدم ليس مديراً");
      }

      // Step 1: Delete manager permissions
      console.log('[demoteManager] Deleting manager permissions...');
      const { error: permissionsError } = await supabase
        .from("manager_permissions")
        .delete()
        .eq("user_id", userId);

      if (permissionsError) {
        console.error('[demoteManager] Error deleting permissions:', permissionsError);
        // Continue anyway, permissions might not exist
      }

      // Step 2: Remove manager role
      console.log('[demoteManager] Removing manager role...');
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "manager");

      if (roleError) {
        throw new Error(`فشل إزالة دور المدير: ${roleError.message}`);
      }

      // Step 3: Add citizen role back
      console.log('[demoteManager] Adding citizen role...');
      const { error: citizenError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "citizen",
        });

      if (citizenError) {
        console.error('[demoteManager] Error adding citizen role:', citizenError);
        // Don't throw error, user might already have citizen role
      }

      console.log('[demoteManager] Successfully demoted manager to citizen');
      
      return {
        message: `تم إزالة ${user.full_name || "المستخدم"} من قائمة المديرين وإعادته إلى قائمة المواطنين.`,
      };
    } catch (error) {
      console.error('[demoteManager] Unexpected error:', error);
      throw error;
    }
  });

