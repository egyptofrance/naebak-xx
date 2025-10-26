"use server";

import { authActionClient } from "@/lib/safe-action";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Get current deputy banner
export const getDeputyBannerAction = authActionClient
  .schema(z.object({}))
  .action(async ({ ctx }) => {
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
      .select("id, banner_image, slug")
      .eq("user_id", ctx.userId)
      .single();

    if (profileError) {
      throw new Error("لم يتم العثور على ملف النائب");
    }

    return {
      deputyId: profile.id,
      bannerImage: profile.banner_image || null,
      slug: profile.slug
    };
  });

// Upload deputy banner image to Supabase Storage
export const uploadDeputyBannerAction = authActionClient
  .schema(
    z.object({
      fileData: z.string(), // base64 encoded file
      fileName: z.string(),
      fileType: z.string(),
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

    // Convert base64 to buffer
    const base64Data = input.fileData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename with deputy folder structure
    const timestamp = Date.now();
    const fileName = `deputy-banners/${profile.id}/banner-${timestamp}-${input.fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('public-user-assets')
      .upload(fileName, buffer, {
        contentType: input.fileType,
        upsert: false
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('public-user-assets')
      .getPublicUrl(fileName);

    // Update deputy profile with new banner
    const { error: updateError } = await supabase
      .from("deputy_profiles")
      .update({
        banner_image: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // Revalidate deputy public profile pages
    revalidatePath(`/deputy/${profile.slug}`);
    revalidatePath(`/deputy/${profile.id}`);
    revalidatePath("/[locale]/(authenticated)/deputy-banner");

    return { imageUrl: publicUrl, message: "تم رفع الصورة وتحديث البانر بنجاح" };
  });

