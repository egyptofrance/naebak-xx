"use server";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import { userRoles } from "@/utils/userTypes";
import { cache } from "react";
import { isSupabaseUserAppAdmin } from "../isSupabaseUserAppAdmin";

// make sure to return one of UserRoles
export const serverGetUserType = cache(async () => {
  try {
    const supabase = await createSupabaseUserServerComponentClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return userRoles.ANON;
    }

    if (isSupabaseUserAppAdmin(user)) {
      return userRoles.ADMIN;
    }

    // Check if user is a deputy
    const { data: deputyData } = await supabase
      .from("deputy_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (deputyData) {
      return userRoles.DEPUTY;
    }

    // Check if user is a manager
    const { data: managerData } = await supabase
      .from("manager_permissions")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (managerData) {
      return userRoles.MANAGER;
    }

    return userRoles.USER;
  } catch (error) {
    return userRoles.ANON;
  }
});
