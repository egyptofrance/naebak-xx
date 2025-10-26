"use server";

import { adminActionClient } from "@/lib/safe-action";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Get current banner
export const getCurrentBannerAction = adminActionClient
  .schema(z.object({}))
  .action(async () => {
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

    const { data, error } = await supabase
      .from("site_banner")
      .select("*")
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw new Error(error.message);
    }

    return data || { image_url: "/images/sisi-banner.jpg" };
  });

// Upload banner image to Supabase Storage
export const uploadBannerImageAction = adminActionClient
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

    // Convert base64 to buffer
    const base64Data = input.fileData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `banner-${timestamp}-${input.fileName}`;

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

    // Update or insert banner record
    const { data: existingBanner } = await supabase
      .from("site_banner")
      .select("id")
      .single();

    if (existingBanner) {
      // Update existing
      const { error: updateError } = await supabase
        .from("site_banner")
        .update({
          image_url: publicUrl,
          updated_at: new Date().toISOString(),
          updated_by: ctx.userId,
        })
        .eq("id", existingBanner.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from("site_banner")
        .insert({
          image_url: publicUrl,
          created_by: ctx.userId,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    revalidatePath("/");
    revalidatePath("/app_admin/banner");

    return { imageUrl: publicUrl, message: "تم رفع الصورة وتحديث البانر بنجاح" };
  });
