"use server";

import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";
import { revalidatePath } from "next/cache";

export async function rateDeputy(deputyId: string, rating: number) {
  const supabase = await createSupabaseUserServerActionClient();

  // Validate rating
  if (rating < 1 || rating > 5) {
    return { success: false, error: "التقييم يجب أن يكون بين 1 و 5 نجوم" };
  }

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "يجب تسجيل الدخول أولاً" };
  }

  try {
    // Get user profile to ensure it exists
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return { success: false, error: "لم يتم العثور على ملف المستخدم" };
    }

    // Upsert rating (insert or update if exists)
    const { error: upsertError } = (await supabase
      .from("deputy_ratings" as any)
      .upsert(
        {
          deputy_id: deputyId,
          user_id: user.id,
          rating: rating,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "deputy_id,user_id",
        }
      )) as any;

    if (upsertError) {
      console.error("[rateDeputy] Upsert error:", upsertError);
      return { success: false, error: "فشل حفظ التقييم" };
    }

    // Revalidate the deputy page
    revalidatePath(`/deputy/[slug]`, "page");
    revalidatePath(`/deputies`, "page");

    return { success: true };
  } catch (error) {
    console.error("[rateDeputy] Exception:", error);
    return { success: false, error: "حدث خطأ أثناء حفظ التقييم" };
  }
}

