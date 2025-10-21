"use server";

import { adminActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabaseAdminClient";
import { z } from "zod";

/**
 * Get all parties
 */
export const getPartiesAction = adminActionClient.action(async () => {
  const { data: parties, error } = await supabaseAdminClient
    .from("parties")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch parties: ${error.message}`);
  }

  return { parties: parties || [] };
});

/**
 * Create a new party
 */
const createPartySchema = z.object({
  name_ar: z.string().min(1, "Arabic name is required"),
  name_en: z.string().min(1, "English name is required"),
  abbreviation: z.string().optional(),
});

export const createPartyAction = adminActionClient
  .schema(createPartySchema)
  .action(async ({ parsedInput }) => {
    // Get the highest display_order
    const { data: maxOrderParty } = await supabaseAdminClient
      .from("parties")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    const newDisplayOrder = (maxOrderParty?.display_order ?? 0) + 1;

    const { data, error } = await supabaseAdminClient
      .from("parties")
      .insert({
        ...parsedInput,
        display_order: newDisplayOrder,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create party: ${error.message}`);
    }

    return { party: data, message: "Party created successfully" };
  });

/**
 * Update a party
 */
const updatePartySchema = z.object({
  id: z.string().uuid(),
  name_ar: z.string().min(1, "Arabic name is required"),
  name_en: z.string().min(1, "English name is required"),
  abbreviation: z.string().optional(),
});

export const updatePartyAction = adminActionClient
  .schema(updatePartySchema)
  .action(async ({ parsedInput: { id, ...updates } }) => {
    const { data, error } = await supabaseAdminClient
      .from("parties")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update party: ${error.message}`);
    }

    return { party: data, message: "Party updated successfully" };
  });

/**
 * Update party display order
 */
const updatePartyOrderSchema = z.object({
  id: z.string().uuid(),
  newOrder: z.number().int().positive(),
});

export const updatePartyOrderAction = adminActionClient
  .schema(updatePartyOrderSchema)
  .action(async ({ parsedInput: { id, newOrder } }) => {
    const { error } = await supabaseAdminClient
      .from("parties")
      .update({ display_order: newOrder })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to update party order: ${error.message}`);
    }

    return { message: "Party order updated successfully" };
  });

/**
 * Delete a party
 */
const deletePartySchema = z.object({
  id: z.string().uuid(),
});

export const deletePartyAction = adminActionClient
  .schema(deletePartySchema)
  .action(async ({ parsedInput: { id } }) => {
    const { error } = await supabaseAdminClient
      .from("parties")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete party: ${error.message}`);
    }

    return { message: "Party deleted successfully" };
  });

/**
 * Toggle party active status
 */
const togglePartyActiveSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

export const togglePartyActiveAction = adminActionClient
  .schema(togglePartyActiveSchema)
  .action(async ({ parsedInput: { id, isActive } }) => {
    const { error } = await supabaseAdminClient
      .from("parties")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to toggle party status: ${error.message}`);
    }

    return { message: `Party ${isActive ? "activated" : "deactivated"} successfully` };
  });

