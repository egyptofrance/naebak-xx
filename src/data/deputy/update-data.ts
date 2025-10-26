"use server";

import { authActionClient } from "@/lib/safe-action";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Update deputy additional data (bio, office info, social media, etc.)
 */
export const updateDeputyDataAction = authActionClient
  .schema(
    z.object({
      deputyStatus: z.enum(["current", "candidate", "former"]).optional(),
      electoralSymbol: z.string().optional(),
      electoralNumber: z.string().optional(),
      bio: z.string().optional(),
      officeAddress: z.string().optional(),
      officePhone: z.string().optional(),
      officeHours: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      youtube: z.string().optional(),
      tiktok: z.string().optional(),
      website: z.string().optional(),
    })
  )
  .action(async ({ parsedInput: input, ctx }) => {
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

    // Get deputy profile
    const { data: profile, error: profileError } = await supabase
      .from("deputy_profiles")
      .select("id, slug")
      .eq("user_id", ctx.userId)
      .single();

    if (profileError) {
      throw new Error("لم يتم العثور على ملف النائب");
    }

    // Update deputy profile
    const { error: updateError } = await supabase
      .from("deputy_profiles")
      .update({
        deputy_status: input.deputyStatus,
        electoral_symbol: input.electoralSymbol,
        electoral_number: input.electoralNumber,
        bio: input.bio,
        office_address: input.officeAddress,
        office_phone: input.officePhone,
        office_hours: input.officeHours,
        social_media_facebook: input.facebook,
        social_media_twitter: input.twitter,
        social_media_instagram: input.instagram,
        social_media_youtube: input.youtube,
        social_media_tiktok: input.tiktok,
        website: input.website,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Revalidate deputy pages
    revalidatePath(`/deputy/${profile.slug}`);
    revalidatePath(`/deputy/${profile.id}`);
    revalidatePath("/[locale]/(authenticated)/deputy-data");

    return { 
      success: true,
      message: "تم حفظ التغييرات بنجاح" 
    };
  });

