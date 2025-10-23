"use server";
// Force rebuild - Updated search functionality

import { actionClient } from "@/lib/safe-action";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema for searching users
const searchUsersSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});

// Schema for creating deputy profile
const createDeputySchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  deputyStatus: z.enum(["current", "candidate", "former"]),
});

// Schema for updating deputy profile
const updateDeputySchema = z.object({
  deputyId: z.string().uuid("Invalid deputy ID"),
  deputyStatus: z.enum(["current", "candidate", "former"]).optional(),
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
  // New required fields
  councilType: z.enum(["parliament", "senate", "local"]).optional(),
  gender: z.enum(["male", "female"]).optional(),
  governorate: z.string().optional(),
});

/**
 * Search for users by name, email, or phone with governorate and party information
 */
export const searchUsersForDeputyAction = actionClient
  .schema(searchUsersSchema)
  .action(async ({ parsedInput: { query } }) => {
    console.log('[searchUsersForDeputy] Query:', query);
    const supabase = await createSupabaseUserServerComponentClient();

    // Step 1: Get all user profiles (simple fetch, no complex queries)
    const { data: allProfiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(1000);

    if (profilesError) {
      console.error('[searchUsersForDeputy] Error:', profilesError);
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    // Step 2: Get all user emails
    const { data: allSettings, error: settingsError } = await supabase
      .from("user_application_settings")
      .select("id, email_readonly")
      .limit(1000);

    if (settingsError) {
      console.error('[searchUsersForDeputy] Error:', settingsError);
      throw new Error(`Failed to fetch settings: ${settingsError.message}`);
    }

    // Step 3: Create email lookup
    const emailMap = new Map(allSettings?.map(s => [s.id, s.email_readonly]) || []);

    // Step 4: Simple client-side filtering (no complex SQL)
    const queryLower = query.toLowerCase();
    const filteredUsers = allProfiles?.filter(profile => {
      const email = emailMap.get(profile.id) || '';
      const fullName = profile.full_name || '';
      const phone = profile.phone || '';
      
      return (
        fullName.toLowerCase().includes(queryLower) ||
        email.toLowerCase().includes(queryLower) ||
        phone.toLowerCase().includes(queryLower)
      );
    }) || [];

    console.log('[searchUsersForDeputy] Matched:', filteredUsers.length);

    if (filteredUsers.length === 0) {
      return { users: [] };
    }

    // Get governorates and parties
    const governorateIds = [...new Set(filteredUsers.map(u => u.governorate_id).filter(Boolean))] as string[];
    const partyIds = [...new Set(filteredUsers.map(u => u.party_id).filter(Boolean))] as string[];

    const { data: governorates } = await supabase
      .from("governorates")
      .select("*")
      .in("id", governorateIds);

    const { data: parties } = await supabase
      .from("parties")
      .select("*")
      .in("id", partyIds);

    // Check which users are already deputies
    const userIds = filteredUsers.map((u) => u.id);
    const { data: existingDeputies } = await supabase
      .from("deputy_profiles")
      .select("user_id")
      .in("user_id", userIds);

    const deputyUserIds = new Set(existingDeputies?.map((d) => d.user_id) || []);

    // Create lookup maps
    const governorateMap = new Map(governorates?.map(g => [g.id, g]) || []);
    const partyMap = new Map(parties?.map(p => [p.id, p]) || []);

    // Merge data with email from our map
    const usersWithDetails = filteredUsers.map((user) => ({
      ...user,
      email: emailMap.get(user.id) || null,
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
    console.log("[createDeputyAction] Starting with:", { userId, deputyStatus });
    
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
      // No need to check if user exists - we already have the user in the list
      console.log("[createDeputyAction] Processing user:", userId);

      // Check if deputy profile already exists
      console.log("[createDeputyAction] Checking if deputy profile exists...");
      const { data: existingDeputy } = await supabase
        .from("deputy_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingDeputy) {
        console.log("[createDeputyAction] User is already a deputy");
        throw new Error("هذا المستخدم نائب بالفعل");
      }

      // Step 1: Add "deputy" role to user_roles
      console.log("[createDeputyAction] Adding deputy role...");
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "deputy",
        })
        .select()
        .single();

      if (roleError) {
        console.error("[createDeputyAction] Failed to add role:", roleError);
        throw new Error(`فشل إضافة دور النائب: ${roleError.message}`);
      }

      console.log("[createDeputyAction] Role added successfully:", roleData);

      // Step 2: Create deputy profile
      console.log("[createDeputyAction] Creating deputy profile...");
      const { data: deputy, error: deputyError } = await supabase
        .from("deputy_profiles")
        .insert({
          user_id: userId,
          deputy_status: "current", // Always set to 'current' when promoting
        })
        .select()
        .single();

      if (deputyError) {
        console.error("[createDeputyAction] Failed to create deputy profile:", deputyError);
        // Rollback: remove the role if deputy profile creation fails
        await supabase
          .from("user_roles")
          .delete()
          .eq("id", roleData.id);
        
        throw new Error(`فشل إنشاء ملف النائب: ${deputyError.message}`);
      }

      console.log("[createDeputyAction] Deputy profile created successfully:", deputy);

      // Revalidate the deputies page
      revalidatePath('/app_admin/deputies');

      return { 
        deputy, 
        role: roleData,
        message: `تم ترقية المستخدم إلى نائب بنجاح` 
      };
    } catch (error) {
      console.error("[createDeputyAction] Error:", error);
      throw error;
    }
  });

/**
 * Update deputy profile
 */
export const updateDeputyAction = actionClient
  .schema(updateDeputySchema)
  .action(async ({ parsedInput }) => {
    const { deputyId, ...updateData } = parsedInput;
    
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

    // Map camelCase to snake_case for database
    const dbUpdateData: any = {};
    if (updateData.deputyStatus !== undefined) dbUpdateData.deputy_status = updateData.deputyStatus;
    if (updateData.bio !== undefined) dbUpdateData.bio = updateData.bio;
    if (updateData.officeAddress !== undefined) dbUpdateData.office_address = updateData.officeAddress;
    if (updateData.officePhone !== undefined) dbUpdateData.office_phone = updateData.officePhone;
    if (updateData.officeHours !== undefined) dbUpdateData.office_hours = updateData.officeHours;
    if (updateData.electoralSymbol !== undefined) dbUpdateData.electoral_symbol = updateData.electoralSymbol;
    if (updateData.electoralNumber !== undefined) dbUpdateData.electoral_number = updateData.electoralNumber;
    if (updateData.electoralProgram !== undefined) dbUpdateData.electoral_program = updateData.electoralProgram;
    if (updateData.achievements !== undefined) dbUpdateData.achievements = updateData.achievements;
    if (updateData.events !== undefined) dbUpdateData.events = updateData.events;
    if (updateData.websiteUrl !== undefined) dbUpdateData.website_url = updateData.websiteUrl;
    if (updateData.socialMediaFacebook !== undefined) dbUpdateData.social_media_facebook = updateData.socialMediaFacebook;
    if (updateData.socialMediaTwitter !== undefined) dbUpdateData.social_media_twitter = updateData.socialMediaTwitter;
    if (updateData.socialMediaInstagram !== undefined) dbUpdateData.social_media_instagram = updateData.socialMediaInstagram;
    if (updateData.socialMediaYoutube !== undefined) dbUpdateData.social_media_youtube = updateData.socialMediaYoutube;
    if (updateData.councilId !== undefined) dbUpdateData.council_id = updateData.councilId;
    // New fields
    if (updateData.councilType !== undefined) dbUpdateData.council_type = updateData.councilType;
    if (updateData.gender !== undefined) dbUpdateData.gender = updateData.gender;
    if (updateData.governorate !== undefined) dbUpdateData.governorate = updateData.governorate;

    const { data: deputy, error } = await supabase
      .from("deputy_profiles")
      .update(dbUpdateData)
      .eq("id", deputyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update deputy profile: ${error.message}`);
    }

    return { deputy, message: "تم تحديث بيانات النائب بنجاح" };
  });

// Schema for searching deputies
const searchDeputiesSchema = z.object({
  query: z.string().optional(),
  governorateId: z.string().uuid().optional(),
  partyId: z.string().uuid().optional(),
  councilId: z.string().uuid().optional(),
  deputyStatus: z.enum(["current", "candidate", "former"]).optional(),
  gender: z.enum(["male", "female"]).optional(),
  electoralDistrict: z.string().optional(),
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
      gender,
      electoralDistrict,
      page = 1,
      limit = 20,
    } = parsedInput;

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

    // Filter by gender
    if (gender) {
      userQuery = userQuery.eq("gender", gender);
    }

    // Filter by electoral district
    if (electoralDistrict) {
      userQuery = userQuery.ilike("electoral_district", `%${electoralDistrict}%`);
    }

    // Text search in user fields
    if (query) {
      userQuery = userQuery.or(
        `full_name.ilike.*${query}*,phone.ilike.*${query}*,email.ilike.*${query}*`
      );
    }

    const { data: users, error: userError } = await userQuery;

    if (userError) {
      throw new Error(`Failed to fetch user profiles: ${userError.message}`);
    }

    // Get related data
    const governorateIds = [...new Set(users?.map(u => u.governorate_id).filter(Boolean) || [])] as string[];
    const partyIds = [...new Set(users?.map(u => u.party_id).filter(Boolean) || [])] as string[];
    const councilIds = [...new Set(deputies.map(d => d.council_id).filter(Boolean))] as string[];

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

    const totalPages = Math.ceil((count || 0) / limit);

    return { 
      deputies: deputiesWithDetails, 
      total: count || 0, 
      totalPages,
      currentPage: page,
      page, 
      limit 
    };
  });



/**
 * Get all councils
 */
export const getCouncilsAction = actionClient.action(async () => {
  const supabase = await createSupabaseUserServerComponentClient();

  const { data: councils, error } = await supabase
    .from("councils")
    .select("*")
    .order("name_ar", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch councils: ${error.message}`);
  }

  return { councils: councils || [] };
});



// Schema for deleting a single deputy
const deleteDeputySchema = z.object({
  deputyId: z.string().uuid("Invalid deputy ID"),
});

// Schema for bulk deleting deputies
const bulkDeleteDeputiesSchema = z.object({
  deputyIds: z.array(z.string().uuid()).min(1, "At least one deputy ID is required"),
});

/**
 * Delete a single deputy
 * Removes deputy profile, role, and optionally the user account
 */
export const deleteDeputyAction = actionClient
  .schema(deleteDeputySchema)
  .action(async ({ parsedInput: { deputyId } }) => {
    console.log("[deleteDeputyAction] Starting delete for:", deputyId);
    
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
      // Get deputy profile to find user_id
      const { data: deputy, error: fetchError } = await supabase
        .from("deputy_profiles")
        .select("user_id")
        .eq("id", deputyId)
        .single();

      if (fetchError || !deputy) {
        throw new Error("النائب غير موجود");
      }

      const userId = deputy.user_id;

      // Step 1: Delete from deputy_electoral_programs
      await supabase
        .from("deputy_electoral_programs")
        .delete()
        .eq("deputy_id", deputyId);

      // Step 2: Delete from deputy_achievements
      await supabase
        .from("deputy_achievements")
        .delete()
        .eq("deputy_id", deputyId);

      // Step 3: Delete from deputy_events
      await supabase
        .from("deputy_events")
        .delete()
        .eq("deputy_id", deputyId);

      // Step 4: Delete deputy profile
      const { error: deleteProfileError } = await supabase
        .from("deputy_profiles")
        .delete()
        .eq("id", deputyId);

      if (deleteProfileError) {
        throw new Error(`فشل حذف ملف النائب: ${deleteProfileError.message}`);
      }

      // Step 5: Remove deputy role
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "deputy");

      console.log("[deleteDeputyAction] Deputy deleted successfully");
      
      // Revalidate the deputies page to refresh the UI
      revalidatePath('/app_admin/deputies');
      
      return { 
        success: true,
        message: "تم حذف النائب بنجاح" 
      };
    } catch (error) {
      console.error("[deleteDeputyAction] Error:", error);
      throw error;
    }
  });

/**
 * Bulk delete deputies
 */
export const bulkDeleteDeputiesAction = actionClient
  .schema(bulkDeleteDeputiesSchema)
  .action(async ({ parsedInput: { deputyIds } }) => {
    console.log("[bulkDeleteDeputiesAction] Starting bulk delete for:", deputyIds.length, "deputies");
    
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
      // Get all deputy profiles to find user_ids
      const { data: deputies, error: fetchError } = await supabase
        .from("deputy_profiles")
        .select("id, user_id")
        .in("id", deputyIds);

      if (fetchError || !deputies) {
        throw new Error("فشل في جلب بيانات النواب");
      }

      const userIds = deputies.map(d => d.user_id);

      // Step 1: Delete from deputy_electoral_programs
      await supabase
        .from("deputy_electoral_programs")
        .delete()
        .in("deputy_id", deputyIds);

      // Step 2: Delete from deputy_achievements
      await supabase
        .from("deputy_achievements")
        .delete()
        .in("deputy_id", deputyIds);

      // Step 3: Delete from deputy_events
      await supabase
        .from("deputy_events")
        .delete()
        .in("deputy_id", deputyIds);

      // Step 4: Delete deputy profiles
      const { error: deleteProfilesError } = await supabase
        .from("deputy_profiles")
        .delete()
        .in("id", deputyIds);

      if (deleteProfilesError) {
        throw new Error(`فشل حذف ملفات النواب: ${deleteProfilesError.message}`);
      }

      // Step 5: Remove deputy roles
      await supabase
        .from("user_roles")
        .delete()
        .in("user_id", userIds)
        .eq("role", "deputy");

      console.log("[bulkDeleteDeputiesAction] Bulk delete completed successfully");
      
      // Revalidate the deputies page to refresh the UI
      revalidatePath('/app_admin/deputies');
      
      return { 
        success: true,
        count: deputyIds.length,
        message: `تم حذف ${deputyIds.length} نائب بنجاح` 
      };
    } catch (error) {
      console.error("[bulkDeleteDeputiesAction] Error:", error);
      throw error;
    }
  });

