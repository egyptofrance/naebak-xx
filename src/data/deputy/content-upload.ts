"use server";

import { authActionClient } from "@/lib/safe-action";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

/**
 * Upload image for deputy content (electoral program, achievements, events)
 * Similar to banner upload but for content items
 */
export const uploadDeputyContentImageAction = authActionClient
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
      .select("id")
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
    const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `deputy-content/${profile.id}/${timestamp}-${sanitizedFileName}`;

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

    return { 
      imageUrl: publicUrl, 
      message: "تم رفع الصورة بنجاح" 
    };
  });

