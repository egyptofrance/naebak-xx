"use server";

import { adminActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabaseAdminClient";
import { z } from "zod";

/**
 * Get all councils
 */
export const getCouncilsAction = adminActionClient.action(async () => {
  const { data: councils, error } = await supabaseAdminClient
    .from("councils")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch councils: ${error.message}`);
  }

  return { councils: councils || [] };
});

/**
 * Create a new council
 */
const createCouncilSchema = z.object({
  name_ar: z.string().min(1, "Arabic name is required"),
  name_en: z.string().min(1, "English name is required"),
  code: z.string().min(1, "Code is required"),
  description_ar: z.string().optional(),
  description_en: z.string().optional(),
});

export const createCouncilAction = adminActionClient
  .schema(createCouncilSchema)
  .action(async ({ parsedInput }) => {
    // Check if council with same Arabic name already exists
    const { data: existingCouncilByName } = await supabaseAdminClient
      .from("councils")
      .select("id, name_ar")
      .eq("name_ar", parsedInput.name_ar)
      .maybeSingle();

    if (existingCouncilByName) {
      throw new Error(`مجلس بنفس الاسم "${parsedInput.name_ar}" موجود بالفعل`);
    }

    // Check if council with same code already exists
    const { data: existingCouncilByCode } = await supabaseAdminClient
      .from("councils")
      .select("id, code")
      .eq("code", parsedInput.code)
      .maybeSingle();

    if (existingCouncilByCode) {
      throw new Error(`مجلس بنفس الكود "${parsedInput.code}" موجود بالفعل`);
    }

    // Get the highest display_order
    const { data: maxOrderCouncil } = await supabaseAdminClient
      .from("councils")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const newDisplayOrder = (maxOrderCouncil?.display_order ?? -1) + 1;

    const { data, error } = await supabaseAdminClient
      .from("councils")
      .insert({
        ...parsedInput,
        display_order: newDisplayOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create council: ${error.message}`);
    }

    return { council: data, message: "Council created successfully" };
  });

/**
 * Update a council
 */
const updateCouncilSchema = z.object({
  id: z.string().uuid(),
  name_ar: z.string().min(1, "Arabic name is required"),
  name_en: z.string().min(1, "English name is required"),
  code: z.string().min(1, "Code is required"),
  description_ar: z.string().optional(),
  description_en: z.string().optional(),
});

export const updateCouncilAction = adminActionClient
  .schema(updateCouncilSchema)
  .action(async ({ parsedInput: { id, ...updates } }) => {
    // Check if another council with same Arabic name already exists
    const { data: existingCouncilByName } = await supabaseAdminClient
      .from("councils")
      .select("id, name_ar")
      .eq("name_ar", updates.name_ar)
      .neq("id", id)
      .maybeSingle();

    if (existingCouncilByName) {
      throw new Error(`مجلس آخر بنفس الاسم "${updates.name_ar}" موجود بالفعل`);
    }

    // Check if another council with same code already exists
    const { data: existingCouncilByCode } = await supabaseAdminClient
      .from("councils")
      .select("id, code")
      .eq("code", updates.code)
      .neq("id", id)
      .maybeSingle();

    if (existingCouncilByCode) {
      throw new Error(`مجلس آخر بنفس الكود "${updates.code}" موجود بالفعل`);
    }

    const { data, error } = await supabaseAdminClient
      .from("councils")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update council: ${error.message}`);
    }

    return { council: data, message: "Council updated successfully" };
  });

/**
 * Update council display order
 */
const updateCouncilOrderSchema = z.object({
  id: z.string().uuid(),
  newOrder: z.number().int().min(0),
});

export const updateCouncilOrderAction = adminActionClient
  .schema(updateCouncilOrderSchema)
  .action(async ({ parsedInput: { id, newOrder } }) => {
    const { error } = await supabaseAdminClient
      .from("councils")
      .update({ display_order: newOrder })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update council order: ${error.message}`);
    }

    return { message: "Council order updated successfully" };
  });

/**
 * Delete a council
 */
const deleteCouncilSchema = z.object({
  id: z.string().uuid(),
});

export const deleteCouncilAction = adminActionClient
  .schema(deleteCouncilSchema)
  .action(async ({ parsedInput: { id } }) => {
    const { error } = await supabaseAdminClient
      .from("councils")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete council: ${error.message}`);
    }

    return { message: "Council deleted successfully" };
  });

/**
 * Toggle council active status
 */
const toggleCouncilActiveSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

export const toggleCouncilActiveAction = adminActionClient
  .schema(toggleCouncilActiveSchema)
  .action(async ({ parsedInput: { id, isActive } }) => {
    const { error } = await supabaseAdminClient
      .from("councils")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to toggle council status: ${error.message}`);
    }

    return { message: `Council ${isActive ? "activated" : "deactivated"} successfully` };
  });


/**
 * Reorder all councils (fix existing data)
 */
export const reorderAllCouncilsAction = adminActionClient
  .schema(z.object({}))
  .action(async () => {
    // Get all councils ordered by name_ar
    const { data: councils, error: fetchError } = await supabaseAdminClient
      .from("councils")
      .select("id, name_ar")
      .order("name_ar", { ascending: true });

    if (fetchError || !councils) {
      throw new Error(`Failed to fetch councils: ${fetchError?.message}`);
    }

    // Update each council with new display_order
    const updates = councils.map((council, index) => 
      supabaseAdminClient
        .from("councils")
        .update({ display_order: index })
        .eq("id", council.id)
    );

    await Promise.all(updates);

    return { message: `Successfully reordered ${councils.length} councils` };
  });

