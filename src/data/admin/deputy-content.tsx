"use server";

import { deputyOrAdminActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabaseAdminClient";
import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";
import { serverGetUserType } from "@/utils/server/serverGetUserType";
import { userRoles } from "@/utils/userTypes";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ============================================
// SCHEMAS
// ============================================

const createContentItemSchema = z.object({
  deputyId: z.string().uuid(),
  title: z.string().min(1, "العنوان مطلوب"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  eventDate: z.string().optional(), // For events only
  displayOrder: z.number().int().default(0),
});

const updateContentItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "العنوان مطلوب").optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  eventDate: z.string().optional(), // For events only
  displayOrder: z.number().int().optional(),
});

const deleteContentItemSchema = z.object({
  id: z.string().uuid(),
});

const getContentItemsSchema = z.object({
  deputyId: z.string().uuid(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function verifyDeputyOwnership(deputyId: string, userId: string) {
  const userType = await serverGetUserType();
  
  // Admins can access any deputy's data
  if (userType === userRoles.ADMIN) {
    return true;
  }
  
  // Deputies can only access their own data
  if (userType === userRoles.DEPUTY) {
    const { data: deputyProfile } = await supabaseAdminClient
      .from("deputy_profiles")
      .select("user_id")
      .eq("id", deputyId)
      .single();
    
    if (!deputyProfile || deputyProfile.user_id !== userId) {
      throw new Error("ليس لديك صلاحية للوصول إلى هذه البيانات");
    }
    return true;
  }
  
  throw new Error("ليس لديك صلاحية للوصول إلى هذه البيانات");
}

async function verifyItemOwnership(itemId: string, userId: string, tableName: string) {
  const userType = await serverGetUserType();
  
  // Admins can access any item
  if (userType === userRoles.ADMIN) {
    return true;
  }
  
  // Deputies can only access their own items
  if (userType === userRoles.DEPUTY) {
    const { data: item } = await supabaseAdminClient
      .from(tableName as any)
      .select("deputy_id")
      .eq("id", itemId)
      .single();
    
    if (!item) {
      throw new Error("البند غير موجود");
    }
    
    const { data: deputyProfile } = await supabaseAdminClient
      .from("deputy_profiles")
      .select("user_id")
      .eq("id", item.deputy_id)
      .single();
    
    if (!deputyProfile || deputyProfile.user_id !== userId) {
      throw new Error("ليس لديك صلاحية للوصول إلى هذه البيانات");
    }
    return true;
  }
  
  throw new Error("ليس لديك صلاحية للوصول إلى هذه البيانات");
}

// ============================================
// ELECTORAL PROGRAMS
// ============================================

export const createElectoralProgramAction = deputyOrAdminActionClient
  .schema(createContentItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { deputyId, title, description, imageUrl, displayOrder } = parsedInput;
    
    // Verify ownership
    await verifyDeputyOwnership(deputyId, ctx.userId);

    const { data, error } = await supabaseAdminClient
      .from("deputy_electoral_programs")
      .insert({
        deputy_id: deputyId,
        title,
        description: description || null,
        image_url: imageUrl || null,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating electoral program:", error);
      throw new Error("فشل إضافة بند البرنامج الانتخابي");
    }

    revalidatePath("/app_admin/deputies");
    revalidatePath("/deputy");
    return { success: true, data };
  });

export const updateElectoralProgramAction = deputyOrAdminActionClient
  .schema(updateContentItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...updates } = parsedInput;
    
    // Verify ownership
    await verifyItemOwnership(id, ctx.userId, "deputy_electoral_programs");

    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl || null;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;

    const { data, error } = await supabaseAdminClient
      .from("deputy_electoral_programs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating electoral program:", error);
      throw new Error("فشل تحديث بند البرنامج الانتخابي");
    }

    revalidatePath("/app_admin/deputies");
    revalidatePath("/deputy");
    return { success: true, data };
  });

export const deleteElectoralProgramAction = deputyOrAdminActionClient
  .schema(deleteContentItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;
    
    // Verify ownership
    await verifyItemOwnership(id, ctx.userId, "deputy_electoral_programs");

    const { error } = await supabaseAdminClient
      .from("deputy_electoral_programs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting electoral program:", error);
      throw new Error("فشل حذف بند البرنامج الانتخابي");
    }

    revalidatePath("/app_admin/deputies");
    revalidatePath("/deputy");
    return { success: true };
  });

export const getElectoralProgramsAction = deputyOrAdminActionClient
  .schema(getContentItemsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { deputyId } = parsedInput;
    
    // Verify ownership
    await verifyDeputyOwnership(deputyId, ctx.userId);

    const { data, error } = await supabaseAdminClient
      .from("deputy_electoral_programs")
      .select("*")
      .eq("deputy_id", deputyId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching electoral programs:", error);
      throw new Error("فشل جلب البرنامج الانتخابي");
    }

    return { success: true, data: data || [] };
  });

// ============================================
// ACHIEVEMENTS
// ============================================

export const createAchievementAction = deputyOrAdminActionClient
  .schema(createContentItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { deputyId, title, description, imageUrl, displayOrder } = parsedInput;
    
    // Verify ownership
    await verifyDeputyOwnership(deputyId, ctx.userId);

    const { data, error } = await supabaseAdminClient
      .from("deputy_achievements")
      .insert({
        deputy_id: deputyId,
        title,
        description: description || null,
        image_url: imageUrl || null,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating achievement:", error);
      throw new Error("فشل إضافة الإنجاز");
    }

    revalidatePath("/app_admin/deputies");
    revalidatePath("/deputy");
    return { success: true, data };
  });

export const updateAchievementAction = deputyOrAdminActionClient
  .schema(updateContentItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...updates } = parsedInput;
    
    // Verify ownership
    await verifyItemOwnership(id, ctx.userId, "deputy_achievements");

    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl || null;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;

    const { data, error } = await supabaseAdminClient
      .from("deputy_achievements")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating achievement:", error);
      throw new Error("فشل تحديث الإنجاز");
    }

    revalidatePath("/app_admin/deputies");
    revalidatePath("/deputy");
    return { success: true, data };
  });

export const deleteAchievementAction = deputyOrAdminActionClient
  .schema(deleteContentItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;
    
    // Verify ownership
    await verifyItemOwnership(id, ctx.userId, "deputy_achievements");

    const { error } = await supabaseAdminClient
      .from("deputy_achievements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting achievement:", error);
      throw new Error("فشل حذف الإنجاز");
    }

    revalidatePath("/app_admin/deputies");
    revalidatePath("/deputy");
    return { success: true };
  });

export const getAchievementsAction = deputyOrAdminActionClient
  .schema(getContentItemsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { deputyId } = parsedInput;
    
    // Verify ownership
    await verifyDeputyOwnership(deputyId, ctx.userId);

    const { data, error } = await supabaseAdminClient
      .from("deputy_achievements")
      .select("*")
      .eq("deputy_id", deputyId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching achievements:", error);
      throw new Error("فشل جلب الإنجازات");
    }

    return { success: true, data: data || [] };
  });

// ============================================
// EVENTS
// ============================================

export const createEventAction = deputyOrAdminActionClient
  .schema(createContentItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { deputyId, title, description, imageUrl, eventDate, displayOrder } = parsedInput;
    
    // Verify ownership
    await verifyDeputyOwnership(deputyId, ctx.userId);

    const { data, error } = await supabaseAdminClient
      .from("deputy_events")
      .insert({
        deputy_id: deputyId,
        title,
        description: description || null,
        image_url: imageUrl || null,
        event_date: eventDate || null,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      throw new Error("فشل إضافة المناسبة");
    }

    revalidatePath("/app_admin/deputies");
    revalidatePath("/deputy");
    return { success: true, data };
  });

export const updateEventAction = deputyOrAdminActionClient
  .schema(updateContentItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, ...updates } = parsedInput;
    
    // Verify ownership
    await verifyItemOwnership(id, ctx.userId, "deputy_events");

    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl || null;
    if (updates.eventDate !== undefined) updateData.event_date = updates.eventDate || null;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;

    const { data, error } = await supabaseAdminClient
      .from("deputy_events")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating event:", error);
      throw new Error("فشل تحديث المناسبة");
    }

    revalidatePath("/app_admin/deputies");
    revalidatePath("/deputy");
    return { success: true, data };
  });

export const deleteEventAction = deputyOrAdminActionClient
  .schema(deleteContentItemSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;
    
    // Verify ownership
    await verifyItemOwnership(id, ctx.userId, "deputy_events");

    const { error } = await supabaseAdminClient
      .from("deputy_events")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting event:", error);
      throw new Error("فشل حذف المناسبة");
    }

    revalidatePath("/app_admin/deputies");
    revalidatePath("/deputy");
    return { success: true };
  });

export const getEventsAction = deputyOrAdminActionClient
  .schema(getContentItemsSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { deputyId } = parsedInput;
    
    // Verify ownership
    await verifyDeputyOwnership(deputyId, ctx.userId);

    const { data, error } = await supabaseAdminClient
      .from("deputy_events")
      .select("*")
      .eq("deputy_id", deputyId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
      throw new Error("فشل جلب المناسبات");
    }

    return { success: true, data: data || [] };
  });

