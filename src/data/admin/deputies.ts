"use server";
// Force rebuild - Updated search functionality

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
 * Search for users by name, email, or phone with governorate and party information
 */
export const searchUsersAction = actionClient
  .schema(searchUsersSchema)
  .action(async ({ parsedInput: { query } }) => {
    const supabase = await createSupabaseUserServerComponentClient();

    // Search in user_profiles
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("*")
      .or(`full_name.ilike.*${query}*,email.ilike.*${query}*,phone.ilike.*${query}*`)
      .limit(20);

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }

    if (!users || users.length === 0) {
      return { users: [] };
    }

    // Get governorates and parties for these users
    const governorateIds = [...new Set(users.map(u => u.governorate_id).filter(Boolean))];
    const partyIds = [...new Set(users.map(u => u.party_id).filter(Boolean))];

    const { data: governorates } = await supabase
      .from("governorates")
      .select("*")
      .in("id", governorateIds);

    const { data: parties } = await supabase
      .from("parties")
      .select("*")
      .in("id", partyIds);

    // Check which users are already deputies
    const userIds = users.map((u) => u.id);
    const { data: existingDeputies } = await supabase
      .from("deputy_profiles")
      .select("user_id")
      .in("user_id", userIds);

    const deputyUserIds = new Set(existingDeputies?.map((d) => d.user_id) || []);

    // Create lookup maps
    const governorateMap = new Map(governorates?.map(g => [g.id, g]) || []);
    const partyMap = new Map(parties?.map(p => [p.id, p]) || []);

    // Merge data
    const usersWithDetails = users.map((user) => ({
      ...user,
      governorates: user.governorate_id ? governorateMap.get(user.governorate_id) : null,
      parties: user.party_id ? partyMap.get(user.party_id) : null,
      isDeputy: deputyUserIds.has(user.id),
    }));

    return { users: usersWithDetails };
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
 * Update deputy profile
 */
export const updateDeputyAction = actionClient
  .schema(updateDeputySchema)
  .action(async ({ parsedInput }) => {
    const { deputyId, ...updateData } = parsedInput;
    const supabase = await createSupabaseUserServerComponentClient();

    const { data: deputy, error } = await supabase
      .from("deputy_profiles")
      .update(updateData)
      .eq("id", deputyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update deputy profile: ${error.message}`);
    }

    return { deputy, message: "Deputy profile updated successfully" };
  });

// Schema for searching deputies
const searchDeputiesSchema = z.object({
  query: z.string().optional(),
  governorateId: z.string().uuid().optional(),
  partyId: z.string().uuid().optional(),
  councilId: z.string().uuid().optional(),
  deputyStatus: z.enum(["active", "inactive"]).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const searchDeputiesAction = actionClient
  .schema(searchDeputiesSchema)
  .action(async ({ parsedInput }) => {
    const {
      query = "",
      governorateId,
      partyId,
      councilId,
      deputyStatus,
      page = 1,
      limit = 20,
    } = parsedInput;

    const supabase = await createSupabaseUserServerComponentClient();

    // Get all deputy profiles with optional filters
    let deputyQuery = supabase
      .from("deputy_profiles")
      .select("*", { count: "exact" });

    // Filter by deputy status
    if (deputyStatus) {
      deputyQuery = deputyQuery.eq("deputy_status", deputyStatus);
    }

    // Filter by council
    if (councilId) {
      deputyQuery = deputyQuery.eq("council_id", councilId);
    }

    // Text search in deputy fields
    if (query) {
      deputyQuery = deputyQuery.or(
        `electoral_symbol.ilike.*${query}*,electoral_number.ilike.*${query}*`
      );
    }

    const { data: deputies, error: deputyError, count } = await deputyQuery
      .range((page - 1) * limit, page * limit - 1)
      .order("created_at", { ascending: false });

    if (deputyError) {
      throw new Error(`Failed to search deputies: ${deputyError.message}`);
    }

    if (!deputies || deputies.length === 0) {
      return { deputies: [], total: 0, page, limit };
    }

    // Get user profiles for these deputies
    const userIds = deputies.map(d => d.user_id);
    let userQuery = supabase
      .from("user_profiles")
      .select("*")
      .in("id", userIds);

    // Filter by governorate
    if (governorateId) {
      userQuery = userQuery.eq("governorate_id", governorateId);
    }

    // Filter by party
    if (partyId) {
      userQuery = userQuery.eq("party_id", partyId);
    }

    // Text search in user fields
    if (query) {
      userQuery = userQuery.or(
        `full_name.ilike.*${query}*,email.ilike.*${query}*,phone.ilike.*${query}*`
      );
    }

    const { data: users, error: userError } = await userQuery;

    if (userError) {
      throw new Error(`Failed to fetch user profiles: ${userError.message}`);
    }

    // Get related data
    const governorateIds = [...new Set(users?.map(u => u.governorate_id).filter(Boolean) || [])];
    const partyIds = [...new Set(users?.map(u => u.party_id).filter(Boolean) || [])];
    const councilIds = [...new Set(deputies.map(d => d.council_id).filter(Boolean))];

    const [
      { data: governorates },
      { data: parties },
      { data: councils }
    ] = await Promise.all([
      supabase.from("governorates").select("*").in("id", governorateIds),
      supabase.from("parties").select("*").in("id", partyIds),
      supabase.from("councils").select("*").in("id", councilIds),
    ]);

    // Create lookup maps
    const userMap = new Map(users?.map(u => [u.id, u]) || []);
    const governorateMap = new Map(governorates?.map(g => [g.id, g]) || []);
    const partyMap = new Map(parties?.map(p => [p.id, p]) || []);
    const councilMap = new Map(councils?.map(c => [c.id, c]) || []);

    // Merge all data
    const deputiesWithDetails = deputies
      .map((deputy) => {
        const user = userMap.get(deputy.user_id);
        if (!user) return null; // Skip if user not found (filtered out)
        
        return {
          ...deputy,
          user_profiles: {
            ...user,
            governorates: user.governorate_id ? governorateMap.get(user.governorate_id) : null,
            parties: user.party_id ? partyMap.get(user.party_id) : null,
          },
          councils: deputy.council_id ? councilMap.get(deputy.council_id) : null,
        };
      })
      .filter(Boolean); // Remove nulls

    return { 
      deputies: deputiesWithDetails, 
      total: count || 0, 
      page, 
      limit 
    };
  });

