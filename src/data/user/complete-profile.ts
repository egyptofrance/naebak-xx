"use server";

import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { actionClient } from "@/lib/safe-action";
import {
  completeProfileSchema,
  updateCompleteProfileSchema,
} from "@/utils/zod-schemas/profile";
import { revalidatePath } from "next/cache";

/**
 * Get all governorates from the database
 */
export async function getGovernorates() {
  const supabase = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("governorates")
    .select("*")
    .order("name_ar", { ascending: true });

  if (error) {
    console.error("Error fetching governorates:", error);
    return [];
  }

  return data || [];
}

/**
 * Get all active parties from the database
 */
export async function getParties() {
  const supabase = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("parties")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching parties:", error);
    return [];
  }

  return data || [];
}

/**
 * Get complete user profile with all fields
 */
export async function getCompleteUserProfile() {
  const supabase = await createSupabaseUserServerComponentClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

/**
 * Update complete user profile
 */
export const updateCompleteProfileAction = actionClient
  .schema(updateCompleteProfileSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseUserServerComponentClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { isOnboardingFlow, ...profileData } = parsedInput;

    // Map the fields to database column names
    const updateData: Record<string, any> = {};
    
    if (profileData.fullName !== undefined) updateData.full_name = profileData.fullName;
    if (profileData.email !== undefined) updateData.email = profileData.email;
    if (profileData.phone !== undefined) updateData.phone = profileData.phone;
    if (profileData.governorateId !== undefined) updateData.governorate_id = profileData.governorateId;
    if (profileData.city !== undefined) updateData.city = profileData.city;
    if (profileData.electoralDistrictId !== undefined) updateData.electoral_district_id = profileData.electoralDistrictId;
    if (profileData.gender !== undefined) updateData.gender = profileData.gender;
    if (profileData.district !== undefined) updateData.district = profileData.district;
    if (profileData.village !== undefined) updateData.village = profileData.village;
    if (profileData.address !== undefined) updateData.address = profileData.address;
    if (profileData.jobTitle !== undefined) updateData.job_title = profileData.jobTitle;
    if (profileData.partyId !== undefined) updateData.party_id = profileData.partyId;
    if (profileData.avatarUrl !== undefined) updateData.avatar_url = profileData.avatarUrl;

    const { error } = await supabase
      .from("user_profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      throw new Error("Failed to update profile");
    }

    revalidatePath("/");

    return {
      success: true,
      isOnboardingFlow,
    };
  });

/**
 * Create complete user profile
 */
export const createCompleteProfileAction = actionClient
  .schema(completeProfileSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createSupabaseUserServerComponentClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { isOnboardingFlow, ...profileData } = parsedInput;

    // Map the fields to database column names
    const insertData = {
      id: user.id,
      full_name: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
      governorate_id: profileData.governorateId,
      city: profileData.city,
      electoral_district_id: profileData.electoralDistrictId,
      gender: profileData.gender,
      district: profileData.district,
      village: profileData.village,
      address: profileData.address,
      job_title: profileData.jobTitle,
      party_id: profileData.partyId,
      avatar_url: profileData.avatarUrl,
    };

    const { error } = await supabase
      .from("user_profiles")
      .insert(insertData);

    if (error) {
      console.error("Error creating profile:", error);
      throw new Error("Failed to create profile");
    }

    revalidatePath("/");

    return {
      success: true,
      isOnboardingFlow,
    };
  });
