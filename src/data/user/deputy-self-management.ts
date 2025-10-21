"use server";

import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Schema for deputy basic data update
 */
const deputyDataSchema = z.object({
  deputy_status: z.enum(["current", "candidate", "former"]).optional(),
  electoral_symbol: z.string().optional(),
  electoral_number: z.string().optional(),
  bio: z.string().optional(),
  office_address: z.string().optional(),
  office_phone: z.string().optional(),
  office_hours: z.string().optional(),
  social_media_facebook: z.string().optional(),
  social_media_twitter: z.string().optional(),
  social_media_instagram: z.string().optional(),
  social_media_youtube: z.string().optional(),
  social_media_tiktok: z.string().optional(),
  website: z.string().optional(),
});

/**
 * Update deputy's own basic data
 */
export async function updateDeputyDataAction(data: z.infer<typeof deputyDataSchema>) {
  try {
    const supabase = await createSupabaseUserServerActionClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        message: "غير مصرح لك بهذا الإجراء",
      };
    }

    // Validate data
    const validatedData = deputyDataSchema.parse(data);

    // Update deputy profile
    const { error: updateError } = await supabase
      .from("deputy_profiles")
      .update(validatedData)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating deputy data:", updateError);
      return {
        success: false,
        message: "فشل تحديث البيانات",
      };
    }

    revalidatePath("/user/deputy-data");
    
    return {
      success: true,
      message: "تم تحديث البيانات بنجاح",
    };
  } catch (error) {
    console.error("Error in updateDeputyDataAction:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء تحديث البيانات",
    };
  }
}

/**
 * Update deputy's electoral program
 */
export async function updateElectoralProgramAction(electoralProgram: string) {
  try {
    const supabase = await createSupabaseUserServerActionClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        message: "غير مصرح لك بهذا الإجراء",
      };
    }

    const { error: updateError } = await supabase
      .from("deputy_profiles")
      .update({ electoral_program: electoralProgram })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating electoral program:", updateError);
      return {
        success: false,
        message: "فشل تحديث البرنامج الانتخابي",
      };
    }

    revalidatePath("/user/electoral-program");
    
    return {
      success: true,
      message: "تم تحديث البرنامج الانتخابي بنجاح",
    };
  } catch (error) {
    console.error("Error in updateElectoralProgramAction:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء تحديث البرنامج الانتخابي",
    };
  }
}

/**
 * Update deputy's achievements
 */
export async function updateAchievementsAction(achievements: string) {
  try {
    const supabase = await createSupabaseUserServerActionClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        message: "غير مصرح لك بهذا الإجراء",
      };
    }

    const { error: updateError } = await supabase
      .from("deputy_profiles")
      .update({ achievements })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating achievements:", updateError);
      return {
        success: false,
        message: "فشل تحديث الإنجازات",
      };
    }

    revalidatePath("/user/achievements");
    
    return {
      success: true,
      message: "تم تحديث الإنجازات بنجاح",
    };
  } catch (error) {
    console.error("Error in updateAchievementsAction:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء تحديث الإنجازات",
    };
  }
}

/**
 * Update deputy's events
 */
export async function updateEventsAction(events: string) {
  try {
    const supabase = await createSupabaseUserServerActionClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        message: "غير مصرح لك بهذا الإجراء",
      };
    }

    const { error: updateError } = await supabase
      .from("deputy_profiles")
      .update({ events })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error updating events:", updateError);
      return {
        success: false,
        message: "فشل تحديث المناسبات",
      };
    }

    revalidatePath("/user/events");
    
    return {
      success: true,
      message: "تم تحديث المناسبات بنجاح",
    };
  } catch (error) {
    console.error("Error in updateEventsAction:", error);
    return {
      success: false,
      message: "حدث خطأ أثناء تحديث المناسبات",
    };
  }
}

