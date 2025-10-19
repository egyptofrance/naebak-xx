"use server";
import { authActionClient } from "@/lib/safe-action";
import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import {
  serverGetLoggedInUserVerified
} from "@/utils/server/serverGetLoggedInUser";
import type { AuthUserMetadata } from "@/utils/zod-schemas/authUserMetadata";
import { completeProfileSchema, updateCompleteProfileSchema } from "@/utils/zod-schemas/profile";
import { revalidatePath } from "next/cache";
import { refreshSessionAction } from "./session";

// Get all governorates for dropdown
export const getGovernorates = async () => {
  const supabase = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("governorates")
    .select("*")
    .order("name_ar", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

// Get all parties for dropdown
export const getParties = async () => {
  const supabase = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("parties")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

// Get complete user profile
export const getCompleteUserProfile = async (userId: string) => {
  const supabase = await createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select(`
      *,
      governorate:governorates(id, name_ar, name_en, code),
      party:parties(id, name_ar, name_en, logo_url)
    `)
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Update complete user profile action
export const updateCompleteProfileAction = authActionClient
  .schema(updateCompleteProfileSchema)
  .action(async ({ parsedInput }) => {
    const supabaseClient = await createSupabaseUserServerActionClient();
    const user = await serverGetLoggedInUserVerified();

    const {
      fullName,
      email,
      phone,
      governorateId,
      city,
      electoralDistrict,
      gender,
      district,
      village,
      address,
      jobTitle,
      partyId,
      avatarUrl,
      isOnboardingFlow,
    } = parsedInput;

    // Build update object with only provided fields
    const updateData: any = {};
    
    if (fullName !== undefined) updateData.full_name = fullName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (governorateId !== undefined) updateData.governorate_id = governorateId;
    if (city !== undefined) updateData.city = city;
    if (electoralDistrict !== undefined) updateData.electoral_district = electoralDistrict;
    if (gender !== undefined) updateData.gender = gender;
    if (district !== undefined) updateData.district = district;
    if (village !== undefined) updateData.village = village;
    if (address !== undefined) updateData.address = address;
    if (jobTitle !== undefined) updateData.job_title = jobTitle;
    if (partyId !== undefined) updateData.party_id = partyId;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

    const { data, error } = await supabaseClient
      .from("user_profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`فشل تحديث البروفايل: ${error.message}`);
    }

    if (isOnboardingFlow) {
      const updateUserMetadataPayload: Partial<AuthUserMetadata> = {
        onboardingHasCompletedProfile: true,
      };

      const updateUserMetadataResponse = await supabaseClient.auth.updateUser({
        data: updateUserMetadataPayload,
      });

      if (updateUserMetadataResponse.error) {
        throw new Error(updateUserMetadataResponse.error.message);
      }

      await refreshSessionAction();
    }

    revalidatePath("/", "layout");
    return data;
  });

// Create complete user profile action (for initial registration)
export const createCompleteProfileAction = authActionClient
  .schema(completeProfileSchema)
  .action(async ({ parsedInput }) => {
    const supabaseClient = await createSupabaseUserServerActionClient();
    const user = await serverGetLoggedInUserVerified();

    const {
      fullName,
      email,
      phone,
      governorateId,
      city,
      electoralDistrict,
      gender,
      district,
      village,
      address,
      jobTitle,
      partyId,
      avatarUrl,
      isOnboardingFlow,
    } = parsedInput;

    const { data, error } = await supabaseClient
      .from("user_profiles")
      .update({
        full_name: fullName,
        email,
        phone,
        governorate_id: governorateId,
        city,
        electoral_district: electoralDistrict,
        gender,
        district,
        village,
        address,
        job_title: jobTitle,
        party_id: partyId,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`فشل إنشاء البروفايل: ${error.message}`);
    }

    if (isOnboardingFlow) {
      const updateUserMetadataPayload: Partial<AuthUserMetadata> = {
        onboardingHasCompletedProfile: true,
      };

      const updateUserMetadataResponse = await supabaseClient.auth.updateUser({
        data: updateUserMetadataPayload,
      });

      if (updateUserMetadataResponse.error) {
        throw new Error(updateUserMetadataResponse.error.message);
      }

      await refreshSessionAction();
    }

    revalidatePath("/", "layout");
    return data;
  });

