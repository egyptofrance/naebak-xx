"use server";

import { authActionClient } from "@/lib/safe-action";
import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateDisplayNameSchema = z.object({
  displayName: z.string().max(100).nullable(),
});

export const updateDisplayNameAction = authActionClient
  .schema(updateDisplayNameSchema)
  .action(async ({ parsedInput: { displayName }, ctx: { userId } }) => {
    const supabase = await createSupabaseUserServerActionClient();

    // Get deputy profile
    const { data: deputyProfile, error: fetchError } = await supabase
      .from("deputy_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (fetchError || !deputyProfile) {
      throw new Error("لم يتم العثور على ملف النائب");
    }

    // Update display_name
    const { error: updateError } = await supabase
      .from("deputy_profiles")
      .update({ display_name: displayName })
      .eq("id", deputyProfile.id);

    if (updateError) {
      throw new Error("فشل تحديث اسم العرض");
    }

    // Revalidate relevant paths
    revalidatePath("/settings");
    revalidatePath("/deputies");

    return {
      success: true,
      message: "تم تحديث اسم العرض بنجاح",
    };
  });

