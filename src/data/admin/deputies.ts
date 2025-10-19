"use server";

import { actionClient } from "@/lib/safe-action";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { z } from "zod";

// Schema for searching users
const searchUsersSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});

// Schema for creating deputy profile
const createDeputySchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  deputyStatus: z.enum(["active", "inactive"]),
});

// Schema for updating deputy profile
const updateDeputySchema = z.object({
  deputyId: z.string().uuid("Invalid deputy ID"),
  bio: z.string().optional(),
  officeAddress: z.string().optional(),
  officePhone: z.string().optional(),
  officeHours: z.string().optional(),
  electoralSymbol: z.string().optional(),
  electoralNumber: z.string().optional(),
  electoralProgram: z.string().optional(),
  achievements: z.string().optional(),
  events: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  socialMediaFacebook: z.string().url().optional().or(z.literal("")),
  socialMediaTwitter: z.string().url().optional().or(z.literal("")),
  socialMediaInstagram: z.string().url().optional().or(z.literal("")),
  socialMediaYoutube: z.string().url().optional().or(z.literal("")),
  councilId: z.string().uuid().optional().nullable(),
});

/**
 * Search for users by name, email, or phone
 */
export const searchUsersAction = actionClient
  .schema(searchUsersSchema)
  .action(async ({ parsedInput: { query } }) => {
    const supabase = await createSupabaseUserServerComponentClient();

    // Search in user_profiles
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select(
        `
        id,
        full_name,
        email,
        phone,
        governorate_id,
        party_id
      `
      )
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(20);

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }

    // Check which users are already deputies
    const userIds = users?.map((u) => u.id) || [];
    const { data: existingDeputies } = await supabase
      .from("deputy_profiles")
      .select("user_id")
      .in("user_id", userIds);

    const deputyUserIds = new Set(existingDeputies?.map((d) => d.user_id) || []);

    // Add isDeputy flag to each user
    const usersWithDeputyStatus = users?.map((user) => ({
      ...user,
      isDeputy: deputyUserIds.has(user.id),
      governorates: null,
      parties: null,
    }));

    return { users: usersWithDeputyStatus || [] };
  });

/**
 * Create a deputy profile for a user
 */
export const createDeputyAction = actionClient
  .schema(createDeputySchema)
  .action(async ({ parsedInput: { userId, deputyStatus } }) => {
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

    // Check if deputy profile already exists
    const { data: existingDeputy } = await supabase
      .from("deputy_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existingDeputy) {
      throw new Error("User is already a deputy");
    }

    // Create deputy profile
    const { data: deputy, error: deputyError } = await supabase
      .from("deputy_profiles")
      .insert({
        user_id: userId,
        deputy_status: deputyStatus,
      })
      .select()
      .single();

    if (deputyError) {
      throw new Error(`Failed to create deputy profile: ${deputyError.message}`);
    }

    return { deputy, message: "Deputy profile created successfully" };
  });

/**
 * Get all deputies with their user information
 */
export const getDeputiesAction = actionClient.action(async () => {
  const supabase = await createSupabaseUserServerComponentClient();

  const { data: deputies, error } = await supabase
    .from("deputy_profiles")
    .select(
      `
      id,
      user_id,
      deputy_status,
      electoral_symbol,
      electoral_number,
      created_at,
      user_profiles (
        full_name,
        email,
        phone,
        governorate_id,
        party_id,
        governorates (
          name_ar,
          name_en
        ),
        parties (
          name_ar,
          name_en
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch deputies: ${error.message}`);
  }

  return { deputies: deputies || [] };
});

/**
 * Get a single deputy profile with full details
 */
export const getDeputyByIdAction = actionClient
  .schema(z.object({ deputyId: z.string().uuid() }))
  .action(async ({ parsedInput: { deputyId } }) => {
    const supabase = await createSupabaseUserServerComponentClient();

    const { data: deputy, error } = await supabase
      .from("deputy_profiles")
      .select(
        `
        *,
        user_profiles (
          full_name,
          email,
          phone,
          governorate_id,
          party_id,
          electoral_district,
          governorates (
            name_ar,
            name_en
          ),
          parties (
            name_ar,
            name_en
          )
        ),
        councils (
          name_ar,
          name_en
        )
      `
      )
      .eq("id", deputyId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch deputy: ${error.message}`);
    }

    return { deputy };
  });

/**
 * Update deputy profile
 */
export const updateDeputyAction = actionClient
  .schema(updateDeputySchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseUserServerComponentClient();
    const { deputyId, ...updateData } = parsedInput;

    // Convert camelCase to snake_case for database
    const dbUpdateData: any = {};
    if (updateData.bio !== undefined) dbUpdateData.bio = updateData.bio;
    if (updateData.officeAddress !== undefined)
      dbUpdateData.office_address = updateData.officeAddress;
    if (updateData.officePhone !== undefined)
      dbUpdateData.office_phone = updateData.officePhone;
    if (updateData.officeHours !== undefined)
      dbUpdateData.office_hours = updateData.officeHours;
    if (updateData.electoralSymbol !== undefined)
      dbUpdateData.electoral_symbol = updateData.electoralSymbol;
    if (updateData.electoralNumber !== undefined)
      dbUpdateData.electoral_number = updateData.electoralNumber;
    if (updateData.electoralProgram !== undefined)
      dbUpdateData.electoral_program = updateData.electoralProgram;
    if (updateData.achievements !== undefined)
      dbUpdateData.achievements = updateData.achievements;
    if (updateData.events !== undefined) dbUpdateData.events = updateData.events;
    if (updateData.websiteUrl !== undefined)
      dbUpdateData.website_url = updateData.websiteUrl || null;
    if (updateData.socialMediaFacebook !== undefined)
      dbUpdateData.social_media_facebook = updateData.socialMediaFacebook || null;
    if (updateData.socialMediaTwitter !== undefined)
      dbUpdateData.social_media_twitter = updateData.socialMediaTwitter || null;
    if (updateData.socialMediaInstagram !== undefined)
      dbUpdateData.social_media_instagram = updateData.socialMediaInstagram || null;
    if (updateData.socialMediaYoutube !== undefined)
      dbUpdateData.social_media_youtube = updateData.socialMediaYoutube || null;
    if (updateData.councilId !== undefined)
      dbUpdateData.council_id = updateData.councilId;

    dbUpdateData.updated_at = new Date().toISOString();

    const { data: deputy, error } = await supabase
      .from("deputy_profiles")
      .update(dbUpdateData)
      .eq("id", deputyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update deputy profile: ${error.message}`);
    }

    return { deputy, message: "Deputy profile updated successfully" };
  });

/**
 * Delete deputy profile (convert back to regular user)
 */
export const deleteDeputyAction = actionClient
  .schema(z.object({ deputyId: z.string().uuid() }))
  .action(async ({ parsedInput: { deputyId } }) => {
    const supabase = await createSupabaseUserServerComponentClient();

    const { error } = await supabase
      .from("deputy_profiles")
      .delete()
      .eq("id", deputyId);

    if (error) {
      throw new Error(`Failed to delete deputy profile: ${error.message}`);
    }

    return { message: "Deputy profile deleted successfully" };
  });

/**
 * Get councils list for dropdown
 */
export const getCouncilsAction = actionClient.action(async () => {
  const supabase = await createSupabaseUserServerComponentClient();

  const { data: councils, error } = await supabase
    .from("councils")
    .select("id, name_ar, name_en, code")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch councils: ${error.message}`);
  }

  return { councils: councils || [] };
});

