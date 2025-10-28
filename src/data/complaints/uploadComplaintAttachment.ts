"use server";

import { authActionClient } from "@/lib/safe-action";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const uploadComplaintAttachmentAction = authActionClient
  .schema(
    z.object({
      complaintId: z.string(),
      fileData: z.string(), // base64 encoded file
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
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
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = input.fileName.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${ext}`;
    const filePath = `${ctx.userId}/${input.complaintId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('complaint_attachments')
      .upload(filePath, buffer, {
        contentType: input.fileType,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`فشل رفع الملف: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('complaint_attachments')
      .getPublicUrl(filePath);

    // Save metadata to database
    const { error: dbError } = await supabase
      .from('complaint_attachments')
      .insert({
        complaint_id: input.complaintId,
        file_name: input.fileName,
        file_path: filePath,
        file_size: input.fileSize,
        file_type: input.fileType,
        uploaded_by: ctx.userId,
      });

    if (dbError) {
      // If database insert fails, try to delete the uploaded file
      await supabase.storage
        .from('complaint_attachments')
        .remove([filePath]);
      
      throw new Error(`فشل حفظ بيانات الملف: ${dbError.message}`);
    }

    return { 
      success: true, 
      filePath,
      publicUrl,
      message: `تم رفع ${input.fileName} بنجاح` 
    };
  });

